"use client";

import { ZatsugakuCard } from "@/components/ZatsugakuCard";
import { ZatsugakuCardSkeleton } from "@/components/ZatsugakuCardSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getSimilarityDescription } from "@/lib/similarity-config";
import { Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function SimilarZatsugaku({ currentContent, excludeId, showSearchButton = false }) {
    const { user, loading: authLoading } = useAuth();
    const [similarItems, setSimilarItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const findSimilar = useCallback(async () => {
        if (!user) {
            setHasSearched(true);
            return;
        }

        if (!currentContent?.trim()) {
            toast.error("検索するテキストが入力されていません");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/similar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: currentContent,
                    excludeId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("ログインしていないため、類似検索機能は利用できません");
                    return;
                }
                throw new Error(result.error || "Failed to search similar items");
            }

            setSimilarItems(result.data || []);
            setHasSearched(true);
        } catch (error) {
            console.error("Error searching similar items:", error);
            toast.error("似ている雑学の検索に失敗しました");
        } finally {
            setLoading(false);
        }
    }, [currentContent, excludeId, user]);

    // 自動検索（詳細ページ用）
    useEffect(() => {
        if (excludeId && currentContent && !hasSearched && !authLoading) {
            findSimilar();
        }
    }, [excludeId, currentContent, hasSearched, findSimilar, authLoading]);

    if (excludeId && !hasSearched && (!loading || authLoading)) {
        return null; // 自動検索中または未実行時は表示しない
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        似ている雑学
                    </CardTitle>
                    {showSearchButton && (
                        <Button onClick={findSimilar} disabled={loading || !currentContent?.trim() || !user} variant="outline" size="sm">
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    検索中...
                                </>
                            ) : (
                                <>
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {hasSearched ? "再検索" : "似た雑学を探す"}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, index) => (
                            <ZatsugakuCardSkeleton key={index} />
                        ))}
                    </div>
                )}

                {!loading && hasSearched && similarItems.length === 0 && (
                    <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        {!user ? (
                            <>
                                <p className="text-gray-500">ログインしていないため、類似検索機能は利用できません</p>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500">似ている雑学が見つかりませんでした</p>
                                {showSearchButton && <p className="text-sm text-gray-400 mt-2">異なるキーワードで試してみてください</p>}
                            </>
                        )}
                    </div>
                )}

                {!loading && similarItems.length > 0 && (
                    <div className="space-y-4">
                        {similarItems.map((item) => (
                            <div key={item.id} className="relative">
                                <ZatsugakuCard zatsugaku={item} />
                                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                    {getSimilarityDescription(item.similarity)} ({(item.similarity * 100).toFixed(1)}%)
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !hasSearched && !excludeId && showSearchButton && (
                    <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">雑学の内容を入力してから、似た雑学を検索できます</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

"use client";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ZatsugakuDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, supabase } = useAuth();
    const [zatsugaku, setZatsugaku] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchZatsugaku = async () => {
            try {
                const { data, error } = await supabase.from("zatsugaku").select("*").eq("id", params.id).single();

                if (error) throw error;
                setZatsugaku(data);
            } catch (error) {
                console.error("Error fetching zatsugaku:", error);
                toast.error("雑学の取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchZatsugaku();
    }, [params.id, supabase]);

    const handleDelete = async () => {
        if (!confirm("この雑学を削除しますか？")) return;

        try {
            const { error } = await supabase.from("zatsugaku").delete().eq("id", params.id);

            if (error) throw error;

            toast.success("雑学を削除しました");
            router.push("/");
        } catch (error) {
            toast.error("削除に失敗しました");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("ja-JP", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-gray-500">読み込み中...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!zatsugaku) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-gray-500">雑学が見つかりませんでした</p>
                        <Link href="/">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                ホームに戻る
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <Link href="/">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                ホームに戻る
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl">詳細</CardTitle>
                                {user && (
                                    <div className="flex space-x-2">
                                        <Link href={`/zatsugaku/${zatsugaku.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="w-4 h-4 mr-2" />
                                                編集
                                            </Button>
                                        </Link>
                                        <Button variant="outline" size="sm" onClick={handleDelete}>
                                            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                                            削除
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">内容</h3>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{zatsugaku.content}</p>
                            </div>

                            {zatsugaku.source && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">情報源</h3>
                                        <p className="text-gray-600">{zatsugaku.source}</p>
                                    </div>
                                </>
                            )}

                            <Separator />
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>作成日時: {formatDate(zatsugaku.created_at)}</p>
                                <p>最終更新: {formatDate(zatsugaku.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

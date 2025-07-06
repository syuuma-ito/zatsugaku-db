"use client";

import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { TagSelector } from "@/components/TagSelector";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ZatsugakuCard } from "@/components/ZatsugakuCard";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SearchPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const { supabase } = useAuth();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const searchZatsugaku = async () => {
            if (!query && selectedTags.length === 0) return;

            setLoading(true);
            try {
                let supabaseQuery = supabase.from("zatsugaku").select(`
                        *,
                        zatsugaku_tags (
                            tags (
                                id,
                                name,
                                color
                            )
                        )
                    `);

                // テキスト検索（本文のみ）
                if (query) {
                    supabaseQuery = supabaseQuery.ilike("content", `%${query}%`);
                }

                // タグフィルター
                if (selectedTags.length > 0) {
                    const tagIds = selectedTags.map((tag) => tag.id);

                    // まず、指定されたタグを持つ雑学のIDを取得
                    const { data: tagFilterData, error: tagFilterError } = await supabase.from("zatsugaku_tags").select("zatsugaku_id").in("tag_id", tagIds);

                    if (tagFilterError) throw tagFilterError;

                    const zatsugakuIds = tagFilterData?.map((item) => item.zatsugaku_id) || [];

                    if (zatsugakuIds.length > 0) {
                        supabaseQuery = supabaseQuery.in("id", zatsugakuIds);
                    } else {
                        // タグに一致する雑学がない場合は空の結果を返す
                        setSearchResults([]);
                        setLoading(false);
                        return;
                    }
                }

                const { data, error } = await supabaseQuery.order("created_at", { ascending: false });

                if (error) throw error;

                // タグデータを整形
                const zatsugakuWithTags = (data || []).map((item) => ({
                    ...item,
                    tags: item.zatsugaku_tags?.map((tagItem) => tagItem.tags) || [],
                }));

                setSearchResults(zatsugakuWithTags);
            } catch (error) {
                // エラーログは開発環境でのみ出力
                if (process.env.NODE_ENV === "development") {
                    console.error("Error searching zatsugaku:", error);
                }
                // 検索エラーの場合は空の結果を表示
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        searchZatsugaku();
    }, [query, selectedTags, supabase]);

    const handleDelete = (id) => {
        setSearchResults((prev) => prev.filter((item) => item.id !== id));
    };

    const clearFilters = () => {
        setSelectedTags([]);
    };

    const hasActiveFilters = query || selectedTags.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">雑学を検索</h1>

                    {/* 検索フォーム */}
                    <div className="mb-6">
                        <SearchForm initialQuery={query} />
                    </div>

                    {/* フィルター */}
                    <div className="mb-6">
                        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4" />
                                        詳細フィルター
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4">
                                <div className="bg-white p-4 rounded-lg border">
                                    <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} allowCreate={false} />
                                    {selectedTags.length > 0 && (
                                        <div className="mt-4 flex justify-end">
                                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                                フィルターをクリア
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    {/* 検索結果 */}
                    {hasActiveFilters && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">検索結果 ({searchResults.length}件)</h2>
                            </div>

                            {hasActiveFilters && (
                                <div className="text-sm text-gray-500 mb-4">
                                    {query && `キーワード: "${query}"`}
                                    {query && selectedTags.length > 0 && " + "}
                                    {selectedTags.length > 0 && (
                                        <span>{selectedTags.length === 1 ? `タグ: "${selectedTags[0].name}"` : `タグ: ${selectedTags.map((tag) => `"${tag.name}"`).join(", ")}`}</span>
                                    )}
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">検索中...</p>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">検索結果が見つかりませんでした</p>
                                    <p className="text-gray-400 mt-2">キーワードやタグを変更してお試しください</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {searchResults.map((zatsugaku) => (
                                        <ZatsugakuCard key={zatsugaku.id} zatsugaku={zatsugaku} onDelete={handleDelete} />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {!hasActiveFilters && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">検索キーワードを入力するか、タグを選択してください</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main className="container mx-auto px-4 py-8">
                        <div className="text-center">
                            <p className="text-gray-500">読み込み中...</p>
                        </div>
                    </main>
                </div>
            }
        >
            <SearchPageContent />
        </Suspense>
    );
}

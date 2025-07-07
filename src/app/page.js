"use client";

import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { ZatsugakuCard } from "@/components/ZatsugakuCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
    const { supabase } = useAuth();
    const [recentZatsugaku, setRecentZatsugaku] = useState([]);
    const [randomZatsugaku, setRandomZatsugaku] = useState(null);
    const [loading, setLoading] = useState(true);
    const [randomLoading, setRandomLoading] = useState(true);

    useEffect(() => {
        const fetchRecentZatsugaku = async () => {
            try {
                const { data, error } = await supabase
                    .from("zatsugaku")
                    .select(
                        `
                        *,
                        zatsugaku_tags (
                            tags (
                                id,
                                name,
                                color
                            )
                        )
                    `
                    )
                    .order("created_at", { ascending: false })
                    .limit(6);

                if (error) throw error;

                // タグデータを整形
                const zatsugakuWithTags = (data || []).map((item) => ({
                    ...item,
                    tags: item.zatsugaku_tags?.map((tagItem) => tagItem.tags) || [],
                }));

                setRecentZatsugaku(zatsugakuWithTags);
            } catch (error) {
                // エラーログは開発環境でのみ出力
                if (process.env.NODE_ENV === "development") {
                    console.error("Error fetching recent zatsugaku:", error);
                }
                // エラーの場合は空の配列を設定
                setRecentZatsugaku([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchRandomZatsugaku = async () => {
            try {
                // まず総数を取得
                const { count, error: countError } = await supabase.from("zatsugaku").select("*", { count: "exact", head: true });

                if (countError) throw countError;

                if (count && count > 0) {
                    // ランダムなインデックスを生成
                    const randomIndex = Math.floor(Math.random() * count);

                    // ランダムな雑学を取得
                    const { data, error } = await supabase
                        .from("zatsugaku")
                        .select(
                            `
                            *,
                            zatsugaku_tags (
                                tags (
                                    id,
                                    name,
                                    color
                                )
                            )
                        `
                        )
                        .range(randomIndex, randomIndex);

                    if (error) throw error;

                    if (data && data.length > 0) {
                        // タグデータを整形
                        const zatsugakuWithTags = {
                            ...data[0],
                            tags: data[0].zatsugaku_tags?.map((tagItem) => tagItem.tags) || [],
                        };
                        setRandomZatsugaku(zatsugakuWithTags);
                    }
                }
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error fetching random zatsugaku:", error);
                }
            } finally {
                setRandomLoading(false);
            }
        };

        fetchRecentZatsugaku();
        fetchRandomZatsugaku();
    }, [supabase]);

    const handleDelete = (id) => {
        setRecentZatsugaku((prev) => prev.filter((item) => item.id !== id));
        // ランダム雑学が削除された場合は、それも除去
        if (randomZatsugaku && randomZatsugaku.id === id) {
            setRandomZatsugaku(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* ヒーローセクション */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">雑学データベース</h1>

                    {/* 検索フォーム */}
                    <div className="max-w-md mx-auto mb-6">
                        <SearchForm />
                    </div>

                    {/* 新規追加ボタン */}
                    <Link href="/zatsugaku/new">
                        <Button className="mb-8">
                            <Plus className="w-4 h-4 mr-2" />
                            新しい雑学を追加
                        </Button>
                    </Link>
                </div>

                {/* ランダム雑学セクション */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ランダムで一件表示</h2>

                    {randomLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">読み込み中...</p>
                        </div>
                    ) : randomZatsugaku ? (
                        <div className="max-w-md mx-auto">
                            <ZatsugakuCard zatsugaku={randomZatsugaku} onDelete={handleDelete} />
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">雑学が見つかりませんでした</p>
                        </div>
                    )}
                </section>

                {/* 最近追加された雑学 */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">最近追加された雑学</h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">読み込み中...</p>
                        </div>
                    ) : recentZatsugaku.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">まだ雑学が登録されていません</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentZatsugaku.map((zatsugaku) => (
                                <ZatsugakuCard key={zatsugaku.id} zatsugaku={zatsugaku} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

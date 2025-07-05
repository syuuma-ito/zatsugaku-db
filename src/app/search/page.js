"use client";

import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { ZatsugakuCard } from "@/components/ZatsugakuCard";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const { supabase } = useAuth();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchZatsugaku = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const { data, error } = await supabase.from("zatsugaku").select("*").or(`content.ilike.%${query}%,source.ilike.%${query}%`).order("created_at", { ascending: false });

                if (error) throw error;
                setSearchResults(data || []);
            } catch (error) {
                console.error("Error searching zatsugaku:", error);
            } finally {
                setLoading(false);
            }
        };

        searchZatsugaku();
    }, [query, supabase]);

    const handleDelete = (id) => {
        setSearchResults((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">雑学を検索</h1>
                    <SearchForm initialQuery={query} />
                </div>

                {query && (
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            「{query}」の検索結果 ({searchResults.length}件)
                        </h2>

                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">検索中...</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">検索結果が見つかりませんでした</p>
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

                {!query && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">検索キーワードを入力してください</p>
                    </div>
                )}
            </main>
        </div>
    );
}

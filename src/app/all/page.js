"use client";

import { Header } from "@/components/Header";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ZatsugakuCard } from "@/components/ZatsugakuCard";
import { ZatsugakuCardSkeleton } from "@/components/ZatsugakuCardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 48;

function AllZatsugakuContent() {
    const { supabase } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [zatsugakuList, setZatsugakuList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const currentPage = parseInt(searchParams.get("page")) || 1;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    useEffect(() => {
        const fetchZatsugaku = async (page) => {
            setLoading(true);
            try {
                const from = (page - 1) * ITEMS_PER_PAGE;
                const to = from + ITEMS_PER_PAGE - 1;

                // 総数を取得
                const { count } = await supabase.from("zatsugaku").select("*", { count: "exact", head: true });

                setTotalCount(count || 0);

                // ページネーションされたデータを取得
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
                    .order("updated_at", { ascending: false })
                    .range(from, to);

                if (error) throw error;

                const transformedData = data.map((item) => ({
                    ...item,
                    tags: item.zatsugaku_tags?.map((zt) => zt.tags) || [],
                }));

                setZatsugakuList(transformedData);
            } catch (error) {
                console.error("Error fetching zatsugaku:", error);
                toast.error("雑学の取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchZatsugaku(currentPage);
    }, [currentPage, supabase]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;

        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        router.push(`/all?${params.toString()}`);
    };

    const handleZatsugakuDelete = (deletedId) => {
        setZatsugakuList((prev) => prev.filter((item) => item.id !== deletedId));
        setTotalCount((prev) => prev - 1);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // 7ページ以下なら全て表示
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // 多い場合は省略記号を使用
            pages.push(
                <PaginationItem key={1}>
                    <PaginationLink isActive={1 === currentPage} onClick={() => handlePageChange(1)}>
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (currentPage > 4) {
                pages.push(
                    <PaginationItem key="start-ellipsis">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            const startPage = Math.max(2, currentPage - 2);
            const endPage = Math.min(totalPages - 1, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (currentPage < totalPages - 3) {
                pages.push(
                    <PaginationItem key="end-ellipsis">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            if (totalPages > 1) {
                pages.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink isActive={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        }

        return pages;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">全ての雑学</h1>
                        <p className="text-gray-600">{totalCount.toLocaleString()}件</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                            <ZatsugakuCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <>
                        {zatsugakuList.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">雑学がまだありません</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {zatsugakuList.map((zatsugaku) => (
                                    <ZatsugakuCard key={zatsugaku.id} zatsugaku={zatsugaku} onDelete={handleZatsugakuDelete} />
                                ))}
                            </div>
                        )}

                        {/* ページネーション */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                                        </PaginationItem>

                                        {renderPageNumbers()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default function AllZatsugakuPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white">
                    <Header />
                    <main className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">全ての雑学</h1>
                                <p className="text-gray-600">読み込み中...</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                                <ZatsugakuCardSkeleton key={index} />
                            ))}
                        </div>
                    </main>
                </div>
            }
        >
            <AllZatsugakuContent />
        </Suspense>
    );
}

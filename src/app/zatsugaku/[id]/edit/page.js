"use client";

import { Header } from "@/components/Header";
import { ZatsugakuForm } from "@/components/ZatsugakuForm";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditZatsugakuPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading, supabase } = useAuth();
    const [zatsugaku, setZatsugaku] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchZatsugaku = async () => {
            try {
                const { data, error } = await supabase.from("zatsugaku").select("*").eq("id", params.id).single();

                if (error) {
                    if (error.code === "PGRST116") {
                        // データが見つからない場合
                        setZatsugaku(null);
                    } else {
                        throw error;
                    }
                } else {
                    setZatsugaku(data);
                }
            } catch (error) {
                // エラーログは開発環境でのみ出力
                if (process.env.NODE_ENV === "development") {
                    console.error("Error fetching zatsugaku:", error);
                }
                toast.error("雑学の取得に失敗しました");
            } finally {
                setDataLoading(false);
            }
        };

        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchZatsugaku();
        }
    }, [user, loading, params.id, router, supabase]);

    if (loading || dataLoading) {
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

    if (!user) {
        return null;
    }

    if (!zatsugaku) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-gray-500">雑学が見つかりませんでした</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <ZatsugakuForm initialData={zatsugaku} isEdit={true} />
            </main>
        </div>
    );
}

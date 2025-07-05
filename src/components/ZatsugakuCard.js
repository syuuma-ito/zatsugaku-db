"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function ZatsugakuCard({ zatsugaku, onDelete }) {
    const { user, supabase } = useAuth();

    const handleDelete = async () => {
        if (!confirm("この雑学を削除しますか？")) return;

        try {
            const { error } = await supabase.from("zatsugaku").delete().eq("id", zatsugaku.id);

            if (error) throw error;

            toast.success("雑学を削除しました");
            onDelete(zatsugaku.id);
        } catch (error) {
            toast.error("削除に失敗しました");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent>
                <p className="text-gray-700 mb-3 line-clamp-3">{zatsugaku.content}</p>
                <p className="text-xs text-gray-400 mt-2">最終更新: {formatDate(zatsugaku.updated_at)}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link href={`/zatsugaku/${zatsugaku.id}`}>
                    <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        詳細
                    </Button>
                </Link>

                {user && (
                    <div className="flex space-x-2">
                        <Link href={`/zatsugaku/${zatsugaku.id}/edit`}>
                            <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

"use client";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function ZatsugakuCard({ zatsugaku, onDelete }) {
    const { user, supabase } = useAuth();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const { error } = await supabase.from("zatsugaku").delete().eq("id", zatsugaku.id);

            if (error) throw error;

            toast.success("雑学を削除しました");
            onDelete(zatsugaku.id);
        } catch (error) {
            // エラーログは開発環境でのみ出力
            if (process.env.NODE_ENV === "development") {
                console.error("Delete error:", error);
            }
            toast.error("削除に失敗しました");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            });
        } catch (error) {
            return "日付不明";
        }
    };

    return (
        <>
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
                            <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="雑学を削除"
                description="この雑学を削除しますか？この操作は取り消すことができません。"
                confirmText={isDeleting ? "削除中..." : "削除"}
                cancelText="キャンセル"
            />
        </>
    );
}

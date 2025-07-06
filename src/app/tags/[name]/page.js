"use client";

import ColorPicker from "@/components/ColorPicker";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Header } from "@/components/Header";
import { ZatsugakuCard } from "@/components/ZatsugakuCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getTextColor } from "@/lib/utils";
import { ArrowLeft, Edit, Hash, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TagDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, supabase } = useAuth();
    const [zatsugaku, setZatsugaku] = useState([]);
    const [tag, setTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", color: "#c7c7c7" });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchTagAndZatsugaku = async () => {
            try {
                const decodedTagName = decodeURIComponent(params.name);

                // タグ名でタグを検索
                const { data: tagData, error: tagError } = await supabase.from("tags").select("*").eq("name", decodedTagName).single();

                if (tagError) {
                    if (tagError.code === "PGRST116") {
                        // タグが見つからない場合
                        setTag(null);
                        setZatsugaku([]);
                        setLoading(false);
                        return;
                    }
                    throw tagError;
                }

                setTag(tagData);
                setEditData({ name: tagData.name, color: tagData.color || "#c7c7c7" });

                // そのタグが付いている雑学を取得
                const { data, error } = await supabase
                    .from("zatsugaku_tags")
                    .select(
                        `
                        zatsugaku_id,
                        zatsugaku (
                            *,
                            zatsugaku_tags (
                                tags (
                                    id,
                                    name,
                                    color
                                )
                            )
                        )
                    `
                    )
                    .eq("tag_id", tagData.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                // タグデータを整形
                const zatsugakuWithTags = (data || []).map((item) => ({
                    ...item.zatsugaku,
                    tags: item.zatsugaku.zatsugaku_tags?.map((tagItem) => tagItem.tags) || [],
                }));

                setZatsugaku(zatsugakuWithTags);
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error fetching tag and zatsugaku:", error);
                }
                toast.error("データの取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchTagAndZatsugaku();
    }, [params.name, supabase]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editData.name.trim()) {
            toast.error("タグ名を入力してください");
            return;
        }

        try {
            const { error } = await supabase
                .from("tags")
                .update({
                    name: editData.name.trim(),
                    color: editData.color,
                })
                .eq("id", tag.id);

            if (error) throw error;

            setTag({ ...tag, name: editData.name.trim(), color: editData.color });
            setIsEditing(false);
            toast.success("タグを更新しました");

            // URLを更新（ページ遷移なしで）
            window.history.replaceState(null, "", `/tags/${encodeURIComponent(editData.name.trim())}`);
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error updating tag:", error);
            }
            toast.error("タグの更新に失敗しました");
        }
    };

    const handleCancel = () => {
        setEditData({ name: tag.name, color: tag.color || "#c7c7c7" });
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const { error } = await supabase.from("tags").delete().eq("id", tag.id);

            if (error) throw error;

            toast.success("タグを削除しました");
            router.push("/tags");
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error deleting tag:", error);
            }
            toast.error("タグの削除に失敗しました");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    const handleDelete = (id) => {
        setZatsugaku((prev) => prev.filter((item) => item.id !== id));
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

    if (!tag) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <p className="text-gray-500">タグが見つかりませんでした</p>
                        <Link href="/tags">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                タグ一覧に戻る
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <Header />

                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <Link href="/tags">
                                <Button variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    タグ一覧に戻る
                                </Button>
                            </Link>
                        </div>

                        {/* タグ情報 */}
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-2xl flex items-center gap-3">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <ColorPicker color={editData.color} onColorChange={(color) => setEditData({ ...editData, color })} />
                                                <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} maxLength={50} />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-8 h-8 rounded" style={{ backgroundColor: tag.color || "#c7c7c7" }} />
                                                <span>#{tag.name}</span>
                                            </>
                                        )}
                                    </CardTitle>
                                    {user && (
                                        <div className="flex space-x-2">
                                            {isEditing ? (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={handleSave}>
                                                        <Save className="w-4 h-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">保存</span>
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={handleCancel}>
                                                        <X className="w-4 h-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">キャンセル</span>
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={handleEdit}>
                                                        <Edit className="w-4 h-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">編集</span>
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4 sm:mr-2" />
                                                        <span className="hidden sm:inline">削除</span>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Badge
                                            variant="secondary"
                                            style={{
                                                backgroundColor: tag.color || "#c7c7c7",
                                                color: getTextColor(tag.color || "#c7c7c7"),
                                            }}
                                        >
                                            {zatsugaku.length}件の雑学
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 雑学一覧 */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">#{tag.name} に関連する雑学</h2>
                        </div>

                        {zatsugaku.length === 0 ? (
                            <div className="text-center py-12">
                                <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">このタグの雑学は見つかりませんでした</p>
                                <p className="text-gray-400 mt-2">他のタグを試してみてください</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {zatsugaku.map((item) => (
                                    <ZatsugakuCard key={item.id} zatsugaku={item} onDelete={handleDelete} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="タグを削除"
                description={`タグ「${tag.name}」を削除しますか？この操作は取り消すことができません。`}
                confirmText={isDeleting ? "削除中..." : "削除"}
                cancelText="キャンセル"
            />
        </>
    );
}

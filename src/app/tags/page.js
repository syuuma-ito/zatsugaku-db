"use client";

import ColorPicker from "@/components/ColorPicker";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getTextColor } from "@/lib/utils";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TagsPage() {
    const { supabase } = useAuth();
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#c7c7c7");
    const [editingTag, setEditingTag] = useState(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("#c7c7c7");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingTagId, setDeletingTagId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data, error } = await supabase
                    .from("tags")
                    .select(
                        `
                        *,
                        zatsugaku_tags (
                            zatsugaku_id
                        )
                    `
                    )
                    .order("name");

                if (error) throw error;

                // 各タグの雑学数を計算
                const tagsWithCount = (data || []).map((tag) => ({
                    ...tag,
                    zatsugakuCount: tag.zatsugaku_tags?.length || 0,
                }));

                setTags(tagsWithCount);
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error fetching tags:", error);
                }
                toast.error("タグの取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [supabase]);

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        try {
            setCreating(true);
            const { data, error } = await supabase
                .from("tags")
                .insert([
                    {
                        name: newTagName.trim(),
                        color: newTagColor,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setTags([...tags, data]);
            setNewTagName("");
            setNewTagColor("#c7c7c7");
            toast.success("タグを作成しました");
        } catch (error) {
            console.error("タグの作成に失敗しました:", error);
            toast.error("タグの作成に失敗しました");
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTag || !editName.trim()) return;

        try {
            const { error } = await supabase
                .from("tags")
                .update({
                    name: editName.trim(),
                    color: editColor,
                })
                .eq("id", editingTag.id);

            if (error) throw error;

            setTags(tags.map((tag) => (tag.id === editingTag.id ? { ...tag, name: editName.trim(), color: editColor } : tag)));

            setEditingTag(null);
            setEditName("");
            setEditColor("#c7c7c7");
            toast.success("タグを更新しました");
        } catch (error) {
            console.error("タグの更新に失敗しました:", error);
            toast.error("タグの更新に失敗しました");
        }
    };

    const handleDeleteClick = (tagId) => {
        setDeletingTagId(tagId);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTagId) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase.from("tags").delete().eq("id", deletingTagId);

            if (error) throw error;

            setTags(tags.filter((tag) => tag.id !== deletingTagId));
            toast.success("タグを削除しました");
        } catch (error) {
            console.error("タグの削除に失敗しました:", error);
            toast.error("タグの削除に失敗しました");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setDeletingTagId(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setDeletingTagId(null);
    };

    const startEditing = (tag) => {
        setEditingTag(tag);
        setEditName(tag.name);
        setEditColor(tag.color);
    };

    const cancelEditing = () => {
        setEditingTag(null);
        setEditName("");
        setEditColor("#c7c7c7");
    };

    const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <Header />

                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">タグ一覧</h1>
                            <p className="text-gray-600">すべてのタグとその使用回数を表示します</p>
                        </div>

                        {/* 検索 */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input placeholder="タグを検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>

                        {/* 新規タグ作成 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>新しいタグを作成</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input placeholder="タグ名" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="flex-1" disabled={creating} />
                                    <ColorPicker color={newTagColor} onColorChange={setNewTagColor} disabled={creating} />
                                    <Button onClick={handleCreateTag} disabled={!newTagName.trim() || creating}>
                                        <Plus size={16} className="mr-2" />
                                        作成
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* タグ一覧 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>タグ一覧 ({filteredTags.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredTags.length > 0 ? (
                                    <div className="grid gap-4">
                                        {filteredTags.map((tag) => (
                                            <div key={tag.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                {editingTag?.id === tag.id ? (
                                                    // 編集モード
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                                                        <ColorPicker color={editColor} onColorChange={setEditColor} />
                                                        <Button onClick={handleUpdateTag} size="sm" disabled={!editName.trim()}>
                                                            保存
                                                        </Button>
                                                        <Button onClick={cancelEditing} variant="outline" size="sm">
                                                            キャンセル
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // 表示モード
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <Badge
                                                                style={{
                                                                    backgroundColor: tag.color,
                                                                    color: getTextColor(tag.color),
                                                                }}
                                                                className="text-sm px-3 py-1"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/tags/${encodeURIComponent(tag.name)}`}>
                                                                <Button variant="outline" size="sm">
                                                                    詳細
                                                                </Button>
                                                            </Link>
                                                            <Button onClick={() => startEditing(tag)} variant="outline" size="sm">
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button onClick={() => handleDeleteClick(tag.id)} variant="destructive" size="sm">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">{searchTerm ? "検索結果がありません" : "タグがありません"}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="タグを削除"
                description="このタグを削除しますか？関連する雑学からも削除されます。この操作は取り消すことができません。"
                confirmText={isDeleting ? "削除中..." : "削除"}
                cancelText="キャンセル"
            />
        </>
    );
}

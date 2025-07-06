"use client";

import ColorPicker from "@/components/ColorPicker";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getTextColor } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TagsPage() {
    const { user, supabase } = useAuth();
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#c7c7c7");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTags();
    }, [supabase]);

    const fetchTags = async () => {
        try {
            setLoading(true);
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

            // 雑学数を計算
            const tagsWithCount = (data || []).map((tag) => ({
                ...tag,
                zatsugakuCount: tag.zatsugaku_tags?.length || 0,
            }));

            setTags(tagsWithCount);
        } catch (error) {
            console.error("タグの取得に失敗しました:", error);
            toast.error("タグの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    };

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

            // 新しく作成したタグに雑学数0を追加
            const newTagWithCount = { ...data, zatsugakuCount: 0 };
            setTags([...tags, newTagWithCount]);
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
                <main className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="text-center mt-4 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">タグ一覧</h1>
                    </div>

                    {/* 検索 */}
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input placeholder="タグを検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>

                    {/* 新規タグ作成 */}
                    {user && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>新しいタグを作成</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <ColorPicker color={newTagColor} onColorChange={setNewTagColor} disabled={creating} />
                                    <Input placeholder="タグ名" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="flex-1" disabled={creating} />
                                    <Button onClick={handleCreateTag} disabled={!newTagName.trim() || creating}>
                                        <Plus size={16} className="mr-2" />
                                        作成
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* タグ一覧 */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">タグ一覧 ({filteredTags.length})</h2>
                        {filteredTags.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTags.map((tag) => (
                                    <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent>
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge
                                                        style={{
                                                            backgroundColor: tag.color,
                                                            color: getTextColor(tag.color),
                                                        }}
                                                        className="text-sm px-3 py-1"
                                                    >
                                                        #{tag.name}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">{tag.zatsugakuCount}件の雑学</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">{searchTerm ? "検索結果がありません" : "タグがありません"}</div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

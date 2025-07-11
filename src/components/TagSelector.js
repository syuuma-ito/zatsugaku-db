"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getTextColor } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ColorPicker from "./ColorPicker";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function TagSelector({ selectedTags = [], onTagsChange, allowCreate = true }) {
    const { supabase } = useAuth();
    const [allTags, setAllTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#c7c7c7");
    const [loading, setLoading] = useState(false);
    const [creatingTag, setCreatingTag] = useState(false);

    // 全タグを取得
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data, error } = await supabase.from("tags").select("*").order("name");

                if (error) throw error;
                setAllTags(data || []);
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error fetching tags:", error);
                }
                toast.error("タグの取得に失敗しました");
            }
        };

        fetchTags();
    }, [supabase]);

    // タグを選択/選択解除
    const toggleTag = (tag) => {
        const isSelected = selectedTags.some((selectedTag) => selectedTag.id === tag.id);

        if (isSelected) {
            onTagsChange(selectedTags.filter((selectedTag) => selectedTag.id !== tag.id));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    // 新しいタグを作成
    const createTag = async () => {
        if (!newTagName.trim()) return;

        const tagName = newTagName.trim();

        // 既存のタグかチェック
        if (allTags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase())) {
            toast.error("このタグは既に存在します");
            return;
        }

        setCreatingTag(true);
        try {
            const { data, error } = await supabase
                .from("tags")
                .insert([{ name: tagName, color: newTagColor }])
                .select()
                .single();

            if (error) throw error;

            setAllTags([...allTags, data]);
            onTagsChange([...selectedTags, data]);
            setNewTagName("");
            setNewTagColor("#c7c7c7"); // デフォルト色にリセット
            toast.success("タグを作成しました");
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error creating tag:", error);
            }
            toast.error("タグの作成に失敗しました");
        } finally {
            setCreatingTag(false);
        }
    };

    // 選択されたタグを削除
    const removeTag = (tagToRemove) => {
        onTagsChange(selectedTags.filter((tag) => tag.id !== tagToRemove.id));
    };

    // 選択されていないタグのみを表示
    const availableTags = allTags.filter((tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id));

    return (
        <div className="space-y-4 border p-4 rounded-lg border-gray-400">
            <Label>選択されたタグ ({selectedTags.length} 個)</Label>

            {/* 選択されたタグの表示 */}
            {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="px-3 py-1 rounded-full text-sm border border-gray-300 hover:border-gray-500 transition-colors"
                            style={{
                                backgroundColor: tag.color || "#c7c7c7",
                                color: getTextColor(tag.color || "#c7c7c7"),
                            }}
                        >
                            #{tag.name}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="m-16"></div>
            )}

            {/* 利用可能なタグの選択 */}
            <div className="">
                <h4 className="text-sm font-medium mb-3">タグ一覧</h4>
                {availableTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {availableTags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="px-3 py-1 rounded-full text-sm border border-gray-300 hover:border-gray-500 transition-colors"
                                style={{
                                    backgroundColor: tag.color || "#c7c7c7",
                                    color: getTextColor(tag.color || "#c7c7c7"),
                                }}
                            >
                                #{tag.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 mb-4">すべてのタグが選択されています</div>
                )}

                {/* 新しいタグの作成（allowCreateがtrueの場合のみ表示） */}
                {allowCreate && (
                    <div className="border-t pt-3">
                        <h4 className="text-sm font-medium mb-2">新しいタグを作成</h4>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <ColorPicker color={newTagColor} onColorChange={setNewTagColor} disabled={creatingTag} />
                                <Input
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="新しいタグ名"
                                    maxLength={50}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            createTag();
                                        }
                                    }}
                                />
                                <Button type="button" size="sm" onClick={createTag} disabled={!newTagName.trim() || creatingTag}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

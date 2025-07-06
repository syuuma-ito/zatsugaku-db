"use client";

import { TagSelector } from "@/components/TagSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeHtml } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ZatsugakuForm({ initialData = null, isEdit = false }) {
    const router = useRouter();
    const { supabase } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        content: initialData?.content || "",
        source: initialData?.source || "",
    });
    const [selectedTags, setSelectedTags] = useState(initialData?.tags || []);

    // 初期データがある場合、タグを取得
    useEffect(() => {
        if (initialData?.id) {
            fetchZatsugakuTags(initialData.id);
        }
    }, [initialData?.id]);

    const fetchZatsugakuTags = async (zatsugakuId) => {
        try {
            const { data, error } = await supabase
                .from("zatsugaku_tags")
                .select(
                    `
                    tag_id,
                    tags (
                        id,
                        name,
                        color
                    )
                `
                )
                .eq("zatsugaku_id", zatsugakuId);

            if (error) throw error;

            const tags = data.map((item) => item.tags);
            setSelectedTags(tags);
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error fetching zatsugaku tags:", error);
            }
        }
    };

    // 入力検証関数
    const validateInput = (data) => {
        const errors = [];

        // コンテンツの検証
        if (!data.content.trim()) {
            errors.push("雑学の内容を入力してください");
        } else if (data.content.length > 10000) {
            errors.push("雑学の内容は10,000文字以内で入力してください");
        }

        // 情報源の検証
        if (data.source && data.source.length > 2000) {
            errors.push("情報源は2,000文字以内で入力してください");
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 入力検証
        const errors = validateInput(formData);
        if (errors.length > 0) {
            errors.forEach((error) => toast.error(error));
            return;
        }

        setLoading(true);
        try {
            // データをサニタイズ
            const sanitizedData = {
                content: sanitizeHtml(formData.content.trim()),
                source: formData.source ? sanitizeHtml(formData.source.trim()) : null,
            };

            if (isEdit) {
                // 雑学を更新
                const { error: updateError } = await supabase
                    .from("zatsugaku")
                    .update({
                        content: sanitizedData.content,
                        source: sanitizedData.source,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", initialData.id);

                if (updateError) throw updateError;

                // 既存のタグを削除
                await supabase.from("zatsugaku_tags").delete().eq("zatsugaku_id", initialData.id);

                // 新しいタグを追加
                if (selectedTags.length > 0) {
                    const tagRelations = selectedTags.map((tag) => ({
                        zatsugaku_id: initialData.id,
                        tag_id: tag.id,
                    }));

                    const { error: tagError } = await supabase.from("zatsugaku_tags").insert(tagRelations);

                    if (tagError) throw tagError;
                }

                toast.success("雑学を更新しました");
                router.push(`/zatsugaku/${initialData.id}`);
            } else {
                // 新しい雑学を作成
                const { data: zatsugakuData, error: insertError } = await supabase.from("zatsugaku").insert([sanitizedData]).select().single();

                if (insertError) throw insertError;

                // タグを追加
                if (selectedTags.length > 0) {
                    const tagRelations = selectedTags.map((tag) => ({
                        zatsugaku_id: zatsugakuData.id,
                        tag_id: tag.id,
                    }));

                    const { error: tagError } = await supabase.from("zatsugaku_tags").insert(tagRelations);

                    if (tagError) throw tagError;
                }

                toast.success("雑学を追加しました");
                router.push(`/zatsugaku/${zatsugakuData.id}`);
            }
        } catch (error) {
            console.error("Database error:", error);
            toast.error(isEdit ? "更新に失敗しました" : "追加に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEdit ? "雑学を編集" : "新しい雑学を追加"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="content">雑学の内容 *</Label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            rows={6}
                            required
                            maxLength={10000}
                            placeholder="雑学の内容を入力してください（最大10,000文字）"
                        />
                        <div className="text-sm text-gray-500 mt-1">{formData.content.length}/10,000文字</div>
                    </div>

                    <div>
                        <Label htmlFor="source">情報源</Label>
                        <textarea
                            id="source"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="参考文献やWebサイトなど（最大2,000文字）"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            rows={3}
                            maxLength={2000}
                        />
                        <div className="text-sm text-gray-500 mt-1">{formData.source.length}/2,000文字</div>
                    </div>

                    <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "保存中..." : isEdit ? "更新" : "追加"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

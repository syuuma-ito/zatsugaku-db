"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ZatsugakuForm({ initialData = null, isEdit = false }) {
    const router = useRouter();
    const { supabase } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        content: initialData?.content || "",
        source: initialData?.source || "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            toast.error("雑学の内容を入力してください");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                const { error } = await supabase
                    .from("zatsugaku")
                    .update({
                        content: formData.content,
                        source: formData.source,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", initialData.id);

                if (error) throw error;
                toast.success("雑学を更新しました");
                router.push(`/zatsugaku/${initialData.id}`);
            } else {
                const { data, error } = await supabase
                    .from("zatsugaku")
                    .insert([
                        {
                            content: formData.content,
                            source: formData.source,
                        },
                    ])
                    .select();

                if (error) throw error;
                toast.success("雑学を追加しました");
                router.push(`/zatsugaku/${data[0].id}`);
            }
        } catch (error) {
            toast.error(isEdit ? "更新に失敗しました" : "追加に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
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
                        />
                    </div>

                    <div>
                        <Label htmlFor="source">情報源</Label>
                        <textarea
                            id="source"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="参考文献やWebサイトなど"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>

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

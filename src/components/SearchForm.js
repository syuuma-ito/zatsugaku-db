"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sanitizeHtml } from "@/lib/utils";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({ initialQuery = "" }) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();

        // 入力検証
        if (!trimmedQuery) {
            return;
        }

        if (trimmedQuery.length > 100) {
            return; // 検索クエリが長すぎる場合は無視
        }

        // クエリをサニタイズしてからURLエンコード
        const sanitizedQuery = sanitizeHtml(trimmedQuery);
        router.push(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        // 最大100文字まで制限
        if (value.length <= 100) {
            setQuery(value);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input value={query} onChange={handleChange} placeholder="雑学を検索..." className="flex-1" maxLength={100} />
            <Button type="submit" disabled={!query.trim()}>
                <Search className="w-4 h-4 mr-2" />
                検索
            </Button>
        </form>
    );
}

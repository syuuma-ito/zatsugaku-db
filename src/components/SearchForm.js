"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({ initialQuery = "" }) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="雑学を検索..." className="flex-1" />
            <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                検索
            </Button>
        </form>
    );
}

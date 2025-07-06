"use client";

import { Badge } from "@/components/ui/badge";
import { getTextColor } from "@/lib/utils";
import Link from "next/link";

export function TagList({ tags = [], className = "" }) {
    if (!tags || tags.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`}>
                    <Badge
                        variant="secondary"
                        className="hover:opacity-80 cursor-pointer transition-opacity"
                        style={{
                            backgroundColor: tag.color || "#c7c7c7",
                            color: getTextColor(tag.color || "#c7c7c7"),
                        }}
                    >
                        #{tag.name}
                    </Badge>
                </Link>
            ))}
        </div>
    );
}

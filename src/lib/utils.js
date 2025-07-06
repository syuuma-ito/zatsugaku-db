import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// XSS対策のためのサニタイゼーション関数
export function sanitizeHtml(text) {
    if (typeof text !== "string") return text;

    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}

// 安全なHTML表示のための関数
export function safeHtml(text) {
    if (typeof text !== "string") return text;

    // 改行を<br>タグに変換（安全な方法）
    return sanitizeHtml(text).replace(/\n/g, "<br>");
}

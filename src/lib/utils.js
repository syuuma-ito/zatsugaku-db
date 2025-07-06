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

// 色の明度を計算してテキスト色を決定
export function getTextColor(backgroundColor) {
    // 16進数カラーコードをRGBに変換
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 明度を計算（YIQ式）
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 明度が128以上なら黒、それ以下なら白
    return brightness >= 128 ? "#000000" : "#FFFFFF";
}

// プリセットカラー
export const PRESET_COLORS = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // yellow
    "#8B5CF6", // purple
    "#F97316", // orange
    "#06B6D4", // cyan
    "#EC4899", // pink
    "#84CC16", // lime
    "#6B7280", // gray
    "#DC2626", // dark red
    "#059669", // dark green
    "#D97706", // dark yellow
    "#7C3AED", // dark purple
    "#EA580C", // dark orange
];

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
    "#f28b82", // 赤: ソフトレッド（Soft Red）
    "#fbbd75", // オレンジ: アプリコット（Apricot）
    "#fff475", // 黄色: ソフトイエロー（Soft Yellow）
    "#e6ee9c", // 黄緑: ライトライム（Light Lime）
    "#b5e7a0", // 黄緑: ミントグリーン（Mint Green）
    "#81c995", // 緑: ソフトグリーン（Soft Green）
    "#a7ffeb", // 水色: ペールターコイズ（Pale Turquoise）
    "#90e0f3", // 青: ベビーブルー（Baby Blue）
    "#aecbfa", // 青: ソフトブルー（Soft Blue）
    "#c5b3f6", // 紫: ソフトバイオレット（Soft Violet）
    "#f3b0c3", // ピンク: ローズピンク（Rose Pink）

    "#f5f5f5", // グレー1: ごく淡いグレー（Very Light Gray）
    "#dcdcdc", // グレー2: ライトグレー（Light Gray）
    "#a9a9a9", // グレー3: ダークグレー（Dark Gray）
    "#696969", // グレー4: もっと暗いグレー（Darker Gray）
];

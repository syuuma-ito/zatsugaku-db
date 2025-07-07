import DOMPurify from "dompurify";

// XSS対策のためのサニタイゼーション関数
export function sanitizeHtml(text) {
    if (typeof text !== "string") return text;

    return DOMPurify.sanitize(text);
}

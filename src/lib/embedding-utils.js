/**
 * 雑学ベクトル検索関連のユーティリティ関数
 * すべてAPIエンドポイント経由でサーバーサイド処理を実行
 */

import { SIMILARITY_CONFIG } from "./similarity-config.js";

/**
 * 既存の全雑学のエンベディングを生成
 * 管理者用: 初回セットアップ時や大量データ処理時に使用
 */
export async function generateAllEmbeddings() {
    try {
        const response = await fetch("/api/embed", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("ログインしていないため、この機能は利用できません。ログインしてから再度お試しください。");
            }
            throw new Error(result.error || "Failed to generate embeddings");
        }

        return result;
    } catch (error) {
        console.error("Error generating all embeddings:", error);
        throw error;
    }
}

/**
 * 特定の雑学のエンベディングを生成
 * @param {string} zatsugakuId - 雑学ID
 * @param {string} content - 雑学内容
 */
export async function generateSingleEmbedding(zatsugakuId, content) {
    try {
        const response = await fetch("/api/embed", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                zatsugakuId,
                content,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("ログインしていないため、この機能は利用できません。ログインしてから再度お試しください。");
            }
            throw new Error(result.error || "Failed to generate embedding");
        }

        return result;
    } catch (error) {
        console.error("Error generating single embedding:", error);
        throw error;
    }
}

/**
 * 類似雑学を検索
 * @param {string} content - 検索対象の内容
 * @param {string} excludeId - 除外する雑学ID（オプション）
 * @param {number} threshold - 類似度の閾値（デフォルト: 設定ファイルの値）
 * @param {number} limit - 取得件数（デフォルト: 設定ファイルの値）
 */
export async function findSimilarZatsugaku(content, excludeId = null, threshold = SIMILARITY_CONFIG.DEFAULT_THRESHOLD, limit = SIMILARITY_CONFIG.DEFAULT_MATCH_COUNT) {
    try {
        const response = await fetch("/api/similar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                excludeId,
                threshold,
                limit,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("ログインしていないため、類似検索機能は利用できません。ログインしてから再度お試しください。");
            }
            throw new Error(result.error || "Failed to search similar items");
        }

        return result.data || [];
    } catch (error) {
        console.error("Error finding similar zatsugaku:", error);
        throw error;
    }
}

/**
 * エンベディングの統計情報を取得
 * 管理者用: データベースの状態確認
 */
export async function getEmbeddingStats(supabase) {
    try {
        // 全雑学数
        const { count: totalCount } = await supabase.from("zatsugaku").select("*", { count: "exact", head: true });

        // エンベディング済み雑学数
        const { count: embeddedCount } = await supabase.from("zatsugaku").select("*", { count: "exact", head: true }).not("embedding", "is", null);

        // エンベディング未生成雑学数
        const { count: unembeddedCount } = await supabase.from("zatsugaku").select("*", { count: "exact", head: true }).is("embedding", null);

        return {
            total: totalCount || 0,
            embedded: embeddedCount || 0,
            unembedded: unembeddedCount || 0,
            completionRate: totalCount ? (((embeddedCount || 0) / totalCount) * 100).toFixed(1) : 0,
        };
    } catch (error) {
        console.error("Error getting embedding stats:", error);
        throw error;
    }
}

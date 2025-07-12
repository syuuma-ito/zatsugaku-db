/**
 * ベクトル検索関連の設定値
 */

// 類似度の閾値設定
export const SIMILARITY_CONFIG = {
    // デフォルトの類似度閾値（0.0-1.0）
    // 環境変数で上書き可能
    DEFAULT_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.7,

    // 高精度検索用の閾値
    HIGH_PRECISION_THRESHOLD: 0.85,

    // 低精度（幅広い）検索用の閾値
    LOW_PRECISION_THRESHOLD: 0.6,

    // 検索結果の最大件数
    // 環境変数で上書き可能
    DEFAULT_MATCH_COUNT: parseInt(process.env.SIMILARITY_MATCH_COUNT) || 5,

    // 一括処理時の最大件数
    MAX_BATCH_COUNT: 10,
};

// 閾値のプリセット
export const SIMILARITY_PRESETS = {
    STRICT: 0.85, // 厳密な類似性
    NORMAL: 0.7, // 通常の類似性
    LOOSE: 0.6, // 緩い類似性
    VERY_LOOSE: 0.5, // 非常に緩い類似性
};

// 閾値の説明
export const THRESHOLD_DESCRIPTIONS = {
    [SIMILARITY_PRESETS.STRICT]: "非常に似ている",
    [SIMILARITY_PRESETS.NORMAL]: "似ている",
    [SIMILARITY_PRESETS.LOOSE]: "やや似ている",
    [SIMILARITY_PRESETS.VERY_LOOSE]: "関連がある",
};

/**
 * 類似度を人間にわかりやすい説明に変換
 * @param {number} similarity - 類似度（0-1）
 * @returns {string} 説明文
 */
export function getSimilarityDescription(similarity) {
    if (similarity >= SIMILARITY_PRESETS.STRICT) {
        return THRESHOLD_DESCRIPTIONS[SIMILARITY_PRESETS.STRICT];
    } else if (similarity >= SIMILARITY_PRESETS.NORMAL) {
        return THRESHOLD_DESCRIPTIONS[SIMILARITY_PRESETS.NORMAL];
    } else if (similarity >= SIMILARITY_PRESETS.LOOSE) {
        return THRESHOLD_DESCRIPTIONS[SIMILARITY_PRESETS.LOOSE];
    } else {
        return THRESHOLD_DESCRIPTIONS[SIMILARITY_PRESETS.VERY_LOOSE];
    }
}

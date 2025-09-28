import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

const initializeGemini = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

/**
 * ベクトルを正規化する関数
 * @param {number[]} vector - 正規化するベクトル
 * @returns {number[]} 正規化されたベクトル
 */
function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map((val) => val / magnitude);
}

/**
 * テキストをGeminiエンベディングモデルでベクトル化
 * @param {string} text - ベクトル化するテキスト
 * @returns {Promise<number[]>} 正規化された1536次元ベクトル配列
 */
export async function generateEmbedding(text) {
    try {
        const ai = initializeGemini();
        if (!ai) {
            throw new Error("Gemini API key not configured");
        }

        const model = ai.getGenerativeModel({ model: "gemini-embedding-001" });

        const result = await model.embedContent({
            content: {
                parts: [{ text }],
                role: "user",
            },
            taskType: "SEMANTIC_SIMILARITY",
            outputDimensionality: 1536,
        });

        // 1536次元では手動で正規化が必要
        const normalizedEmbedding = normalizeVector(result.embedding.values);
        return normalizedEmbedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

/**
 * 雑学のコンテンツからベクトルを生成
 * @param {string} content - 雑学の内容
 * @returns {Promise<number[]>} ベクトル配列
 */
export async function generateZatsugakuEmbedding(content) {
    return await generateEmbedding(content);
}

/**
 * 類似度を計算（コサイン類似度）
 * @param {number[]} vectorA
 * @param {number[]} vectorB
 * @returns {number} 類似度（0-1）
 */
export function calculateSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error("Vector dimensions must match");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        normA += vectorA[i] * vectorA[i];
        normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

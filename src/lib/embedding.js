import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

const initializeGemini = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

/**
 * テキストをGeminiエンベディングモデルでベクトル化
 * @param {string} text - ベクトル化するテキスト
 * @returns {Promise<number[]>} ベクトル配列
 */
export async function generateEmbedding(text) {
    try {
        const ai = initializeGemini();
        if (!ai) {
            throw new Error("Gemini API key not configured");
        }

        const model = ai.getGenerativeModel({ model: "text-embedding-004" });

        const result = await model.embedContent(text);
        return result.embedding.values;
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

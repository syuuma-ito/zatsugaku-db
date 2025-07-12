import { generateEmbedding } from "@/lib/embedding";
import { SIMILARITY_CONFIG } from "@/lib/similarity-config";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export async function POST(request) {
    try {
        // ユーザー認証チェック
        const serverSupabase = await createServerClient();
        const {
            data: { user },
            error: authError,
        } = await serverSupabase.auth.getUser();

        if (authError || !user) {
            return Response.json({ error: "Unauthorized. Please login to use this API." }, { status: 401 });
        }

        const { content, excludeId, threshold = SIMILARITY_CONFIG.DEFAULT_THRESHOLD, limit = SIMILARITY_CONFIG.DEFAULT_MATCH_COUNT } = await request.json();

        if (!content) {
            return Response.json({ error: "Content is required" }, { status: 400 });
        }

        // テキストをベクトル化（コンテンツのみ）
        const embedding = await generateEmbedding(content);

        // 類似雑学を検索
        const { data, error } = await supabase.rpc("find_similar_zatsugaku", {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: limit,
        });

        if (error) {
            console.error("Database error:", error);
            return Response.json({ error: "Database query failed" }, { status: 500 });
        }

        // 除外IDがある場合はフィルタリング
        let similarZatsugaku = data || [];
        if (excludeId) {
            similarZatsugaku = similarZatsugaku.filter((item) => item.id !== excludeId);
        }

        // タグ情報を取得
        if (similarZatsugaku.length > 0) {
            const ids = similarZatsugaku.map((item) => item.id);
            const { data: tagsData } = await supabase
                .from("zatsugaku_tags")
                .select(
                    `
          zatsugaku_id,
          tags (
            id,
            name,
            color
          )
        `
                )
                .in("zatsugaku_id", ids);

            // タグ情報をマージ
            similarZatsugaku = similarZatsugaku.map((item) => ({
                ...item,
                tags: tagsData?.filter((tag) => tag.zatsugaku_id === item.id)?.map((tag) => tag.tags) || [],
            }));
        }

        return Response.json({
            success: true,
            data: similarZatsugaku,
        });
    } catch (error) {
        console.error("API error:", error);
        return Response.json(
            {
                error: "Internal server error",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

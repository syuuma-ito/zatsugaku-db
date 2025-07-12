import { generateZatsugakuEmbedding } from "@/lib/embedding";
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

        const { zatsugakuId, content, source } = await request.json();

        if (!zatsugakuId || !content) {
            return Response.json(
                {
                    error: "Zatsugaku ID and content are required",
                },
                { status: 400 }
            );
        }

        // ベクトルを生成（コンテンツのみ）
        const embedding = await generateZatsugakuEmbedding(content);

        // データベースに保存
        const { error } = await supabase.from("zatsugaku").update({ embedding }).eq("id", zatsugakuId);

        if (error) {
            console.error("Database error:", error);
            return Response.json({ error: "Failed to update embedding" }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: "Embedding generated and saved successfully",
        });
    } catch (error) {
        console.error("API error:", error);
        return Response.json(
            {
                error: "Failed to generate embedding",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// 一括でエンベディングを生成するエンドポイント
export async function PUT(request) {
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

        // エンベディングが未設定の雑学を取得
        const { data: zatsugakuList, error: fetchError } = await supabase.from("zatsugaku").select("id, content, source").is("embedding", null);

        if (fetchError) {
            throw fetchError;
        }

        let processed = 0;
        let failed = 0;

        // 各雑学に対してエンベディングを生成
        for (const zatsugaku of zatsugakuList) {
            try {
                const embedding = await generateZatsugakuEmbedding(zatsugaku.content);

                const { error: updateError } = await supabase.from("zatsugaku").update({ embedding }).eq("id", zatsugaku.id);

                if (updateError) {
                    throw updateError;
                }

                processed++;
            } catch (error) {
                console.error(`Failed to process zatsugaku ${zatsugaku.id}:`, error);
                failed++;
            }
        }

        return Response.json({
            success: true,
            message: `Batch embedding completed`,
            processed,
            failed,
            total: zatsugakuList.length,
        });
    } catch (error) {
        console.error("Batch embedding error:", error);
        return Response.json(
            {
                error: "Batch embedding failed",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

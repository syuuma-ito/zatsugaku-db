-- Supabaseデータベースのテーブル作成SQL

-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 雑学テーブルの作成
CREATE TABLE zatsugaku (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新時に updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER update_zatsugaku_updated_at
  BEFORE UPDATE ON zatsugaku
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) の設定
ALTER TABLE zatsugaku ENABLE ROW LEVEL SECURITY;

-- 全てのユーザーが閲覧可能にする
CREATE POLICY "Everyone can view zatsugaku" ON zatsugaku
FOR SELECT USING (true);

-- 認証済みユーザーのみが追加・更新・削除可能にする
CREATE POLICY "Authenticated users can insert zatsugaku" ON zatsugaku
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update zatsugaku" ON zatsugaku
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete zatsugaku" ON zatsugaku
FOR DELETE USING (auth.role() = 'authenticated');

-- インデックスの作成（検索性能向上のため）
-- 全文検索用のGINインデックス（デフォルトの'simple'設定を使用）
CREATE INDEX idx_zatsugaku_content ON zatsugaku USING gin(to_tsvector('simple', content));
CREATE INDEX idx_zatsugaku_source ON zatsugaku USING gin(to_tsvector('simple', source));
-- ILIKE検索用のインデックス（パターンマッチング）
CREATE INDEX idx_zatsugaku_content_trigram ON zatsugaku USING gin(content gin_trgm_ops);
CREATE INDEX idx_zatsugaku_source_trigram ON zatsugaku USING gin(source gin_trgm_ops);
-- 日付カラム用のBTreeインデックス
CREATE INDEX idx_zatsugaku_created_at ON zatsugaku(created_at);
CREATE INDEX idx_zatsugaku_updated_at ON zatsugaku(updated_at);

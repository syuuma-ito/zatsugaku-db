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

-- タグテーブルの作成
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#c7c7c7',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 雑学とタグの中間テーブル（多対多リレーション）
CREATE TABLE zatsugaku_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zatsugaku_id UUID NOT NULL REFERENCES zatsugaku(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(zatsugaku_id, tag_id)
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
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE zatsugaku_tags ENABLE ROW LEVEL SECURITY;

-- 雑学テーブルのポリシー
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

-- タグテーブルのポリシー
-- 全てのユーザーが閲覧可能にする
CREATE POLICY "Everyone can view tags" ON tags
FOR SELECT USING (true);

-- 認証済みユーザーのみが追加・更新・削除可能にする
CREATE POLICY "Authenticated users can insert tags" ON tags
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tags" ON tags
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tags" ON tags
FOR DELETE USING (auth.role() = 'authenticated');

-- 雑学タグ中間テーブルのポリシー
-- 全てのユーザーが閲覧可能にする
CREATE POLICY "Everyone can view zatsugaku_tags" ON zatsugaku_tags
FOR SELECT USING (true);

-- 認証済みユーザーのみが追加・更新・削除可能にする
CREATE POLICY "Authenticated users can insert zatsugaku_tags" ON zatsugaku_tags
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update zatsugaku_tags" ON zatsugaku_tags
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete zatsugaku_tags" ON zatsugaku_tags
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

-- タグ関連のインデックス
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_zatsugaku_tags_zatsugaku_id ON zatsugaku_tags(zatsugaku_id);
CREATE INDEX idx_zatsugaku_tags_tag_id ON zatsugaku_tags(tag_id);

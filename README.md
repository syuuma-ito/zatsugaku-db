# 雑学データベース

Next.jsとSupabaseで構築された雑学の管理・閲覧Webアプリケーション

## 機能

- 🔍 **検索機能**: 雑学の内容や情報源で検索
- 📖 **閲覧機能**: 全ユーザーが雑学を閲覧可能
- ✏️ **編集機能**: ログインユーザーのみ雑学の追加・編集・削除

## 技術スタック

- **フロントエンド**: Next.js 15, React 19
- **スタイリング**: Tailwind CSS, shadcn/ui
- **バックエンド**: Supabase (PostgreSQL)
- **認証**: Supabase Auth

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd zatsugaku-db
```

### 2. パッケージのインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `database.sql`ファイルの内容をSupabaseのSQL Editorで実行
3. Authentication設定でEmail認証を有効化
4. 2つのユーザーアカウントを手動作成

### 4. 環境変数の設定

`.env.local`ファイルを作成し、以下の情報を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000`でアプリケーションにアクセス

## ページ構成

- `/` - ホームページ（検索フォーム、最近の雑学）
- `/search` - 検索結果ページ
- `/zatsugaku/new` - 新規雑学追加（要ログイン）
- `/zatsugaku/[id]` - 雑学詳細ページ
- `/zatsugaku/[id]/edit` - 雑学編集ページ（要ログイン）
- `/login` - ログインページ

## データベース構造

### zatsugakuテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| content | TEXT | 雑学の内容 |
| source | TEXT | 情報源 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 最終更新日時 |

## デプロイ

### Vercelでのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ実行

## その他
このプログラムは、ほとんどのコードをClaude 4で生成しています。

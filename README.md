# Kotonoha Journal

Next.js 16.1.6 + TypeScript + shadcn/ui を使った日本語日記ブログです。

## 主な機能

- 公開ブログページ (`/`, `/blog/[id]`)
- 執筆者専用の管理ページ (`/me`, `/me/new`, `/me/posts/[id]`)
- 執筆者専用の学習ページ (`/learning`, `/learning/[postId]`)
- Supabase Auth ログイン
- Supabase RLS によるアクセス制御
- Gemini フィードバックアシスタント（全文代筆禁止）
- フィードバック履歴保存 (`feedback_history`)
- フィードバック時の下書き本文スナップショット保存 (`feedback_history.draft_content`)
- Supabase Storage サムネイル画像アップロード (`post-images`)

## 技術スタック

- Next.js `16.1.6`
- React `19`
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage)
- Gemini API

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 環境変数

`.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
OWNER_USER_ID=YOUR_AUTH_USER_UUID
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash
```

## Supabase RLS 強化（単一執筆者に固定）

既存ポリシーは「各ユーザーが自分の投稿を操作可能」という形のため、複数執筆者が作成できます。
単一執筆者ブログに固定したい場合は、下記マイグレーション内の `YOUR_OWNER_UUID` を実際の UUID に置き換えて実行してください。

- `supabase/migrations/20260206_owner_locked_policies.sql`

## フィードバック下書きスナップショット保存

Gemini フィードバック取得時の本文を保存するため、下記マイグレーションを実行してください。

- `supabase/migrations/20260206_add_feedback_draft_content.sql`

## SEO / LLMO

- `app/sitemap.ts`: 公開記事のみサイトマップに含める
- `app/robots.ts`: `/me`, `/learning`, `/api` のクロールを拒否
- `app/llms.txt/route.ts`: LLM向けガイド

## 注意事項

- フィードバック API は執筆中の本文を自動で送信し、結果は `feedback_history` に保存されます。
- 学習ページは執筆者のみ閲覧可能です。
- 公開ページには完成した日記のみ表示されます。

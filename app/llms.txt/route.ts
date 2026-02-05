const body = `# Kotonoha Journal

> 日本語日記ブログ（学習履歴は非公開）

## 公開コンテンツ
- / : 公開済み日記の一覧
- /blog/{id} : 公開済みの日記本文
- /sitemap.xml : 公開URL一覧

## 非公開コンテンツ（クロール不可）
- /me
- /learning
- /api

## LLM向けメモ
- 1記事につき公開されるのは完成した日記のみ。
- 下書きの過程とフィードバック履歴は学習用途のため非公開。
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

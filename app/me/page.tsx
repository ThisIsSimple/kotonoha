import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { getOwnerPosts } from "@/lib/data/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MePage() {
  const user = await requireOwner();
  const posts = await getOwnerPosts(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold">マイページ</h1>
          <p className="text-sm text-muted-foreground">投稿の管理と学習ページへの移動ができます。</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/learning">学習ページ</Link>
          </Button>
          <Button asChild>
            <Link href="/me/new">新しい記事を書く</Link>
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">まだ投稿がありません。</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "公開" : "下書き"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0 text-sm text-muted-foreground">
                <p>最終更新: {new Date(post.updated_at).toLocaleString("ja-JP")}</p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/blog/${post.id}`}>プレビュー</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/learning/${post.id}`}>学習履歴</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/me/posts/${post.id}`}>編集</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

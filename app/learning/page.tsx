import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { getOwnerPosts } from "@/lib/data/posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LearningPage() {
  const user = await requireOwner();
  const posts = await getOwnerPosts(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold">学習ページ</h1>
          <p className="text-sm text-muted-foreground">非公開の執筆プロセスとAIフィードバック履歴を確認できます。</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/me">マイページ</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">分析する記事がありません。</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-0">
                <p className="text-sm text-muted-foreground">
                  最終更新: {new Date(post.updated_at).toLocaleString("ja-JP")}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/me/posts/${post.id}`}>編集</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/learning/${post.id}`}>履歴を見る</Link>
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

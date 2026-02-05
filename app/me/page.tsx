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
          <h1 className="font-[var(--font-heading)] text-3xl font-bold">개인 페이지</h1>
          <p className="text-sm text-muted-foreground">작성한 글을 관리하고 학습 페이지로 이동할 수 있어요.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/learning">학습 페이지</Link>
          </Button>
          <Button asChild>
            <Link href="/me/new">새 글 작성</Link>
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">아직 작성한 글이 없습니다.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "공개" : "초안"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0 text-sm text-muted-foreground">
                <p>최근 수정: {new Date(post.updated_at).toLocaleString("ko-KR")}</p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/blog/${post.id}`}>미리보기</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/learning/${post.id}`}>학습 기록</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/me/posts/${post.id}`}>편집</Link>
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

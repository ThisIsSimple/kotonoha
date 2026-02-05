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
          <h1 className="font-[var(--font-heading)] text-3xl font-bold">학습 페이지</h1>
          <p className="text-sm text-muted-foreground">공개되지 않는 작성 과정과 AI 피드백 히스토리를 확인합니다.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/me">개인 페이지</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">분석할 글이 없습니다.</CardContent>
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
                  최근 수정: {new Date(post.updated_at).toLocaleString("ko-KR")}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/me/posts/${post.id}`}>편집</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/learning/${post.id}`}>히스토리 보기</Link>
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

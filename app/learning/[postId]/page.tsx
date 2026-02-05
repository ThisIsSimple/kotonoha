import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getFeedbackHistory, getOwnerPost } from "@/lib/data/posts";
import { ChatThread } from "@/components/learning/chat-thread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LearningDetailPage({ params }: PageProps) {
  const { postId } = await params;
  const user = await requireOwner();
  const post = await getOwnerPost(user.id, postId);

  if (!post) {
    notFound();
  }

  const history = await getFeedbackHistory(post.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-[var(--font-heading)] text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">학습 전용</Badge>
            <p className="text-sm text-muted-foreground">피드백 {history.length}회</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/learning">목록</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/me/posts/${post.id}`}>이 글 편집</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">최종 일기 본문</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{post.content}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-[var(--font-heading)] text-xl font-semibold">Gemini 피드백 대화 기록</h2>
        <ChatThread history={history} />
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { getFeedbackHistory, getOwnerPost } from "@/lib/data/posts";
import { PostEditor } from "@/components/editor/post-editor";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOwner();
  const post = await getOwnerPost(user.id, id);

  if (!post) {
    notFound();
  }

  const history = await getFeedbackHistory(post.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[var(--font-heading)] text-3xl font-bold">記事を編集</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/me">一覧へ戻る</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/learning/${post.id}`}>学習履歴</Link>
          </Button>
        </div>
      </div>
      <PostEditor initialPost={post} initialHistory={history} />
    </div>
  );
}

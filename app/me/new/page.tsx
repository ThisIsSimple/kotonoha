import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { PostEditor } from "@/components/editor/post-editor";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewPostPage() {
  await requireOwner();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">新規投稿</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/me">一覧へ戻る</Link>
        </Button>
      </div>
      <PostEditor />
    </div>
  );
}

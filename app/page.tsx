import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/data/posts";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border/70 bg-background/80 p-8 shadow-sm animate-rise-up">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">Japanese Diary Blog</p>
        <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight text-foreground md:text-5xl">
          일본어 일기를 통해 매일 한 걸음,
          <br className="hidden md:block" />
          더 자연스러운 문장을 쌓아갑니다.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          공개되는 것은 완성된 일기 한 편, 학습 과정은 작성자만 확인할 수 있도록 분리해서 운영합니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/me">
              작성 페이지 이동
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learning">학습 히스토리 보기</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-semibold">최신 일기</h2>
          <p className="text-sm text-muted-foreground">총 {posts.length}개</p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            아직 공개된 글이 없습니다.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

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
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">日本語日記ブログ</p>
        <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight text-foreground md:text-5xl">
          日本語日記を通して毎日一歩ずつ、
          <br className="hidden md:block" />
          より自然な表現を積み重ねます。
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          公開されるのは完成した日記のみ。学習プロセスは執筆者だけが確認できるように分離しています。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/me">
              執筆ページへ
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learning">学習履歴を見る</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-semibold">最新の日記</h2>
          <p className="text-sm text-muted-foreground">全 {posts.length} 件</p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            まだ公開された記事がありません。
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

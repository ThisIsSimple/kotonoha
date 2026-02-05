import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/data/posts";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 300;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div className="space-y-10">
      <section>
        <Card className="border-border/70 bg-background/80 shadow-sm animate-rise-up">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit text-xs uppercase tracking-[0.22em]">
              日本語日記ブログ
            </Badge>
            <CardTitle className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              日本語日記を通して毎日一歩ずつ、
              <br className="hidden md:block" />
              より自然な表現を積み重ねます。
            </CardTitle>
            <CardDescription className="max-w-2xl text-base text-muted-foreground">
              公開されるのは完成した日記のみ。学習プロセスは執筆者だけが確認できるように分離しています。
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/me">
                執筆ページへ
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/learning">学習履歴を見る</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">最新の日記</h2>
          <p className="text-sm text-muted-foreground">全 {posts.length} 件</p>
        </div>

        {posts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              まだ公開された記事がありません。
            </CardContent>
          </Card>
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { getPostById } from "@/lib/data/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다",
    };
  }

  const summary = post.content.replace(/\s+/g, " ").trim().slice(0, 140);

  return {
    title: post.title,
    description: summary,
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description: summary,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const user = await getCurrentUser();
  const owner = user ? isOwner(user.id) && user.id === post.user_id : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    image: post.thumbnail_url ? [post.thumbnail_url] : [],
    inLanguage: "ja",
    author: {
      "@type": "Person",
      name: "Kotonoha Journal",
    },
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={post.published ? "default" : "secondary"}>
            {post.published ? "공개글" : "비공개 초안"}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight">{post.title}</h1>
      </header>

      {post.thumbnail_url ? (
        <img src={post.thumbnail_url} alt={post.title} className="w-full rounded-xl border border-border/60" />
      ) : null}

      <div className="prose-jp whitespace-pre-wrap rounded-xl border border-border/60 bg-card/60 p-6 text-[1.04rem]">
        {post.content}
      </div>

      {owner ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/me/posts/${post.id}`}>수정하기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/learning/${post.id}`}>학습 기록 보기</Link>
          </Button>
        </div>
      ) : null}
    </article>
  );
}

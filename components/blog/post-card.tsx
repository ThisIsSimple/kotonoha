import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/lib/types";

function excerpt(content: string, limit = 140) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit)}...`;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="group h-full overflow-hidden border-border/70 bg-card/70 transition hover:-translate-y-0.5 hover:shadow-md">
      {post.thumbnail_url ? (
        <img
          src={post.thumbnail_url}
          alt={post.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-orange-200/60 via-amber-100 to-rose-100" />
      )}
      <CardHeader>
        <p className="text-xs text-muted-foreground">
          {new Date(post.created_at).toLocaleDateString("ja-JP")}
        </p>
        <CardTitle className="line-clamp-2 text-xl">
          <Link href={`/blog/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{excerpt(post.content)}</p>
      </CardContent>
    </Card>
  );
}

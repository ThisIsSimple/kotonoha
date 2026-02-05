import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("posts")
    .select("id, updated_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const posts = (data ?? []).map((post) => ({
    url: `${siteUrl}/blog/${post.id}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...posts,
  ];
}

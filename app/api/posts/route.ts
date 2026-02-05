import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type CreatePostBody = {
  title?: string;
  content?: string;
  thumbnailUrl?: string | null;
  published?: boolean;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!isOwner(user.id)) {
    return NextResponse.json({ error: "投稿権限がありません。" }, { status: 403 });
  }

  const body = (await request.json()) as CreatePostBody;
  const title = body.title?.trim();
  const content = body.content?.trim();

  if (!title || !content) {
    return NextResponse.json({ error: "タイトルと本文は必須です。" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      title,
      content,
      thumbnail_url: body.thumbnailUrl || null,
      published: Boolean(body.published),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}

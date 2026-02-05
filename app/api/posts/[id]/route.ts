import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type UpdatePostBody = {
  title?: string;
  content?: string;
  thumbnailUrl?: string | null;
  published?: boolean;
};

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!isOwner(user.id)) {
    return NextResponse.json({ error: "編集権限がありません。" }, { status: 403 });
  }

  const body = (await request.json()) as UpdatePostBody;
  const title = body.title?.trim();
  const content = body.content?.trim();

  if (!title || !content) {
    return NextResponse.json({ error: "タイトルと本文は必須です。" }, { status: 400 });
  }

  const { data: existingPost, error: checkError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (!existingPost) {
    return NextResponse.json({ error: "記事が見つかりません。" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("posts")
    .update({
      title,
      content,
      thumbnail_url: body.thumbnailUrl || null,
      published: Boolean(body.published),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "記事が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!isOwner(user.id)) {
    return NextResponse.json({ error: "削除権限がありません。" }, { status: 403 });
  }

  const { data: existingPost, error: checkError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (!existingPost) {
    return NextResponse.json({ error: "記事が見つかりません。" }, { status: 404 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { isOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type FeedbackBody = {
  postId?: string;
  content?: string;
  userMessage?: string;
};

function buildPrompt(content: string, userMessage: string) {
  return [
    "あなたは日本語日記の学習コーチです。",
    "ルール:",
    "1) 日記全体を書き直さない。",
    "2) 改善提案・表現修正・文の流れに関する助言のみ行う。",
    "3) 最大6ポイントで簡潔にまとめる。",
    "4) 各ポイントは『課題 -> 提案 -> 短い例文（日本語）』で書く。",
    "5) 文法・自然さ・ニュアンスを優先して指摘する。",
    "6) 最後に『今日の学習ポイント』を1行でまとめる。",
    "7) Markdown形式で回答する（見出し・箇条書き・強調を使用可）。",
    "",
    `[ユーザーの相談] ${userMessage}`,
    "",
    "[執筆中の日記本文]",
    content,
  ].join("\n");
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY が設定されていません。" }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  if (!isOwner(user.id)) {
    return NextResponse.json({ error: "フィードバックを受け取る権限がありません。" }, { status: 403 });
  }

  const body = (await request.json()) as FeedbackBody;
  const postId = body.postId;
  const content = body.content?.trim();
  const userMessage =
    body.userMessage?.trim() ||
    "現在の日記下書きを確認し、日本語表現の改善ポイントを提案してください。";

  if (!postId) {
    return NextResponse.json({ error: "postId が必要です。" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "本文が空です。" }, { status: 400 });
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .eq("user_id", user.id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "この投稿にはアクセスできません。" }, { status: 404 });
  }

  const { data: latest, error: latestError } = await supabase
    .from("feedback_history")
    .select("sequence")
    .eq("post_id", postId)
    .order("sequence", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    return NextResponse.json({ error: latestError.message }, { status: 500 });
  }

  const sequence = (latest?.sequence ?? 0) + 1;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    });

    const geminiResult = await model.generateContent(buildPrompt(content, userMessage));
    const aiFeedback = geminiResult.response.text().trim();

    if (!aiFeedback) {
      return NextResponse.json({ error: "Gemini が空のレスポンスを返しました。" }, { status: 502 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("feedback_history")
      .insert({
        post_id: postId,
        user_message: userMessage,
        ai_feedback: aiFeedback,
        draft_content: content,
        sequence,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini リクエスト中にエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    "너는 일본어 일기 학습 코치다.",
    "규칙:",
    "1) 일기 전체를 새로 써주지 않는다.",
    "2) 수정 제안/표현 개선/문장 흐름 코칭만 제공한다.",
    "3) 최대 6개 포인트로 간결하게 작성한다.",
    "4) 각 포인트는 '문제 -> 제안 -> 짧은 예시(일본어)' 형식으로 작성한다.",
    "5) 문법/자연스러움/뉘앙스 관점에서 우선순위를 둔다.",
    "6) 응답 마지막에 오늘의 학습 포인트를 1줄로 요약한다.",
    "",
    `[사용자 요청] ${userMessage}`,
    "",
    "[현재 작성 중인 일기 본문]",
    content,
  ].join("\n");
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isOwner(user.id)) {
    return NextResponse.json({ error: "피드백 권한이 없습니다." }, { status: 403 });
  }

  const body = (await request.json()) as FeedbackBody;
  const postId = body.postId;
  const content = body.content?.trim();
  const userMessage =
    body.userMessage?.trim() ||
    "현재 일기 초안을 검토하고 일본어 표현 개선 포인트를 제안해 주세요.";

  if (!postId) {
    return NextResponse.json({ error: "postId가 필요합니다." }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "본문이 비어 있습니다." }, { status: 400 });
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .eq("user_id", user.id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "해당 글에 접근할 수 없습니다." }, { status: 404 });
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
      return NextResponse.json({ error: "Gemini가 빈 응답을 반환했습니다." }, { status: 502 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("feedback_history")
      .insert({
        post_id: postId,
        user_message: userMessage,
        ai_feedback: aiFeedback,
        sequence,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini 요청 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

"use client";

import { ChangeEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { FeedbackEntry, Post } from "@/lib/types";

type PostEditorProps = {
  initialPost?: Post | null;
  initialHistory?: FeedbackEntry[];
};

export function PostEditor({ initialPost, initialHistory = [] }: PostEditorProps) {
  const router = useRouter();
  const [postId, setPostId] = useState(initialPost?.id ?? null);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialPost?.thumbnail_url ?? "");
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [feedbackPrompt, setFeedbackPrompt] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>(initialHistory);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isFeedbackLoading, startFeedback] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [content]);

  async function persistPost(nextPublished = published) {
    const payload = {
      title,
      content,
      thumbnailUrl: thumbnailUrl || null,
      published: nextPublished,
    };

    if (!title.trim() || !content.trim()) {
      throw new Error("제목과 본문을 먼저 입력해 주세요.");
    }

    if (postId) {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "저장에 실패했습니다.");
      }

      return result.post as Post;
    }

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error ?? "생성에 실패했습니다.");
    }

    return result.post as Post;
  }

  const onSave = (nextPublished = published) => {
    setMessage(null);

    startSaving(async () => {
      try {
        const savedPost = await persistPost(nextPublished);
        setPostId(savedPost.id);
        setPublished(savedPost.published);
        setMessage(savedPost.published ? "게시 완료되었습니다." : "초안 저장 완료.");

        if (!initialPost && savedPost.id) {
          router.replace(`/me/posts/${savedPost.id}`);
        }

        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
      }
    });
  };

  const onRequestFeedback = () => {
    setMessage(null);

    startFeedback(async () => {
      try {
        const savedPost = await persistPost(postId ? published : false);

        if (!postId) {
          setPostId(savedPost.id);
          router.replace(`/me/posts/${savedPost.id}`);
        }

        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: savedPost.id,
            content,
            userMessage:
              feedbackPrompt.trim() ||
              "현재 일기 초안 전체를 검토해서 일본어 표현과 문장 흐름 개선 포인트를 알려줘.",
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error ?? "피드백 요청에 실패했습니다.");
        }

        setFeedbackHistory((prev) => [...prev, result.feedback]);
        setFeedbackPrompt("");
        setMessage("Gemini 피드백이 저장되었습니다.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "피드백 요청 중 오류가 발생했습니다.");
      }
    });
  };

  const onDelete = () => {
    if (!postId) {
      return;
    }

    if (!window.confirm("이 글과 학습 히스토리를 삭제할까요?")) {
      return;
    }

    startDeleting(async () => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        setMessage(result.error ?? "삭제에 실패했습니다.");
        return;
      }

      router.push("/me");
      router.refresh();
    });
  };

  const onUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("이미지 업로드 전에 로그인이 필요합니다.");
      }

      const extension = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
      setThumbnailUrl(data.publicUrl);
      setMessage("이미지를 업로드하고 썸네일 URL에 반영했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card className="animate-rise-up">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>일기 작성</CardTitle>
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "게시됨" : "초안"}
            </Badge>
          </div>
          <CardDescription>
            현재 단어 수: {wordCount} / 일본어 문체를 의식하며 작성해 보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">썸네일 URL</Label>
            <Input
              id="thumbnail"
              placeholder="https://..."
              value={thumbnailUrl}
              onChange={(event) => setThumbnailUrl(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={onUploadImage}
                className="h-auto cursor-pointer py-2"
                disabled={isUploading || isSaving || isFeedbackLoading || isDeleting}
              />
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">본문</Label>
            <Textarea
              id="content"
              className="min-h-[420px] leading-relaxed"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="今日、私は..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => onSave(false)}
              disabled={isSaving || isFeedbackLoading || isDeleting || isUploading}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              초안 저장
            </Button>
            <Button
              variant="outline"
              onClick={() => onSave(true)}
              disabled={isSaving || isFeedbackLoading || isDeleting || isUploading}
            >
              공개 발행
            </Button>
            {postId ? (
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting || isSaving || isFeedbackLoading || isUploading}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                삭제
              </Button>
            ) : null}
          </div>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4" />
            Gemini 피드백 도우미
          </CardTitle>
          <CardDescription>
            현재 작성 중인 본문을 자동으로 포함해 개선 제안만 제공합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus">추가로 물어볼 포인트 (선택)</Label>
            <Textarea
              id="focus"
              className="min-h-[92px]"
              placeholder="예: 종결 표현을 자연스럽게 다듬어줘"
              value={feedbackPrompt}
              onChange={(event) => setFeedbackPrompt(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={onRequestFeedback}
            disabled={isFeedbackLoading || isSaving || isDeleting || isUploading || !content.trim()}
          >
            {isFeedbackLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            피드백 받기
          </Button>

          <div className="space-y-3">
            {feedbackHistory.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                아직 기록이 없습니다. 첫 피드백을 요청해 보세요.
              </p>
            ) : (
              feedbackHistory
                .slice()
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="space-y-2 rounded-lg border border-border/70 p-3">
                    <p className="text-xs text-muted-foreground">질문 {entry.sequence}</p>
                    <p className="text-sm font-medium">{entry.user_message}</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {entry.ai_feedback}
                    </p>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

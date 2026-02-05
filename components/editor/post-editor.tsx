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
import { Markdown } from "@/components/ui/markdown";
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
      throw new Error("タイトルと本文を先に入力してください。");
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
        throw new Error(result.error ?? "保存に失敗しました。");
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
      throw new Error(result.error ?? "作成に失敗しました。");
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
        setMessage(savedPost.published ? "公開しました。" : "下書きを保存しました。");

        if (!initialPost && savedPost.id) {
          router.replace(`/me/posts/${savedPost.id}`);
        }

        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "保存中にエラーが発生しました。");
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
              "現在の下書き全体を見て、日本語表現と文の流れの改善ポイントを提案してください。",
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error ?? "フィードバックの取得に失敗しました。");
        }

        setFeedbackHistory((prev) => [...prev, result.feedback]);
        setFeedbackPrompt("");
        setMessage("Geminiフィードバックを保存しました。");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "フィードバック取得中にエラーが発生しました。");
      }
    });
  };

  const onDelete = () => {
    if (!postId) {
      return;
    }

    if (!window.confirm("この記事と学習履歴を削除しますか？")) {
      return;
    }

    startDeleting(async () => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        setMessage(result.error ?? "削除に失敗しました。");
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
        throw new Error("画像をアップロードするにはログインが必要です。");
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
      setMessage("画像をアップロードし、サムネイルURLに反映しました。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "画像アップロードに失敗しました。");
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
            <CardTitle>日記を執筆</CardTitle>
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "公開済み" : "下書き"}
            </Badge>
          </div>
          <CardDescription>
            現在の単語数: {wordCount} / 日本語の文体を意識して書いてみましょう。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">サムネイルURL</Label>
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
            <Label htmlFor="content">本文</Label>
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
              下書き保存
            </Button>
            <Button
              variant="outline"
              onClick={() => onSave(true)}
              disabled={isSaving || isFeedbackLoading || isDeleting || isUploading}
            >
              公開する
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
                削除
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
            Geminiフィードバックアシスタント
          </CardTitle>
          <CardDescription>
            執筆中の本文を自動で含め、改善提案のみを返します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus">追加で相談したいポイント（任意）</Label>
            <Textarea
              id="focus"
              className="min-h-[92px]"
              placeholder="例: 文末表現をもっと自然にしたい"
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
            フィードバックを受け取る
          </Button>

          <div className="space-y-3">
            {feedbackHistory.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                まだ履歴がありません。最初のフィードバックを取得してみましょう。
              </p>
            ) : (
              feedbackHistory
                .slice()
                .reverse()
                .map((entry) => (
                  <div key={entry.id} className="space-y-2 rounded-lg border border-border/70 p-3">
                    <p className="text-xs text-muted-foreground">相談 {entry.sequence}</p>
                    <p className="text-sm font-medium">{entry.user_message}</p>
                    <Markdown content={entry.ai_feedback} className="text-sm leading-relaxed text-muted-foreground" />
                    {entry.draft_content ? (
                      <details className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer">この相談時の下書きを見る</summary>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{entry.draft_content}</p>
                      </details>
                    ) : null}
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

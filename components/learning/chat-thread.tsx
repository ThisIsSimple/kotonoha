import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import type { FeedbackEntry } from "@/lib/types";

export function ChatThread({ history }: { history: FeedbackEntry[] }) {
  if (history.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        まだ保存されたフィードバックがありません。編集画面でAIフィードバックを受け取ってみましょう。
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
            <p className="mb-1 text-xs opacity-80">あなた ({item.sequence})</p>
            <p className="whitespace-pre-wrap">{item.user_message}</p>
            {item.draft_content ? (
              <details className="mt-3 rounded-md bg-secondary-foreground/10 p-2 text-secondary-foreground">
                <summary className="cursor-pointer text-xs">送信時の日記下書きを見る</summary>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">{item.draft_content}</p>
              </details>
            ) : null}
          </div>
          <div className="max-w-2xl rounded-2xl rounded-bl-sm border border-border/70 bg-background px-4 py-3 text-sm">
            <p className="mb-2 text-xs text-muted-foreground">Geminiフィードバック</p>
            <Markdown content={item.ai_feedback} className="text-sm leading-relaxed" />
          </div>
        </div>
      ))}
    </div>
  );
}

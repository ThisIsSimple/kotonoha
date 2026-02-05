import { Card } from "@/components/ui/card";
import type { FeedbackEntry } from "@/lib/types";

export function ChatThread({ history }: { history: FeedbackEntry[] }) {
  if (history.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        아직 저장된 피드백이 없습니다. 편집 화면에서 AI 피드백을 받아보세요.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="ml-auto max-w-2xl rounded-2xl rounded-br-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
            <p className="mb-1 text-xs opacity-80">나 ({item.sequence})</p>
            <p className="whitespace-pre-wrap">{item.user_message}</p>
          </div>
          <div className="max-w-2xl rounded-2xl rounded-bl-sm border border-border/70 bg-background px-4 py-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">Gemini 피드백</p>
            <p className="whitespace-pre-wrap leading-relaxed">{item.ai_feedback}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

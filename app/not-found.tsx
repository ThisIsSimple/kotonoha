import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-border/70 bg-card p-10 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="font-[var(--font-heading)] text-3xl font-bold">ページが見つかりません</h1>
      <p className="text-sm text-muted-foreground">URLを確認するか、ホームへ戻ってください。</p>
      <Button asChild>
        <Link href="/">ホームへ</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardHeader className="items-center space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <CardTitle className="text-3xl font-bold">ページが見つかりません</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">URLを確認するか、ホームへ戻ってください。</p>
        <Button asChild>
          <Link href="/">ホームへ</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

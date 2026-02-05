import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { ThemeSelector } from "@/components/theme-selector";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "設定",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  await requireOwner();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-sm text-muted-foreground">
          テーマやアカウントの設定を変更できます。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>テーマ</CardTitle>
          <CardDescription>システム・ライト・ダークから選択できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ログアウト</CardTitle>
          <CardDescription>この端末でのセッションを終了します。</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            ログアウトすると再度ログインが必要になります。
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}

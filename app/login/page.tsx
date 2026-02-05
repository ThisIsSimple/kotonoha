import { redirect } from "next/navigation";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user && isOwner(user.id)) {
    redirect("/me");
  }

  if (user && !isOwner(user.id)) {
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardHeader>
          <CardTitle>작성 권한이 없는 계정입니다.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <code className="rounded bg-muted px-1 py-0.5">OWNER_USER_ID</code>와 동일한 계정으로
            로그인해야 작성/관리 페이지를 사용할 수 있습니다.
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="py-10">
      <LoginForm />
    </div>
  );
}

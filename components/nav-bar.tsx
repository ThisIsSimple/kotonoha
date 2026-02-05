import Link from "next/link";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

export async function NavBar() {
  const user = await getCurrentUser();
  const owner = user ? isOwner(user.id) : false;

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Kotonoha Journal
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">ホーム</Link>
          </Button>
          {owner ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/me">マイページ</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/learning">学習ページ</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

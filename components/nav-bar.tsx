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
            <Link href="/">홈</Link>
          </Button>
          {owner ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/me">개인 페이지</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/learning">학습 페이지</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

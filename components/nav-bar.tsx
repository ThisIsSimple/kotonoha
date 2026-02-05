import Link from "next/link";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

export async function NavBar() {
  const user = await getCurrentUser();
  const owner = user ? isOwner(user.id) : false;

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between md:h-16">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Kotonoha Journal
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
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
              <Button asChild variant="ghost" size="sm">
                <Link href="/settings">設定</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </nav>
        <MobileNav isOwner={owner} />
      </div>
    </header>
  );
}

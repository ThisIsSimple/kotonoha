"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

type MobileNavProps = {
  isOwner: boolean;
};

export function MobileNav({ isOwner }: MobileNavProps) {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" aria-label="メニューを開く">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>メニュー</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2">
            <SheetClose asChild>
              <Button asChild variant="ghost" className="justify-start">
                <Link href="/">ホーム</Link>
              </Button>
            </SheetClose>
            {isOwner ? (
              <>
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/me">マイページ</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/learning">学習ページ</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/settings">設定</Link>
                  </Button>
                </SheetClose>
              </>
            ) : (
              <SheetClose asChild>
                <Button asChild className="justify-start">
                  <Link href="/login">ログイン</Link>
                </Button>
              </SheetClose>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

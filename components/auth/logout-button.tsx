"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        startTransition(async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push("/");
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "ログアウト中..." : "ログアウト"}
    </Button>
  );
}

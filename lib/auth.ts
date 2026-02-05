import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function getOwnerUserId() {
  const ownerUserId = process.env.OWNER_USER_ID?.trim();
  return ownerUserId && ownerUserId.length > 0 ? ownerUserId : null;
}

export function isOwner(userId: string) {
  const ownerUserId = getOwnerUserId();
  return ownerUserId ? ownerUserId === userId : false;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireOwner() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isOwner(user.id)) {
    redirect("/");
  }

  return user;
}

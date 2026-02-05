import { createClient } from "@/lib/supabase/server";
import type { FeedbackEntry, Post } from "@/lib/types";

export async function getPublishedPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Post[];
}

export async function getPostById(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post | null;
}

export async function getOwnerPosts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Post[];
}

export async function getOwnerPost(userId: string, postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post | null;
}

export async function getFeedbackHistory(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_history")
    .select("*")
    .eq("post_id", postId)
    .order("sequence", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FeedbackEntry[];
}

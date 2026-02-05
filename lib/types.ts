export type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type FeedbackEntry = {
  id: string;
  post_id: string;
  user_message: string;
  ai_feedback: string;
  sequence: number;
  created_at: string;
};

export type PostWithFeedback = Post & {
  feedback_history: FeedbackEntry[];
};

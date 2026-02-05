-- Replace YOUR_OWNER_UUID with your auth.users.id value before running.

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.blog_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT 'YOUR_OWNER_UUID'::uuid;
$$;

CREATE OR REPLACE FUNCTION app.is_blog_owner()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() = app.blog_owner_id();
$$;

CREATE OR REPLACE FUNCTION app.owns_post(target_post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM posts
    WHERE posts.id = target_post_id
      AND posts.user_id = auth.uid()
  );
$$;

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Public can view published posts"
  ON posts
  FOR SELECT
  USING (published = true);

CREATE POLICY "Only owner can select own posts"
  ON posts
  FOR SELECT
  USING (app.is_blog_owner() AND auth.uid() = user_id);

CREATE POLICY "Only owner can insert posts"
  ON posts
  FOR INSERT
  WITH CHECK (app.is_blog_owner() AND auth.uid() = user_id);

CREATE POLICY "Only owner can update posts"
  ON posts
  FOR UPDATE
  USING (app.is_blog_owner() AND auth.uid() = user_id)
  WITH CHECK (app.is_blog_owner() AND auth.uid() = user_id);

CREATE POLICY "Only owner can delete posts"
  ON posts
  FOR DELETE
  USING (app.is_blog_owner() AND auth.uid() = user_id);

ALTER TABLE feedback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_history FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view feedback for their own posts" ON feedback_history;
DROP POLICY IF EXISTS "Users can insert feedback for their own posts" ON feedback_history;
DROP POLICY IF EXISTS "Users can update feedback for their own posts" ON feedback_history;
DROP POLICY IF EXISTS "Users can delete feedback for their own posts" ON feedback_history;

CREATE POLICY "Only owner can view feedback"
  ON feedback_history
  FOR SELECT
  USING (app.is_blog_owner() AND app.owns_post(post_id));

CREATE POLICY "Only owner can insert feedback"
  ON feedback_history
  FOR INSERT
  WITH CHECK (app.is_blog_owner() AND app.owns_post(post_id));

CREATE POLICY "Only owner can update feedback"
  ON feedback_history
  FOR UPDATE
  USING (app.is_blog_owner() AND app.owns_post(post_id))
  WITH CHECK (app.is_blog_owner() AND app.owns_post(post_id));

CREATE POLICY "Only owner can delete feedback"
  ON feedback_history
  FOR DELETE
  USING (app.is_blog_owner() AND app.owns_post(post_id));

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view post images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

CREATE POLICY "Public can view post images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Only owner can upload post images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND app.is_blog_owner()
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Only owner can update post images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND app.is_blog_owner()
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'post-images'
    AND app.is_blog_owner()
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Only owner can delete post images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND app.is_blog_owner()
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

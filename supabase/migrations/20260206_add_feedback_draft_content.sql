ALTER TABLE feedback_history
  ADD COLUMN IF NOT EXISTS draft_content TEXT;

UPDATE feedback_history
  SET draft_content = ''
  WHERE draft_content IS NULL;

ALTER TABLE feedback_history
  ALTER COLUMN draft_content SET DEFAULT '';

ALTER TABLE feedback_history
  ALTER COLUMN draft_content SET NOT NULL;

/*
# Create feedback table (single-tenant, no auth)

1. New Tables
- `feedback`
  - `id` (uuid, primary key, auto-generated)
  - `category` (text, not null) — one of 'idea', 'praise', 'bug'
  - `rating` (integer, 1–5, not null)
  - `name` (text, not null)
  - `email` (text, nullable, optional)
  - `message` (text, not null)
  - `created_at` (timestamptz, defaults to now())
  - `is_read` (boolean, defaults to false) — tracks whether the feedback has been viewed

2. Security
- Enable RLS on `feedback`.
- Allow anon + authenticated to INSERT (visitors submit feedback without signing in).
- Allow anon + authenticated to SELECT (visitors can see community feedback).
- Allow anon + authenticated to UPDATE (mark feedback as read).
- DELETE is intentionally not granted to the anon role — only the service role can delete.

3. Important Notes
- This is a single-tenant app with no sign-in screen, so policies use `TO anon, authenticated`.
- The `is_read` column lets the UI detect new/unread feedback and blink to alert the owner.
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('idea', 'praise', 'bug')),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  name text NOT NULL,
  email text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_feedback" ON feedback;
CREATE POLICY "anon_select_feedback"
ON feedback FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback;
CREATE POLICY "anon_insert_feedback"
ON feedback FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_feedback" ON feedback;
CREATE POLICY "anon_update_feedback"
ON feedback FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

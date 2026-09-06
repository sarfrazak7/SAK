/*
# Create contact_messages table (single-tenant, no auth)

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null)
  - `email` (text, not null)
  - `subject` (text, not null)
  - `message` (text, not null)
  - `is_read` (boolean, defaults to false) — tracks whether the message has been viewed
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `contact_messages`.
- Allow anon + authenticated to INSERT (visitors send messages without signing in).
- Allow anon + authenticated to SELECT (so the page can display submitted messages).
- Allow anon + authenticated to UPDATE (mark messages as read).
- DELETE is intentionally not granted to the anon role.

3. Important Notes
- This is a single-tenant app with no sign-in screen, so policies use `TO anon, authenticated`.
- The `is_read` column lets the UI detect new/unread messages and blink to alert the owner.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contact_messages" ON contact_messages;
CREATE POLICY "anon_select_contact_messages"
ON contact_messages FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages"
ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contact_messages" ON contact_messages;
CREATE POLICY "anon_update_contact_messages"
ON contact_messages FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

/*
# Page view counter

1. New Tables
- `page_views`: a single-row table that stores a global view count.
  - `id` (int, primary key, fixed = 1) — ensures exactly one row.
  - `count` (bigint, default 0) — the running view count.
  - `updated_at` (timestamptz) — last increment time.

2. New Functions
- `increment_page_view()`: SECURITY DEFINER function that increments
  the single row's count by 1 and returns the new value. SECURITY
  DEFINER so the anon role can increment without needing UPDATE policy
  grants on the table (the count is intentionally public/global and
  must never be edited arbitrarily by clients).

3. Security
- RLS enabled on `page_views`.
- SELECT policy for anon+authenticated: anyone can read the count.
- No INSERT/UPDATE/DELETE policies — the only mutation path is the
  SECURITY DEFINER function, which prevents clients from setting
  arbitrary values while still allowing the counter to tick up.
- `increment_page_view()` is granted EXECUTE to anon + authenticated.
*/

CREATE TABLE IF NOT EXISTS page_views (
  id integer PRIMARY KEY DEFAULT 1,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed the single row if it does not exist.
INSERT INTO page_views (id, count)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_page_views" ON page_views;
CREATE POLICY "anon_read_page_views"
ON page_views FOR SELECT
TO anon, authenticated USING (true);

-- Atomic increment function.
CREATE OR REPLACE FUNCTION increment_page_view()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE page_views
  SET count = count + 1, updated_at = now()
  WHERE id = 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_page_view() TO anon, authenticated;

/*
# Create player_stats table for Panagram game (single-tenant, no auth)

1. New Tables
- `player_stats`
  - `device_id` (uuid, primary key) — client-generated UUID stored in browser localStorage
  - `total_credit` (integer, not null, default 0) — cumulative points won across all game sessions
  - `total_debit` (integer, not null, default 0) — cumulative points lost across all game sessions
  - `updated_at` (timestamptz) — last time the totals were synced

2. Security
- Enable RLS on `player_stats`.
- Allow anon + authenticated CRUD because the game has no sign-in screen.
  Per-device isolation is enforced in the query layer (every SELECT/UPSERT
  filters by device_id), not in RLS — there is no verified server-side
  identity without auth, and the data (game scores) is non-sensitive.

3. Notes
- This table is shared with the existing page_views and challenge_scores tables.
- Each player sees and mutates only their own all-time total via device_id.
*/

CREATE TABLE IF NOT EXISTS player_stats (
  device_id uuid PRIMARY KEY,
  total_credit integer NOT NULL DEFAULT 0,
  total_debit integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_player_stats" ON player_stats;
CREATE POLICY "anon_select_player_stats" ON player_stats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_player_stats" ON player_stats;
CREATE POLICY "anon_insert_player_stats" ON player_stats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_player_stats" ON player_stats;
CREATE POLICY "anon_update_player_stats" ON player_stats FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_player_stats" ON player_stats;
CREATE POLICY "anon_delete_player_stats" ON player_stats FOR DELETE
  TO anon, authenticated USING (true);

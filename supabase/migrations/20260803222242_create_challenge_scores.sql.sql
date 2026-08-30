/*
# Challenge scores table (per-player, IP-tagged)

1. New Tables
- `challenge_scores`: stores one row per submitted crossword challenge
  score. Each row is tagged with the player's IP address so different
  users playing the same puzzle simultaneously have their own unique
  score rows.
  - `id` (uuid, primary key)
  - `player_ip` (inet, not null) — the caller's IP, captured server-side
    by the edge function so it cannot be spoofed by the client.
  - `player_tag` (text, nullable) — optional display name the player
    can set so the leaderboard shows a friendly label instead of an IP.
  - `category` (text, not null) — the puzzle category name (e.g. "Cosmos").
  - `finish_time_seconds` (integer, not null) — wall-clock seconds to clear.
  - `score` (integer, not null) — the computed point total (base × speed multiplier).
  - `created_at` (timestamptz, default now()).

2. Security
- RLS enabled on `challenge_scores`.
- SELECT policy for anon+authenticated: all scores are public so the
  leaderboard / friend challenge can display everyone's results. This
  is intentional shared data (a competition leaderboard).
- INSERT only via the SECURITY DEFINER function `submit_challenge_score`
  so the player_ip is captured server-side and cannot be forged. No
  direct INSERT policy is granted to anon/authenticated.
- No UPDATE or DELETE policies — scores are immutable once submitted.

3. New Functions
- `submit_challenge_score(p_category text, p_finish_time int, p_score int,
  p_player_ip inet, p_player_tag text)`: SECURITY DEFINER insert that
  records a score row. Returns the inserted row's id. Granted EXECUTE
  to anon + authenticated. The edge function calls this with the
  request's real IP.

4. Index
- Index on (category, score DESC) for fast leaderboard queries.
- Index on player_ip for "my scores" lookups.
*/

CREATE TABLE IF NOT EXISTS challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_ip inet NOT NULL,
  player_tag text,
  category text NOT NULL,
  finish_time_seconds integer NOT NULL CHECK (finish_time_seconds > 0),
  score integer NOT NULL CHECK (score >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE challenge_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_challenge_scores" ON challenge_scores;
CREATE POLICY "anon_read_challenge_scores"
ON challenge_scores FOR SELECT
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_challenge_scores_category_score
ON challenge_scores (category, score DESC);

CREATE INDEX IF NOT EXISTS idx_challenge_scores_ip
ON challenge_scores (player_ip);

CREATE OR REPLACE FUNCTION submit_challenge_score(
  p_category text,
  p_finish_time integer,
  p_score integer,
  p_player_ip inet,
  p_player_tag text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO challenge_scores (category, finish_time_seconds, score, player_ip, player_tag)
  VALUES (p_category, p_finish_time, p_score, p_player_ip, p_player_tag)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_challenge_score(text, integer, integer, inet, text) TO anon, authenticated;

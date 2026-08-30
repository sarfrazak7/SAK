import { useState, useEffect, useCallback } from 'react';
import { X, Flame, Grid3x3, Clock, Copy, Check, Link2, Trophy, Zap, Share2, Loader2, Medal } from 'lucide-react';
import { SPEED_TIERS, DURATION, WORD_POINTS, computeScore, tierForElapsed } from '@/game/scoring';
import { supabase } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

interface LeaderboardRow {
  id: string;
  player_tag: string | null;
  player_ip: string;
  category: string;
  finish_time_seconds: number;
  score: number;
  created_at: string;
}

export default function ChallengeModal({ open, onClose, onAccept }: Props) {
  const [finishTime, setFinishTime] = useState<number | ''>('');
  const [wordsFound, setWordsFound] = useState<number | ''>(10);
  const [category, setCategory] = useState('Cosmos');
  const [playerTag, setPlayerTag] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const categories = [
    'Cosmos', 'Abyss', 'Mythos', 'Cipher', 'Flora', 'Gusto',
    'Safari', 'Frost', 'Tempo', 'Forge', 'Bloom', 'Storm',
  ];

  const fetchLeaderboard = useCallback(async () => {
    setLoadingBoard(true);
    try {
      const { data, error } = await supabase
        .from('challenge_scores')
        .select('id, player_tag, player_ip, category, finish_time_seconds, score, created_at')
        .eq('category', category)
        .order('score', { ascending: false })
        .limit(5);
      if (error) throw error;
      setLeaderboard((data ?? []) as LeaderboardRow[]);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoadingBoard(false);
    }
  }, [category]);

  useEffect(() => {
    if (open) fetchLeaderboard();
  }, [open, fetchLeaderboard]);

  if (!open) return null;

  const timeValue = finishTime === '' ? DURATION : Math.max(1, Math.min(DURATION, Number(finishTime)));
  const wordsValue = wordsFound === '' ? 0 : Math.max(0, Math.min(10, Number(wordsFound)));
  const TOTAL_WORDS = 10;
  const wordPoints = wordsValue * WORD_POINTS;
  const speedBonus = wordsValue >= TOTAL_WORDS ? computeScore(timeValue, wordsValue, TOTAL_WORDS) - wordPoints : 0;
  const previewScore = wordPoints + speedBonus;
  const previewTier = tierForElapsed(timeValue);

  const generateLink = () => {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      challenge: 'speed',
      cat: category,
      time: String(Math.round(timeValue)),
    });
    return `${base}#/crossword?${params.toString()}`;
  };

  const copyLink = async () => {
    const link = generateLink();
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2200);
  };

  const submitScore = async () => {
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-score`;
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          category,
          finishTime: Math.round(timeValue),
          score: previewScore,
          playerTag: playerTag.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      setSubmitMsg('Score submitted! You\'re on the leaderboard.');
      fetchLeaderboard();
    } catch (e) {
      setSubmitMsg(`Could not submit score: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const rules = [
    { icon: Grid3x3, label: '12×12 Matrix Grid', accent: '#22d3ee' },
    { icon: Trophy, label: '10 Hidden Words per Category', accent: '#34d399' },
    { icon: Clock, label: '5-Minute Speed Timer', accent: '#fbbf24' },
  ];

  const medalColors = ['#fbbf24', '#cbd5e1', '#fb923c'];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="challenge-modal relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-cyan-400/30 bg-[#0a0a12] p-6 shadow-[0_0_60px_rgba(34,211,238,0.25)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* header */}
        <div className="relative mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-[10px] font-bold tracking-widest text-orange-300">SPEED SHOWDOWN</span>
          </div>
          <h2 className="challenge-title text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            FRIENDS <span className="text-cyan-300">VS</span> FRIENDS
          </h2>
          <p className="mt-2 text-xs tracking-widest text-white/40">SPEED SHOWDOWN</p>
          <button
            onClick={() => { onAccept(); onClose(); }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/30 transition hover:scale-105"
          >
            <Flame className="h-4 w-4" />
            ACCEPT THE CHALLENGE NOW
          </button>
        </div>

        {/* rules card */}
        <div className="relative mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="mb-3 text-xs font-bold tracking-widest text-white/50">CHALLENGE RULES</h3>
          <div className="space-y-2.5">
            {rules.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg ring-1"
                  style={{ background: `${r.accent}15`, boxShadow: `0 0 14px ${r.accent}25`, borderColor: `${r.accent}40` }}
                >
                  <r.icon className="h-4 w-4" style={{ color: r.accent }} />
                </div>
                <span className="text-sm font-medium text-white/85">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* score calculator */}
        <div className="relative mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-300" />
            <h3 className="text-xs font-bold tracking-widest text-white/50">SCORE CALCULATOR</h3>
          </div>
          <p className="mb-4 text-[11px] text-white/40">
            {WORD_POINTS} pts per word found · clear all 10 for a speed bonus on top
          </p>
          <div className="space-y-2">
            {SPEED_TIERS.map((tier) => {
              const active = previewTier?.label === tier.label;
              return (
                <div
                  key={tier.label}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 transition ${
                    active
                      ? 'border-cyan-400/40 bg-cyan-500/10'
                      : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}` }}
                    />
                    <span className="text-xs font-medium text-white/70">{tier.label}</span>
                  </div>
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: tier.color }}
                  >
                    {tier.multiplier}x · {Math.round(100 * tier.multiplier)} pts
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg bg-cyan-500/10 px-3 py-2 text-center text-xs text-cyan-200">
            {wordsValue} {wordsValue === 1 ? 'word' : 'words'} = <span className="font-bold">{wordPoints} pts</span>
            {speedBonus > 0 && (
              <>  +  <span className="font-bold">{speedBonus} pts</span> speed bonus ({previewTier?.multiplier}x)</>
            )}  =  <span className="font-bold text-white">{previewScore} pts total</span>
          </div>
        </div>

        {/* share link generator */}
        <div className="relative mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.03] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-cyan-300" />
            <h3 className="text-xs font-bold tracking-widest text-white/50">CHALLENGE A FRIEND</h3>
          </div>

          <label className="mb-1 block text-[11px] font-medium text-white/40">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mb-3 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400/50"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#0a0a12] text-white">{c}</option>
            ))}
          </select>

          <label className="mb-1 block text-[11px] font-medium text-white/40">Words found (0–10)</label>
          <input
            type="number"
            min={0}
            max={10}
            value={wordsFound}
            onChange={(e) => setWordsFound(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 7"
            className="mb-3 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50"
          />

          <label className="mb-1 block text-[11px] font-medium text-white/40">Your finish time (seconds)</label>
          <input
            type="number"
            min={1}
            max={DURATION}
            value={finishTime}
            onChange={(e) => setFinishTime(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 95"
            className="mb-3 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50"
          />

          <label className="mb-1 block text-[11px] font-medium text-white/40">Your tag (optional)</label>
          <input
            type="text"
            maxLength={20}
            value={playerTag}
            onChange={(e) => setPlayerTag(e.target.value)}
            placeholder="e.g. SpeedySolver"
            className="mb-4 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-400/50"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={submitScore}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><Trophy className="h-4 w-4" /> Submit Score</>
              )}
            </button>
            <button
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30"
            >
              {linkCopied ? (
                <><Check className="h-4 w-4" /> Link Copied!</>
              ) : (
                <><Link2 className="h-4 w-4" /> Generate Share Link</>
              )}
            </button>
          </div>

          {submitMsg && (
            <div className={`mt-3 rounded-lg px-3 py-2 text-[11px] ${
              submitMsg.includes('Could not')
                ? 'bg-red-500/10 text-red-300'
                : 'bg-emerald-500/10 text-emerald-300'
            }`}>
              {submitMsg}
            </div>
          )}

          {linkCopied && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
              <Copy className="h-3.5 w-3.5" />
              Share this link with a friend — they'll get the same {category} puzzle with {Math.round(timeValue)}s to beat!
            </div>
          )}
        </div>

        {/* leaderboard */}
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Medal className="h-4 w-4 text-amber-300" />
            <h3 className="text-xs font-bold tracking-widest text-white/50">{category.toUpperCase()} LEADERBOARD</h3>
          </div>
          {loadingBoard ? (
            <div className="flex items-center justify-center py-6 text-white/40">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="py-4 text-center text-xs text-white/40">
              No scores yet for {category}. Be the first!
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((row, i) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      background: i < 3 ? `${medalColors[i]}20` : 'rgba(255,255,255,0.05)',
                      color: i < 3 ? medalColors[i] : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-white/85 truncate">
                      {row.player_tag || 'Anonymous'}
                    </span>
                    <span className="block text-[10px] text-white/35">
                      {row.finish_time_seconds}s finish
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-cyan-300">{row.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, ThumbsUp, Lightbulb, Bug, RefreshCw, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Category = 'idea' | 'praise' | 'bug';

interface FeedbackRow {
  id: string;
  category: Category;
  rating: number;
  name: string;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string }[] = [
  { id: 'idea', label: 'Idea', icon: Lightbulb, accent: '#f59e0b' },
  { id: 'praise', label: 'Praise', icon: ThumbsUp, accent: '#22c55e' },
  { id: 'bug', label: 'Bug Report', icon: Bug, accent: '#ef4444' },
];

const CATEGORY_META: Record<Category, { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string }> = {
  idea: { label: 'Idea', icon: Lightbulb, accent: '#f59e0b' },
  praise: { label: 'Praise', icon: ThumbsUp, accent: '#22c55e' },
  bug: { label: 'Bug Report', icon: Bug, accent: '#ef4444' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function FeedbackPage() {
  const [category, setCategory] = useState<Category>('idea');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [blinkOn, setBlinkOn] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setListError(error.message);
    } else {
      const rows = (data ?? []) as FeedbackRow[];
      setFeedbackList(rows);
      setUnreadCount(rows.filter((r) => !r.is_read).length);
    }
    setLoadingList(false);
  }, []);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    const { error } = await supabase
      .from('feedback')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      setListError(error.message);
      return;
    }
    setUnreadCount(0);
    setFeedbackList((prev) => prev.map((r) => ({ ...r, is_read: true })));
  }, [unreadCount]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Blink when there are unread feedback entries
  useEffect(() => {
    if (unreadCount > 0) {
      blinkTimerRef.current = setInterval(() => {
        setBlinkOn((v) => !v);
      }, 600);
      return () => {
        if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
        setBlinkOn(false);
      };
    } else {
      setBlinkOn(false);
    }
  }, [unreadCount]);

  // Realtime subscription: blink when new feedback is inserted
  useEffect(() => {
    const channel = supabase
      .channel('feedback-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feedback' },
        () => {
          loadFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError('Please select a rating from 1 to 5 stars.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('feedback').insert({
      category,
      rating,
      name: name.trim(),
      email: email.trim() || null,
      message: message.trim(),
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setRating(0);
    setCategory('idea');
    window.setTimeout(() => setSent(false), 4000);
    loadFeedback();
  };

  if (sent) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <BackdropGlow />
        <main className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
          <CheckCircle2 className="mb-5 h-16 w-16 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Thank you!</h1>
          <p className="mt-3 text-white/50">Your feedback helps us build better games. We appreciate you taking the time.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackdropGlow />

      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        {/* Unread feedback blinking banner */}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className={`mb-6 flex w-full items-center justify-center gap-3 rounded-xl border px-5 py-3 transition-all duration-200 ${
              blinkOn
                ? 'border-cyan-400/60 bg-cyan-500/15 shadow-lg shadow-cyan-500/20'
                : 'border-cyan-400/20 bg-cyan-500/5'
            }`}
          >
            <span className={`relative flex h-3 w-3 ${blinkOn ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full bg-cyan-400 ${blinkOn ? 'animate-ping' : ''}`} />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
            </span>
            <Bell className={`h-4 w-4 transition-colors ${blinkOn ? 'text-cyan-300' : 'text-cyan-400/70'}`} />
            <span className={`text-sm font-semibold transition-colors ${blinkOn ? 'text-cyan-200' : 'text-cyan-300/80'}`}>
              {unreadCount} new {unreadCount === 1 ? 'feedback' : 'feedback'} — click to mark as read
            </span>
          </button>
        )}

        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px] font-medium tracking-widest text-white/60">WE'RE LISTENING</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Share Your Feedback</h1>
          <p className="mx-auto mt-3 max-w-lg text-white/50">
            Found a bug? Have a brilliant idea? Loved a game? Let us know.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
          {/* Category */}
          <div className="mb-6">
            <span className="mb-3 block text-[11px] font-semibold tracking-wide text-white/50">CATEGORY</span>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition ${
                      active ? 'bg-white/[0.08] ring-1' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    }`}
                    style={active ? { borderColor: `${c.accent}50`, boxShadow: `0 0 16px ${c.accent}20` } : undefined}
                  >
                    <c.icon className="h-6 w-6" style={{ color: active ? c.accent : '#ffffff80' }} />
                    <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-white/60'}`}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <span className="mb-3 block text-[11px] font-semibold tracking-wide text-white/50">RATING</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="h-7 w-7 transition"
                    style={{ color: n <= (hoverRating || rating) ? '#f59e0b' : '#ffffff20' }}
                    fill={n <= (hoverRating || rating) ? '#f59e0b' : 'transparent'}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm font-medium text-white/60">{rating}/5</span>}
            </div>
          </div>

          {/* Name + email */}
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold tracking-wide text-white/50">Name</span>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold tracking-wide text-white/50">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </label>
          </div>

          {/* Message */}
          <label className="mb-6 flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-white/50">MESSAGE</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
            />
          </label>

          {submitError && (
            <p className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Community Feedback Wall */}
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Community Feedback</h2>
              <p className="mt-0.5 text-sm text-white/45">
                {feedbackList.length > 0
                  ? `${feedbackList.length} ${feedbackList.length === 1 ? 'submission' : 'submissions'} so far`
                  : 'No feedback yet — be the first!'}
              </p>
            </div>
            <button
              onClick={loadFeedback}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Refresh feedback"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center py-12 text-sm text-white/40">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading feedback...
            </div>
          ) : listError ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              Could not load feedback: {listError}
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="text-sm text-white/40">No one has shared feedback yet. Your submission will be the first!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {feedbackList.map((fb) => {
                const meta = CATEGORY_META[fb.category];
                const Icon = meta.icon;
                return (
                  <div
                    key={fb.id}
                    className={`rounded-xl border p-5 transition ${
                      fb.is_read
                        ? 'border-white/10 bg-white/[0.02]'
                        : 'border-cyan-400/30 bg-cyan-500/[0.04]'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg ring-1"
                          style={{ background: `${meta.accent}15`, borderColor: `${meta.accent}40` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white">{fb.name}</span>
                          <span className="ml-2 text-[11px] font-medium text-white/35">{timeAgo(fb.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3"
                            style={{ color: i < fb.rating ? '#f59e0b' : '#ffffff15' }}
                            fill={i < fb.rating ? '#f59e0b' : 'transparent'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/65">{fb.message}</p>
                    {!fb.is_read && (
                      <span className="mt-2 inline-block rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-cyan-300 ring-1 ring-cyan-400/30">
                        NEW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
    </div>
  );
}

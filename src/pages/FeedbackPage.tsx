import { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, ThumbsUp, Lightbulb, Bug } from 'lucide-react';

type Category = 'idea' | 'praise' | 'bug';

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; accent: string }[] = [
  { id: 'idea', label: 'Idea', icon: Lightbulb, accent: '#f59e0b' },
  { id: 'praise', label: 'Praise', icon: ThumbsUp, accent: '#22c55e' },
  { id: 'bug', label: 'Bug Report', icon: Bug, accent: '#ef4444' },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState<Category>('idea');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 5000);
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

      <main className="relative z-10 mx-auto max-w-2xl px-5 pb-24 pt-28 sm:px-8">
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
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold tracking-wide text-white/50">Email (optional)</span>
              <input
                type="email"
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
              placeholder="Tell us what you think..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
            />
          </label>

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/30"
          >
            Submit Feedback
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
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

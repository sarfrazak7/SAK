import { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Brain, Zap, Target, RefreshCw, Flame, Smartphone, Monitor } from 'lucide-react';
import type { Route } from '@/lib/router';
import ChallengeModal from '@/components/ChallengeModal';

interface Props {
  onNavigate: (r: Route) => void;
}

const GAME_VERSION = '20260903-34';

const AI_CARDS = [
  {
    icon: Brain,
    title: 'Adaptive Difficulty',
    desc: 'AI tunes puzzle complexity in real time, matching each player\u2019s skill so every round feels just right.',
    accent: '#06b6d4',
  },
  {
    icon: Wand2,
    title: 'Procedural Levels',
    desc: 'Endless fresh puzzles generated on the fly \u2014 no two playthroughs are ever the same.',
    accent: '#22c55e',
  },
  {
    icon: Zap,
    title: 'Smart Hints',
    desc: 'Context-aware clues that nudge you forward without giving the answer away.',
    accent: '#f59e0b',
  },
  {
    icon: Target,
    title: 'Personalized Themes',
    desc: 'AI picks categories and word sets based on what you love to play.',
    accent: '#ec4899',
  },
  {
    icon: RefreshCw,
    title: 'Endless Replay',
    desc: 'Dynamic content rotation keeps the arcade alive long after you master the basics.',
    accent: '#8b5cf6',
  },
  {
    icon: Sparkles,
    title: 'Natural Language Play',
    desc: 'Describe a theme in plain words and watch AI build a whole puzzle around it.',
    accent: '#3b82f6',
  },
];

const GAMES = [
  {
    route: 'crossword' as Route,
    name: 'Crossword Puzzle',
    desc: 'A 3D cube with six faces of word-search puzzles. Spin, find, solve.',
    tag: 'PLAY NOW',
    img: 'https://images.pexels.com/photos/12585534/pexels-photo-12585534.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    route: 'panagram' as Route,
    name: 'Panagram',
    desc: 'Rearrange letters to spell every word from a hidden pangram.',
    tag: 'PLAY NOW',
    img: 'https://images.pexels.com/photos/8762806/pexels-photo-8762806.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    route: 'tabletennis' as Route,
    name: 'Ping Pong 3D',
    desc: 'Fast-paced reflex rally with smart AI opponents.',
    tag: 'PLAY NOW',
    img: 'https://images.pexels.com/photos/13793163/pexels-photo-13793163.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export default function LandingPage({ onNavigate }: Props) {
  const [challengeOpen, setChallengeOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackdropGlow />

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        {/* HERO */}
        <section className="mx-auto max-w-3xl pt-12 text-center sm:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px] font-medium tracking-widest text-white/60">AI-POWERED ARCADE</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl sm:leading-tight">
            Games that <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">think</span> back.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/55 sm:text-lg">
            A collection of puzzle and reflex games where artificial intelligence shapes
            every level, every hint, and every challenge.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-5 backdrop-blur-sm transition hover:border-cyan-400/30">
              <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-500/20" />
              <div className="relative flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30 transition group-hover:scale-110">
                    <Smartphone className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold tracking-widest text-white/40">MOBILE</p>
                    <p className="text-sm font-semibold text-white/80">Touch to play</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/30 transition group-hover:scale-110">
                    <Monitor className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold tracking-widest text-white/40">DESKTOP</p>
                    <p className="text-sm font-semibold text-white/80">Click to play</p>
                  </div>
                </div>
              </div>
              <p className="relative mt-3 text-center text-xs font-medium tracking-wide text-white/50">
                Play Games on Mobile / Desktop
              </p>
            </div>
          </div>
        </section>

        {/* FLOATING AI CARDS */}
        <section className="mt-24 sm:mt-32">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What AI can do for games</h2>
            <p className="mt-2 text-sm text-white/45">Six ways intelligence powers the arcade</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_CARDS.map((card, i) => (
              <FloatingCard key={card.title} {...card} index={i} />
            ))}
          </div>
        </section>

        {/* GAMES SHOWCASE */}
        <section className="mt-24 sm:mt-32">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose your game</h2>
            <p className="mt-2 text-sm text-white/45">Tap a card to jump in</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
            {GAMES.map((g) => {
              const card = (
                <button
                  key={g.route}
                  onClick={() => onNavigate(g.route)}
                  className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] text-left transition hover:border-white/25 hover:scale-[1.02]"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={g.img}
                      alt={g.name}
                      className="h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-110 group-hover:opacity-80"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/40 to-transparent" />
                    <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${
                      g.tag === 'PLAY NOW'
                        ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40'
                        : 'bg-amber-500/15 text-amber-300/80 ring-1 ring-amber-400/30'
                    }`}>
                      {g.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white">{g.name}</h3>
                    <p className="mt-1 text-sm text-white/50">{g.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 transition group-hover:gap-2">
                      Enter <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );

              if (g.route !== 'crossword') return card;

              return (
                <div key={g.route} className="flex flex-col gap-6">
                  {card}
                  <ChallengeFlyer onOpen={() => setChallengeOpen(true)} />
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto mt-24 max-w-2xl text-center sm:mt-32">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 p-10 backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-cyan-300" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Got an idea for a game?</h2>
            <p className="mt-3 text-sm text-white/50">
              Tell us what you want to play next. The best ideas come from the community.
            </p>
            <button
              onClick={() => onNavigate('feedback')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              Share your idea
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed bottom-3 left-4 z-40">
        <p className="text-xs font-medium tracking-wide text-white/40">
          &copy; {new Date().getFullYear()} ArcadeAI &middot; All rights reserved &middot; v{GAME_VERSION}
        </p>
      </div>

      <ChallengeModal
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        onAccept={() => onNavigate('crossword')}
      />
    </div>
  );
}

function FloatingCard({
  icon: Icon,
  title,
  desc,
  accent,
  index,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  accent: string;
  index: number;
}) {
  return (
    <div
      className={`ai-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-white/20`}
      style={{ animationDelay: `${index * 0.4}s` }}
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
        style={{ background: accent }}
      />
      <div
        className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition group-hover:scale-110"
        style={{ background: `${accent}15`, boxShadow: `0 0 20px ${accent}30`, borderColor: `${accent}40` }}
      >
        <Icon className="h-6 w-6" style={{ color: accent }} />
      </div>
      <h3 className="relative text-lg font-bold text-white">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-white/55">{desc}</p>
    </div>
  );
}

function ChallengeFlyer({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="challenge-flyer group relative overflow-hidden rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 via-[#0c0c12] to-cyan-500/10 p-5 transition hover:border-orange-400/50">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-500/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-cyan-500/15 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 ring-1 ring-orange-400/40">
          <Flame className="h-5 w-5 text-orange-400" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-widest text-orange-300/80">SPEED SHOWDOWN</p>
          <h3 className="mt-0.5 text-base font-extrabold text-white">
            FRIENDS <span className="text-cyan-300">VS</span> FRIENDS
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Challenge a friend to beat your finish time on the same puzzle set.
          </p>
          <button
            onClick={onOpen}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-xs font-bold text-white transition hover:scale-105"
          >
            <Flame className="h-3.5 w-3.5" />
            ACCEPT THE CHALLENGE
          </button>
        </div>
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[140px]" />
      <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
      <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-blue-500/6 blur-[120px]" />
    </div>
  );
}

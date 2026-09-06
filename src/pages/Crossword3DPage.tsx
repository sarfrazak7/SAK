import { Boxes, Construction } from 'lucide-react';
import { useRouter } from '@/lib/router';

export default function Crossword3DPage() {
  const { navigate } = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackdropGlow />

      <div className="absolute top-4 left-12 z-20">
        <button
          onClick={() => navigate('home')}
          className="group flex items-center gap-2"
          style={{
            padding: '6px 12px',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.75)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15 transition-transform group-hover:scale-105">
            <Boxes className="h-4 w-4 text-cyan-300" />
          </div>
          <span className="text-xs font-bold tracking-[0.18em] text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            ARCADE<span className="text-cyan-300" style={{ textShadow: '0 0 6px rgba(34,211,238,0.6)' }}>AI</span>
          </span>
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 ring-1 ring-amber-400/20">
          <Construction className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          CrossWord <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">3D</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/50 sm:text-base">
          An immersive 3D crossword experience is being crafted. Check back soon to solve clues across rotating faces of a cube.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2">
          <Construction className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold tracking-widest text-amber-300">IN DEVELOPMENT</span>
        </div>
        <button
          onClick={() => navigate('home')}
          className="mt-8 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/6 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
    </div>
  );
}

import { Boxes } from 'lucide-react';
import { useRouter } from '@/lib/router';

export default function BackToHomeButton() {
  const { navigate } = useRouter();

  return (
    <button
      onClick={() => navigate('home')}
      className="group flex items-center gap-2.5"
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 100,
        padding: '6px 12px',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.75)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
      aria-label="Back to ARCADEAI home"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15 transition-transform group-hover:scale-105">
        <Boxes className="h-5 w-5 text-cyan-300" />
      </div>
      <span className="text-sm font-bold tracking-[0.18em] text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
        ARCADE<span className="text-cyan-300">AI</span><span className="text-red-500" style={{ textShadow: '0 0 6px rgba(239,68,68,0.6)' }}> 3D</span>
      </span>
    </button>
  );
}

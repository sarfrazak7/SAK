import { Boxes } from 'lucide-react';
import { useRouter } from '@/lib/router';

export default function BackToHomeButton() {
  const { navigate } = useRouter();

  return (
    <button
      onClick={() => navigate('home')}
      className="group flex items-center gap-2"
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 100,
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
      aria-label="Back to ARCADEAI home"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15 transition-transform group-hover:scale-105">
        <Boxes className="h-4 w-4 text-cyan-300" />
      </div>
      <span className="text-xs font-bold tracking-[0.18em] text-white">
        ARCADE<span className="text-cyan-300">AI</span>
      </span>
    </button>
  );
}

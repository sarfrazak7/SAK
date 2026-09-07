import { useRef } from 'react';
import { RotateCw } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';

const GAME_VERSION = '20260907-1';

export default function Crossword3DPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadGame = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = `/crossword3d.html?v=${GAME_VERSION}&t=${Date.now()}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#eee' }}>
      <iframe
        ref={iframeRef}
        src={`/crossword3d.html?v=${GAME_VERSION}`}
        title="CrossWord Pro 3D"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; fullscreen"
      />
      <BackToHomeButton />
      <button
        onClick={reloadGame}
        aria-label="Reload game"
        style={{
          position: 'fixed',
          top: 12,
          right: 100,
          zIndex: 100,
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        <RotateCw className="h-4 w-4 text-white/80" />
      </button>
    </div>
  );
}

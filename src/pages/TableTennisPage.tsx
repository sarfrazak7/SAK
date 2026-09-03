import { useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';

const GAME_VERSION = '20260903-34';

export default function TableTennisPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const send = () => {
      iframe.contentWindow?.postMessage(
        { type: 'supabase-creds', url, key },
        '*',
      );
    };
    iframe.addEventListener('load', send);
    return () => iframe.removeEventListener('load', send);
  }, []);

  const reloadGame = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = `/pingpong.html?v=${GAME_VERSION}&t=${Date.now()}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0b1017' }}>
      <iframe
        ref={iframeRef}
        src={`/pingpong.html?v=${GAME_VERSION}`}
        title="Table Tennis"
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
          left: 120,
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

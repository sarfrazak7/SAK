import { useEffect, useRef, useState } from 'react';
import { RotateCw, Lightbulb } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';
import CrosswordProTips from '@/components/CrosswordProTips';
import { getDeviceId } from '@/game/crossword3dPlayerStats';

const GAME_VERSION = '20260908-12';
const TOP_BAR = 66;

export default function Crossword3DPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const deviceId = getDeviceId();
    const send = () => {
      iframe.contentWindow?.postMessage(
        { type: 'crossword3d-creds', url, key, deviceId },
        '*',
      );
    };
    iframe.addEventListener('load', send);
    return () => iframe.removeEventListener('load', send);
  }, []);

  const reloadGame = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = `/crossword3d.html?v=${GAME_VERSION}&t=${Date.now()}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <iframe
        ref={iframeRef}
        src={`/crossword3d.html?v=${GAME_VERSION}`}
        title="CrossWord Pro 3D"
        style={{
          position: 'absolute',
          top: TOP_BAR,
          left: 0,
          width: '100%',
          height: `calc(100% - ${TOP_BAR}px)`,
          border: 'none',
          display: 'block',
        }}
        allow="autoplay; fullscreen"
      />
      <BackToHomeButton />
      <button
        onClick={() => setShowTips(true)}
        aria-label="Pro Tips"
        style={{
          position: 'fixed',
          top: 12,
          right: 140,
          zIndex: 100,
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      >
        <Lightbulb className="h-4 w-4 text-red-500 protip-blink" />
      </button>
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
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      >
        <RotateCw className="h-4 w-4 text-white/80" />
      </button>
      {showTips && <CrosswordProTips onClose={() => setShowTips(false)} />}
    </div>
  );
}

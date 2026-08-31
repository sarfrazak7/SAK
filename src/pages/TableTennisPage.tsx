import { useEffect, useRef } from 'react';
import BackToHomeButton from '@/components/BackToHomeButton';

const GAME_VERSION = '20260831-5';

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
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { RotateCw, Lightbulb, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';
import CrosswordProTips from '@/components/CrosswordProTips';
import { getDeviceId } from '@/game/crossword3dPlayerStats';
import SilentViewCounter from '@/components/SilentViewCounter';

const GAME_VERSION = '20260916-39';
const TOP_BAR = 66;

export default function Crossword3DPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showTips, setShowTips] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const speechUnlockedRef = useRef(false);

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // iOS Safari requires a user gesture to unlock speechSynthesis.
  // We prime it on the first tap anywhere in the document.
  useEffect(() => {
    const unlock = () => {
      if (speechUnlockedRef.current) return;
      speechUnlockedRef.current = true;
      try {
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance('');
          u.volume = 0;
          window.speechSynthesis.speak(u);
        }
      } catch {}
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

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
      iframe.contentWindow?.postMessage(
        { type: 'crossword3d-mute', muted },
        '*',
      );
    };
    iframe.addEventListener('load', send);
    return () => iframe.removeEventListener('load', send);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow?.postMessage(
        { type: 'crossword3d-mute', muted },
        '*',
      );
    }
  }, [muted]);

  const reloadGame = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = `./crossword3d.html?v=${GAME_VERSION}&t=${Date.now()}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        const el = document.documentElement;
        const req = el.requestFullscreen || (el as any).webkitRequestFullscreen;
        if (req) {
          const result = req.call(el);
          if (result && typeof result.catch === 'function') {
            result.catch(() => {});
          }
        }
        window.scrollTo(0, 0);
      } else {
        const exit = document.exitFullscreen || (document as any).webkitExitFullscreen;
        if (exit) exit.call(document);
      }
      return next;
    });
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    const onMessage = (e: MessageEvent) => {
      const m = e.data;
      if (!m) return;
      if (m.type === 'crossword3d-speak' && !mutedRef.current) {
        try {
          if (window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(m.text);
            u.rate = 0.75;
            u.pitch = 1.0;
            u.volume = 0.8;
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            window.speechSynthesis.speak(u);
            // iOS Safari stops speechSynthesis after ~15s; keep it alive
            if (!keepAlive) {
              keepAlive = setInterval(() => {
                if (window.speechSynthesis && !window.speechSynthesis.speaking) {
                  if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
                } else if (window.speechSynthesis) {
                  window.speechSynthesis.resume();
                }
              }, 5000);
            }
          }
        } catch {}
      } else if (m.type === 'crossword3d-speak-cancel') {
        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
        } catch {}
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (keepAlive) clearInterval(keepAlive);
    };
  }, []);

  const btnStyle: React.CSSProperties = {
    position: 'fixed',
    top: 16,
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
  };

  const hoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
  };
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <SilentViewCounter />
      <iframe
        ref={iframeRef}
        src={`./crossword3d.html?v=${GAME_VERSION}`}
        title="CrossWord Pro 3D"
        style={{
          position: 'absolute',
          top: isFullscreen ? 0 : TOP_BAR,
          left: 0,
          width: '100%',
          height: isFullscreen ? '100dvh' : `calc(100dvh - ${TOP_BAR}px)`,
          border: 'none',
          display: 'block',
          zIndex: 1,
        }}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
      {!isFullscreen && <BackToHomeButton />}
      {!isFullscreen && (
        <button
          onClick={() => {
            // This tap also unlocks speech on iOS Safari
            if (!speechUnlockedRef.current && window.speechSynthesis) {
              speechUnlockedRef.current = true;
              try {
                const u = new SpeechSynthesisUtterance('');
                u.volume = 0;
                window.speechSynthesis.speak(u);
              } catch {}
            }
            setMuted(!muted);
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute' : 'Mute'}
          style={{ ...btnStyle, right: 152 }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          {muted
            ? <VolumeX className="h-4 w-4 text-white/80" />
            : <Volume2 className="h-4 w-4 text-white/80" />}
        </button>
      )}
      {!isFullscreen && (
        <button
          onClick={() => setShowTips(true)}
          aria-label="Pro Tips"
          style={{ ...btnStyle, right: 108 }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          <Lightbulb className="h-4 w-4 text-red-500 protip-blink" />
        </button>
      )}
      {!isFullscreen && (
        <button
          onClick={reloadGame}
          aria-label="Reload game"
          style={{ ...btnStyle, right: 64 }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          <RotateCw className="h-4 w-4 text-white/80" />
        </button>
      )}
      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        style={{
          ...btnStyle,
          top: isFullscreen ? 'max(12px, env(safe-area-inset-top))' : 12,
          right: isFullscreen ? 'max(12px, env(safe-area-inset-right))' : 20,
          zIndex: 300,
          background: isFullscreen ? 'rgba(220,160,30,0.3)' : btnStyle.background,
        }}
        onMouseEnter={hoverIn}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isFullscreen ? 'rgba(220,160,30,0.3)' : 'rgba(255,255,255,0.08)';
        }}
      >
        {isFullscreen
          ? <Minimize className="h-4 w-4 text-white" />
          : <Maximize className="h-4 w-4 text-white/80" />}
      </button>
      {showTips && <CrosswordProTips onClose={() => setShowTips(false)} />}
    </div>
  );
}

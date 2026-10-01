import { useRef, useState, useEffect } from 'react';
import { RotateCw, Globe, Lightbulb } from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';
import SilentViewCounter from '@/components/SilentViewCounter';
import RoboStoryTips from '@/components/RoboStoryTips';

const GAME_VERSION = '20260930-25';
const TOP_BAR = 92;
const RATIO = 9 / 16;

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'ja', label: '日本語', flag: 'JP' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'ur', label: 'اردو', flag: 'PK' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: 'IN' },
];

export default function RoboStoryLandPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [showTips, setShowTips] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [lang, setLang] = useState('en');
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compute = () => {
      const availW = window.innerWidth;
      const availH = window.innerHeight - TOP_BAR;
      let width = availW;
      let height = width / RATIO;
      if (height > availH) {
        height = availH;
        width = height * RATIO;
      }
      setFrameSize({ width: Math.round(width), height: Math.round(height) });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sendLanguage = (code: string) => {
    setLang(code);
    setShowLangs(false);
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'robo-language-change', lang: code }, '*');
    }
  };

  const reloadGame = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = `./robostoryland.html?v=${GAME_VERSION}&t=${Date.now()}`;
  };

  const { width, height } = frameSize;

  const btnStyle: React.CSSProperties = {
    position: 'fixed',
    top: 14,
    zIndex: 100,
    width: 34,
    height: 34,
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
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <SilentViewCounter />
      <BackToHomeButton />

      {/* Header bar — "Aya RoboStoryLand" */}
      <div
        style={{
          position: 'fixed',
          top: 52,
          left: 0,
          right: 0,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90,
          background: 'linear-gradient(180deg, rgba(15,15,28,0.6) 0%, rgba(15,15,28,0.3) 100%)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: '0.14em',
            color: '#ffd86a',
            textShadow: '0 0 16px rgba(255,216,106,0.4), 0 1px 3px rgba(0,0,0,0.6)',
            background: 'linear-gradient(135deg, rgba(255,216,106,0.12), rgba(255,184,40,0.04))',
            padding: '2px 16px',
            borderRadius: 6,
            borderBottom: '1px solid rgba(255,216,106,0.18)',
          }}
        >
          AYA ROBOSTORYLAND
        </span>
      </div>

      {width > 0 && (
        <div
          style={{
            position: 'absolute',
            top: TOP_BAR,
            left: '50%',
            transform: 'translateX(-50%)',
            width,
            height,
            borderRadius: width < window.innerWidth - 4 ? 16 : 0,
            overflow: 'hidden',
            boxShadow: width < window.innerWidth - 4
              ? '0 0 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
              : 'none',
          }}
        >
          <iframe
            ref={iframeRef}
            src={`./robostoryland.html?v=${GAME_VERSION}`}
            title="RoboStoryLand"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            allow="autoplay; fullscreen"
          />
        </div>
      )}

      {/* Right-side buttons: reload, language, protips — extreme right with padding */}
      <button
        onClick={reloadGame}
        aria-label="Reload game"
        style={{ ...btnStyle, right: 16 }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <RotateCw className="h-4 w-4 text-white/80" />
      </button>

      <div ref={langRef} style={{ position: 'fixed', top: 14, right: 58, zIndex: 100 }}>
        <button
          onClick={() => setShowLangs((v) => !v)}
          aria-label="Select language"
          style={{
            ...btnStyle,
            position: 'relative',
            top: 0,
            right: 0,
            width: 34,
          }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          <Globe className="h-4 w-4 text-white/80" />
        </button>
        {showLangs && (
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 0,
              width: 176,
              borderRadius: 16,
              background: 'rgba(15,15,28,0.92)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              animation: 'popupIn 0.2s ease-out',
            }}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => sendLanguage(l.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: l.code === lang ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: l.code === lang ? '#d4af37' : 'rgba(255,255,255,0.8)',
                  fontSize: 13,
                  fontWeight: l.code === lang ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  if (l.code !== lang) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{
                  width: 28,
                  height: 20,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, rgba(56,189,248,0.2), rgba(99,102,241,0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  flexShrink: 0,
                }}>
                  {l.flag}
                </span>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowTips(true)}
        aria-label="Pro Tips"
        style={{ ...btnStyle, right: 100 }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <Lightbulb className="h-4 w-4 text-red-500 protip-blink" />
      </button>

      {showTips && <RoboStoryTips onClose={() => setShowTips(false)} />}
    </div>
  );
}

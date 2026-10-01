import { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, RotateCw, X } from 'lucide-react';

function syllabify(word: string): string[] {
  word = word.toUpperCase();
  if (word.length <= 3) return [word];
  const V = new Set(['A', 'E', 'I', 'O', 'U']);
  let syls: string[] = [];
  let cur = '';
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    cur += ch;
    if (V.has(ch)) {
      const rest = word.slice(i + 1);
      const nextV = rest.search(/[AEIOU]/);
      if (nextV === -1) {
        syls.push(cur);
        cur = '';
      } else if (nextV === 0) {
        syls.push(cur);
        cur = '';
      } else {
        const consBlock = rest.slice(0, nextV);
        if (consBlock.length >= 2) {
          cur += consBlock[0];
          syls.push(cur);
          cur = consBlock.slice(1);
        } else {
          syls.push(cur + consBlock);
          cur = '';
        }
        i += consBlock.length;
      }
    }
  }
  if (cur) syls.push(cur);
  return syls.length ? syls : [word];
}

export default function PhonicsPage() {
  const [input, setInput] = useState('');
  const [word, setWord] = useState('');
  const [syllables, setSyllables] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const speechUnlockedRef = useRef(false);

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

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch {}
    };
  }, [clearTimers]);

  const speak = useCallback((text: string, sync?: boolean) => {
    try {
      if (window.speechSynthesis) {
        if (sync) window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.75;
        u.pitch = 1.0;
        u.volume = 0.9;
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(u);
      }
    } catch {}
  }, []);

  const playWord = useCallback((w: string) => {
    if (!w || w.length < 2) return;
    clearTimers();
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch {}

    const syls = syllabify(w);
    setWord(w);
    setSyllables(syls);
    setActiveIdx(-1);
    setDone(false);
    setIsPlaying(true);

    speak(w, true);

    let delay = 600;
    syls.forEach((s, i) => {
      timersRef.current.push(
        setTimeout(() => {
          setActiveIdx(i);
          speak(s);
        }, delay),
      );
      delay += Math.max(s.length * 200, 500);
    });

    timersRef.current.push(
      setTimeout(() => {
        setActiveIdx(-1);
        setDone(true);
        speak(w);
      }, delay),
    );

    timersRef.current.push(
      setTimeout(() => {
        setIsPlaying(false);
      }, delay + w.length * 180 + 1200),
    );
  }, [clearTimers, speak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    playWord(trimmed);
  };

  const handleReplay = () => {
    if (word) playWord(word);
  };

  const handleClear = () => {
    clearTimers();
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch {}
    setWord('');
    setSyllables([]);
    setActiveIdx(-1);
    setIsPlaying(false);
    setDone(false);
    setInput('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, #0f1929 0%, #0a0f1a 50%, #050810 100%)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 22,
          letterSpacing: '0.14em',
          color: '#ffd86a',
          textShadow: '0 0 20px rgba(255,216,106,0.4), 0 2px 4px rgba(0,0,0,0.6)',
          marginBottom: 32,
        }}
      >
        PHONICS
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a word…"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%',
              padding: '14px 48px 14px 18px',
              fontSize: 20,
              fontWeight: 600,
              borderRadius: 14,
              border: '1px solid rgba(255,216,106,0.25)',
              background: 'rgba(15,15,28,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#fff',
              outline: 'none',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,216,106,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,216,106,0.25)'; }}
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              aria-label="Clear input"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isPlaying}
          style={{
            marginTop: 16,
            padding: '10px 28px',
            borderRadius: 12,
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: isPlaying ? 'wait' : 'pointer',
            background: isPlaying
              ? 'linear-gradient(135deg, rgba(255,216,106,0.3), rgba(255,184,40,0.15))'
              : 'linear-gradient(135deg, rgba(255,216,106,0.9), rgba(255,184,40,0.7))',
            color: '#1a1a2e',
            boxShadow: isPlaying
              ? '0 4px 16px rgba(255,216,106,0.15)'
              : '0 4px 20px rgba(255,216,106,0.3)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Volume2 className="h-5 w-5" />
          {isPlaying ? 'Playing…' : 'Speak Phonics'}
        </button>
      </form>

      {word && (
        <div
          style={{
            marginTop: 36,
            width: '100%',
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: done ? '#6ee787' : '#06b6d4',
              textShadow: done
                ? '0 0 20px rgba(110,231,135,0.4)'
                : '0 0 20px rgba(6,182,212,0.4)',
              transition: 'color 0.4s, text-shadow 0.4s',
              fontFamily: 'monospace',
            }}
          >
            {word.toUpperCase()}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {syllables.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontSize: 24,
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              transition: 'all 0.25s',
              background:
                activeIdx === i
                  ? 'linear-gradient(135deg, rgba(255,216,106,0.9), rgba(255,184,40,0.7))'
                  : 'rgba(255,255,255,0.06)',
              color: activeIdx === i ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
              border:
                activeIdx === i
                  ? '1px solid rgba(255,216,106,0.6)'
                  : '1px solid rgba(255,255,255,0.08)',
              boxShadow:
                activeIdx === i
                  ? '0 0 24px rgba(255,216,106,0.35), 0 4px 12px rgba(0,0,0,0.3)'
                  : 'none',
              transform: activeIdx === i ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={handleReplay}
              disabled={isPlaying}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                border: '1px solid rgba(255,216,106,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,216,106,0.8)',
                fontSize: 13,
                fontWeight: 600,
                cursor: isPlaying ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <RotateCw className="h-4 w-4" />
              Replay
            </button>
            <button
              onClick={handleClear}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

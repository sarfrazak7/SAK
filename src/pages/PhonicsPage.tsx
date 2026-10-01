import { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, RotateCw, X, BookOpen, ExternalLink, Loader2, Clock } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { Boxes } from 'lucide-react';

interface DictDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface DictResult {
  phonetic?: string;
  definitions: DictDefinition[];
  sourceUrl: string;
  source: string;
}

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

const HISTORY_KEY = 'phonics-history';
const MAX_HISTORY = 50;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveHistory(words: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(words.slice(0, MAX_HISTORY)));
  } catch {}
}

async function fetchDefinition(wLower: string): Promise<DictResult> {
  // Try dictionaryapi.dev first
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wLower)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length) {
        const entry = data[0];
        const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find((p: any) => p.text)?.text) || '';
        const defs: DictDefinition[] = [];
        for (const meaning of entry.meanings || []) {
          for (const d of meaning.definitions || []) {
            defs.push({
              partOfSpeech: meaning.partOfSpeech || '',
              definition: d.definition || '',
              example: d.example,
            });
            if (defs.length >= 4) break;
          }
          if (defs.length >= 4) break;
        }
        if (defs.length) {
          return {
            phonetic,
            definitions: defs,
            sourceUrl: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(wLower)}`,
            source: 'dictionaryapi.dev',
          };
        }
      }
    }
  } catch {}

  // Fallback: Wiktionary REST API (much broader coverage, includes medical/scientific terms)
  try {
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(wLower)}`);
    if (res.ok) {
      const data = await res.json();
      const langEntry = data['en'];
      if (langEntry && langEntry.length) {
        const defs: DictDefinition[] = [];
        for (const posEntry of langEntry) {
          const pos = posEntry.partOfSpeech || 'definition';
          for (const def of (posEntry.definitions || [])) {
            const defText = def.definition
              ? def.definition.replace(/<[^>]*>/g, '').trim()
              : '';
            if (!defText) continue;
            const example = def.examples && def.examples[0]
              ? def.examples[0].text?.replace(/<[^>]*>/g, '').trim() || undefined
              : undefined;
            defs.push({ partOfSpeech: pos, definition: defText, example });
            if (defs.length >= 4) break;
          }
          if (defs.length >= 4) break;
        }
        if (defs.length) {
          return {
            definitions: defs,
            sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(wLower)}`,
            source: 'Wiktionary',
          };
        }
      }
    }
  } catch {}

  throw new Error('Not found');
}

export default function PhonicsPage() {
  const { navigate } = useRouter();
  const [input, setInput] = useState('');
  const [word, setWord] = useState('');
  const [syllables, setSyllables] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [dictResult, setDictResult] = useState<DictResult | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const speechUnlockedRef = useRef(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((w: string) => {
    const lower = w.toLowerCase();
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== lower);
      const next = [lower, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

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
    setDictResult(null);
    setDictError('');
    addToHistory(w);

    speak(w, true);

    // Fetch dictionary definition (with Wiktionary fallback)
    setDictLoading(true);
    const wLower = w.toLowerCase();
    fetchDefinition(wLower)
      .then((result) => setDictResult(result))
      .catch(() => setDictError(`No dictionary entry found for "${wLower}"`))
      .finally(() => setDictLoading(false));

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
  }, [clearTimers, speak, addToHistory]);

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
    setDictResult(null);
    setDictError('');
    setDictLoading(false);
  };

  const handleHistoryClick = (w: string) => {
    setInput(w);
    playWord(w);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
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
      {/* ARCADEAI logo — top left, returns to landing page */}
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
        <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-white/15 transition-transform group-hover:scale-105">
          <Boxes className="h-5 w-5 text-cyan-300" />
        </div>
        <span className="text-sm tracking-[0.18em] font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          ARCADE<span className="text-cyan-300">AI</span>
        </span>
      </button>

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

      {/* Word history */}
      {history.length > 0 && (
        <div style={{ width: '100%', maxWidth: 600, marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Clock className="h-3.5 w-3.5 text-amber-400/40" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>
              HISTORY
            </span>
            <button
              onClick={handleClearHistory}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                color: 'rgba(255,255,255,0.2)',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              clear
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxHeight: 72, overflow: 'hidden' }}>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(h)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: word.toLowerCase() === h ? 'rgba(255,216,106,0.15)' : 'rgba(255,255,255,0.04)',
                  color: word.toLowerCase() === h ? 'rgba(255,216,106,0.9)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = word.toLowerCase() === h ? 'rgba(255,216,106,0.15)' : 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = word.toLowerCase() === h ? 'rgba(255,216,106,0.9)' : 'rgba(255,255,255,0.4)';
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

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

          {(dictLoading || dictResult || dictError) && (
            <div
              style={{
                width: '100%',
                marginTop: 8,
                borderRadius: 16,
                background: 'rgba(15,15,28,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <BookOpen className="h-4 w-4 text-amber-400/70" />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,216,106,0.8)' }}>
                  DEFINITION
                </span>
                {dictResult?.phonetic && (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    {dictResult.phonetic}
                  </span>
                )}
                {dictResult?.source && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
                    via {dictResult.source}
                  </span>
                )}
              </div>

              {dictLoading && (
                <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 className="h-4 w-4 text-amber-400/50 animate-spin" />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Looking up definition…</span>
                </div>
              )}

              {dictError && !dictLoading && (
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    {dictError}
                  </p>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(word + ' definition')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,216,106,0.6)',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Search on Google
                  </a>
                </div>
              )}

              {dictResult && !dictLoading && (
                <div style={{ padding: '14px 18px' }}>
                  {dictResult.definitions.map((d, i) => (
                    <div key={i} style={{ marginBottom: i < dictResult.definitions.length - 1 ? 14 : 0 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#06b6d4',
                          background: 'rgba(6,182,212,0.1)',
                          padding: '2px 8px',
                          borderRadius: 6,
                          marginBottom: 6,
                        }}
                      >
                        {d.partOfSpeech}
                      </span>
                      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                        {d.definition}
                      </p>
                      {d.example && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', margin: '6px 0 0', lineHeight: 1.5 }}>
                          "{d.example}"
                        </p>
                      )}
                    </div>
                  ))}
                  <a
                    href={dictResult.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,216,106,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,216,106,1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,216,106,0.7)'; }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {dictResult.source === 'Wiktionary' ? 'View on Wiktionary' : 'View on Merriam-Webster'}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

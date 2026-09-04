import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Github, Trophy, Lightbulb } from 'lucide-react';
import Cube from '@/components/Cube';
import WordPanel from '@/components/WordPanel';
import Controls from '@/components/Controls';
import BackToHomeButton from '@/components/BackToHomeButton';
import { buildPuzzles, totalWordCount, FACE_SETS, pickRandomSetIndex } from '@/game/puzzles';
import type { Cell, SpinDir } from '@/game/types';
import { playClap, playBuzzer, unlockAudio } from '@/lib/sound';
import { bonusForElapsed, tierLabel } from '@/game/scoring';
import CrosswordProTips from '@/components/CrosswordProTips';

const FACE_HOME_ROT: Array<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: 0, y: -90 },
  { x: -90, y: 0 },
  { x: 90, y: 0 },
  { x: 0, y: 180 },
  { x: 0, y: 90 },
];

const FACE_NORMALS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 1],
  [1, 0, 0],
  [0, -1, 0],
  [0, 1, 0],
  [0, 0, -1],
  [-1, 0, 0],
];

function faceFromRotation(rotX: number, rotY: number): number {
  const rx = (rotX * Math.PI) / 180;
  const ry = (rotY * Math.PI) / 180;
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  let best = 0;
  let bestZ = -Infinity;
  for (let i = 0; i < FACE_NORMALS.length; i++) {
    const [nx, ny, nz] = FACE_NORMALS[i];
    const z = -nx * cx * sy + ny * sx + nz * cx * cy;
    if (z > bestZ) {
      bestZ = z;
      best = i;
    }
  }
  return best;
}

export default function CrosswordPage() {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const face = faceFromRotation(rotX, rotY);
  const [foundByFace, setFoundByFace] = useState<Record<number, string[]>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pointsByFace, setPointsByFace] = useState<Record<number, number>>({});
  const [bonusFlash, setBonusFlash] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const faceStartRef = useRef(Date.now());
  const lastTimeoutFaceRef = useRef(-1);

  const puzzles = useMemo(() => buildPuzzles(setIndex), [setIndex]);
  const TOTAL = useMemo(() => totalWordCount(puzzles), [puzzles]);

  const foundList = foundByFace[face] ?? [];
  const totalFound = Object.values(foundByFace).reduce((n, arr) => n + arr.length, 0);
  const totalPoints = Object.values(pointsByFace).reduce((a, b) => a + b, 0);
  const allCleared = totalFound === TOTAL;

  useEffect(() => {
    faceStartRef.current = Date.now();
  }, [face]);

  const handlePlay = useCallback(() => {
    // This runs inside a click gesture — the ideal moment to unlock iOS audio.
    unlockAudio();
    setRunning(true);
    faceStartRef.current = Date.now();
    setRevealed(false);
  }, []);

  // Auto-stop when a face is cleared so the timer pauses
  useEffect(() => {
    if (running && foundList.length === puzzles[face].words.length) {
      setRunning(false);
    }
  }, [running, foundList.length, puzzles, face]);

  const handleSpin = useCallback((dir: SpinDir) => {
    if (dir === 'right') setRotY((y) => y + 90);
    else if (dir === 'left') setRotY((y) => y - 90);
    else if (dir === 'up') setRotX((x) => x - 90);
    else setRotX((x) => x + 90);
  }, []);

  const handleJump = useCallback((targetFace: number) => {
    setRotX(FACE_HOME_ROT[targetFace].x);
    setRotY(FACE_HOME_ROT[targetFace].y);
  }, []);

  const handleTimeout = useCallback(() => {
    if (lastTimeoutFaceRef.current === face) return;
    lastTimeoutFaceRef.current = face;
    setRunning(false);
    playBuzzer();
    setRotX(FACE_HOME_ROT[(face + 1) % 6].x);
    setRotY(FACE_HOME_ROT[(face + 1) % 6].y);
  }, [face]);

  const handleCorrect = useCallback((word: string, _cells: Cell[], whichFace: number) => {
    const existing = foundByFace[whichFace] ?? [];
    if (existing.includes(word)) return;

    playClap();
    setFoundByFace((prev) => {
      const ex = prev[whichFace] ?? [];
      if (ex.includes(word)) return prev;
      return { ...prev, [whichFace]: [...ex, word] };
    });

    const newCount = existing.length + 1;
    if (newCount === puzzles[whichFace].words.length) {
      const elapsed = (Date.now() - faceStartRef.current) / 1000;
      const bonus = bonusForElapsed(elapsed);
      if (bonus > 0) {
        setPointsByFace((pp) => (pp[whichFace] !== undefined ? pp : { ...pp, [whichFace]: bonus }));
      }
      setFlash(`+1  ${word}`);
      setBonusFlash(`Face cleared! +${bonus} pts · ${tierLabel(elapsed)}`);
    } else {
      setFlash(`+1  ${word}`);
    }
    window.setTimeout(() => { setFlash(null); setBonusFlash(null); }, 1600);
  }, [foundByFace, puzzles]);

  const resetFace = () => setFoundByFace((prev) => ({ ...prev, [face]: [] }));
  const resetAll = () => {
    setFoundByFace({});
    setPointsByFace({});
    setRotX(0);
    setRotY(0);
    setSetIndex((i) => pickRandomSetIndex(i));
    setRevealed(false);
    setRunning(false);
    lastTimeoutFaceRef.current = -1;
  };

  const toggleReveal = () => setRevealed((v) => !v);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackdropGlow />
      <BackToHomeButton />

      {/* Pro Tips icon — top right corner */}
      <button
        onClick={() => setShowProTips(true)}
        className="fixed top-4 right-4 z-30 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-casino-gold/10 text-gray-400 hover:text-casino-gold transition-colors"
        title="Pro Tips"
        aria-label="Pro Tips"
      >
        <span className="prorec-led" aria-hidden="true">
          <span className="prorec-led-core" />
        </span>
        <Lightbulb className="w-4 h-4" />
      </button>

      {/* CrossWord 3D header — centered at top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div
          className="rounded-xl border px-6 py-2 text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(23,39,55,0.9), rgba(7,13,19,0.9))',
            borderColor: 'rgba(255,216,106,0.25)',
            boxShadow: '0 8px 18px rgba(0,0,0,0.28)',
          }}
        >
          <span
            className="font-bold tracking-[0.08em]"
            style={{
              fontSize: '15px',
              color: '#ffd86a',
              textShadow: '0 0 16px rgba(255,216,106,0.4), 0 1px 3px rgba(0,0,0,0.6)',
            }}
          >
            CrossWord 3D
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-24 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-white/50">
          <span>Set {setIndex + 1}/{FACE_SETS.length}</span>
          <span className="h-4 w-px bg-white/15" />
          <span>Face {face + 1}/6</span>
          <span className="h-4 w-px bg-white/15" />
          <span className="font-medium text-white/80">{totalFound}/{TOTAL} words</span>
          <span className="h-4 w-px bg-white/15" />
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <Trophy className="h-3.5 w-3.5" /> {totalPoints} pts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <section className="relative flex min-h-[60vh] items-center justify-center">
            <Cube
              puzzles={puzzles}
              face={face}
              rotX={rotX}
              rotY={rotY}
              onSpin={handleSpin}
              foundByFace={foundByFace}
              onCorrect={handleCorrect}
              onTimeout={handleTimeout}
              revealed={revealed}
              running={running}
              onPlay={handlePlay}
            />
            {flash && (
              <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/30 backdrop-blur-sm">
                {flash}
              </div>
            )}
            {bonusFlash && (
              <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-amber-500/20 px-5 py-2 text-sm font-bold text-amber-200 ring-1 ring-amber-400/40 backdrop-blur-sm">
                {bonusFlash}
              </div>
            )}
            {allCleared && (
              <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400/20 to-emerald-400/20 px-5 py-2 text-sm font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                All puzzles solved!
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <WordPanel
              puzzles={puzzles}
              puzzle={puzzles[face]}
              found={foundList}
              totalFound={totalFound}
              totalCount={TOTAL}
              onJump={handleJump}
              foundByFace={foundByFace}
              pointsByFace={pointsByFace}
            />
            <Controls
              puzzles={puzzles}
              foundByFace={foundByFace}
              currentFace={face}
              onJump={handleJump}
              onResetFace={resetFace}
              onResetAll={resetAll}
              onSpin={handleSpin}
              revealed={revealed}
              onToggleReveal={toggleReveal}
            />
            <footer className="flex items-center justify-center gap-1.5 text-[11px] text-white/30">
              <Github className="h-3.5 w-3.5" /> Built with React + CSS 3D
            </footer>
          </aside>
        </div>
      </div>

      {showProTips && (
        <CrosswordProTips onClose={() => setShowProTips(false)} />
      )}
    </div>
  );
}

function BackdropGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/8 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-red-500/8 blur-[120px]" />
    </div>
  );
}

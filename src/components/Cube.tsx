import { useState, useEffect, useRef } from 'react';
import { Hand, Timer, Play } from 'lucide-react';
import type { Puzzle, SpinDir } from '@/game/types';
import GridFace, { StaticGrid } from './GridFace';

interface Props {
  puzzles: Puzzle[];
  face: number;
  rotX: number;
  rotY: number;
  onSpin: (dir: SpinDir) => void;
  foundByFace: Record<number, string[]>;
  onCorrect: (word: string, cells: { row: number; col: number }[], face: number) => void;
  onTimeout: () => void;
  revealed: boolean;
  running: boolean;
  onPlay: () => void;
}

const SIZE = 320;
const HALF = SIZE / 2;

const FACE_TRANSFORMS = [
  `rotateY(0deg) translateZ(${HALF}px)`,
  `rotateY(90deg) translateZ(${HALF}px)`,
  `rotateX(90deg) translateZ(${HALF}px)`,
  `rotateX(-90deg) translateZ(${HALF}px)`,
  `rotateY(180deg) translateZ(${HALF}px)`,
  `rotateY(-90deg) translateZ(${HALF}px)`,
];

const SPIN_MS = 650;

export default function Cube({ puzzles, face, rotX, rotY, onSpin, foundByFace, onCorrect, onTimeout, revealed, running, onPlay }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [displayFace, setDisplayFace] = useState(face);
  const faceRef = useRef(face);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  faceRef.current = face;

  useEffect(() => {
    if (face !== displayFace && !spinning) setSpinning(true);
  }, [face, displayFace, spinning]);

  useEffect(() => {
    if (!spinning) return;
    if (spinTimer.current) clearTimeout(spinTimer.current);
    spinTimer.current = setTimeout(() => {
      setSpinning(false);
      setDisplayFace(faceRef.current);
    }, SPIN_MS);
    return () => { if (spinTimer.current) clearTimeout(spinTimer.current); };
  }, [spinning, rotX, rotY]);

  const triggerSpin = (dir: SpinDir) => {
    if (spinning) return;
    setSpinning(true);
    onSpin(dir);
  };

  const currentPuzzle = puzzles[displayFace];

  return (
    <div className="relative flex touch-none items-center justify-center" style={{ width: '100%', height: '100%' }}>
      <div className="flex flex-col items-center" style={{ perspective: '1600px', perspectiveOrigin: '50% 45%' }}>

        {/* Header + timer — extra bottom margin clears the top hand icon */}
        <div className="mb-12 flex flex-col items-center gap-2.5">
          <TimerBar key={`f${displayFace}`} spinning={spinning} onTimeout={onTimeout} face={displayFace} running={running} />
          <div
            className="flex items-center gap-2 rounded-full px-3.5 py-1 ring-1 ring-white/10"
            style={{
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(8px)',
              opacity: spinning ? 0 : 1,
              transform: spinning ? 'translateY(-8px) scale(0.95)' : 'translateY(0) scale(1)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: currentPuzzle.accent, boxShadow: `0 0 10px ${currentPuzzle.accent}` }}
            />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: currentPuzzle.accent }}>
              {currentPuzzle.name}
            </span>
            <span className="text-[10px] text-white/35">· {currentPuzzle.theme}</span>
          </div>
        </div>

        {/* Cube + hands wrapper */}
        <div className="relative">
          <div className="cube-float">
            <div className="relative" style={{ width: SIZE, height: SIZE }}>

              {/* 3D CUBE BODY */}
              <div
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                  transition: `transform ${SPIN_MS}ms cubic-bezier(0.22, 1.2, 0.32, 1)`,
                }}
              >
                {FACE_TRANSFORMS.map((t, i) => (
                  <Face3D
                    key={i}
                    transform={t}
                    puzzle={puzzles[i]}
                    isFront={i === face}
                    foundWords={foundByFace[i] ?? []}
                    revealed={revealed}
                  />
                ))}

                {CUBE_EDGES.map((e, i) => (
                  <div
                    key={`edge-${i}`}
                    className="absolute"
                    style={{
                      transform: e.transform,
                      width: e.w, height: e.h, top: e.top ?? 0, left: e.left ?? 0,
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                      boxShadow: 'inset 0 0 4px rgba(255,255,255,0.04)',
                    }}
                  />
                ))}
              </div>

              {/* 2D interactive grid overlay */}
              <div
                className="absolute inset-0"
                style={{
                  opacity: spinning ? 0 : 1,
                  transition: `opacity ${SPIN_MS * 0.3}ms ease`,
                  zIndex: 20,
                  padding: 8,
                }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    background: 'rgba(4,4,6,0.96)',
                    borderRadius: 10,
                    boxShadow: `0 0 60px ${currentPuzzle.accent}33, 0 0 120px ${currentPuzzle.accent}18, inset 0 0 40px rgba(0,0,0,0.7)`,
                    border: `2px solid ${currentPuzzle.accent}55`,
                    padding: 4,
                  }}
                >
                  <GridFace
                    key={displayFace}
                    puzzle={currentPuzzle}
                    foundWords={foundByFace[displayFace] ?? []}
                    onCorrect={(word, cells) => onCorrect(word, cells, displayFace)}
                    accent={currentPuzzle.accent}
                    revealed={revealed}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Swipeable hand icons — just outside each cube edge, centered, equidistant */}
          <HandSwipe side="top" onSpin={triggerSpin} disabled={spinning} />
          <HandSwipe side="bottom" onSpin={triggerSpin} disabled={spinning} />
          <HandSwipe side="left" onSpin={triggerSpin} disabled={spinning} />
          <HandSwipe side="right" onSpin={triggerSpin} disabled={spinning} />

          {/* PLAY button — below the bottom hand icon, starts the face timer */}
          {!running && !spinning && (
            <button
              onClick={onPlay}
              className="play-btn absolute left-1/2 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold tracking-wide text-white touch-none"
              style={{
                bottom: -88,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #059669 0%, #06b6d4 100%)',
                boxShadow: '0 4px 20px rgba(6,182,212,0.5), 0 0 30px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                zIndex: 40,
              }}
            >
              <Play className="h-4 w-4 fill-white" />
              PLAY
            </button>
          )}
        </div>

        {/* Floating shadow */}
        <div
          className="cube-shadow"
          style={{
            width: 280, height: 44, marginTop: 22,
            background: `radial-gradient(ellipse at center, ${currentPuzzle.accent}22 0%, rgba(0,0,0,0.55) 40%, transparent 75%)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Reverse countdown timer ──────────────────────────────────────────────────
function TimerBar({ spinning, onTimeout, face, running }: { spinning: boolean; onTimeout: () => void; face: number; running: boolean }) {
  const DURATION = 300; // 5 minutes in seconds
  const [secs, setSecs] = useState(DURATION);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    setSecs(DURATION);
  }, [face]);

  useEffect(() => {
    if (!running) return;
    if (secs <= 0) {
      onTimeoutRef.current();
      return;
    }
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secs, running]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const pct = (secs / DURATION) * 100;
  const low = secs <= 30;

  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-white/10"
      style={{
        background: 'rgba(12,12,16,0.85)',
        backdropFilter: 'blur(8px)',
        opacity: spinning ? 0 : 1,
        transition: 'opacity 0.18s ease',
      }}
    >
      <Timer className={`h-3.5 w-3.5 ${low ? 'text-red-400' : 'text-cyan-300'}`} />
      <span
        className={`text-xs font-bold tabular-nums tracking-wider ${low ? 'text-red-400' : 'text-white/85'}`}
        style={{ textShadow: low ? '0 0 8px rgba(239,68,68,0.5)' : 'none' }}
      >
        {m}:{s.toString().padStart(2, '0')}
      </span>
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <span
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background: low ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#06b6d4,#3b82f6)',
          }}
        />
      </span>
    </div>
  );
}

// ─── 3D Face ───────────────────────────────────────────────────────────────────
function Face3D({
  transform,
  puzzle,
  isFront,
  foundWords,
  revealed,
}: {
  transform: string;
  puzzle: Puzzle;
  isFront: boolean;
  foundWords: string[];
  revealed: boolean;
}) {
  return (
    <div
      className="absolute backface-hidden"
      style={{
        transform,
        width: SIZE, height: SIZE, top: 0, left: 0,
        background: '#0a0a0a',
        borderRadius: 10,
        boxShadow: isFront
          ? `inset 0 0 0 2px ${puzzle.accent}66, 0 0 60px ${puzzle.accent}33`
          : `inset 0 0 0 2px rgba(255,255,255,0.04)`,
        padding: 6,
      }}
    >
      <StaticGrid puzzle={puzzle} foundWords={foundWords} revealed={revealed} />
    </div>
  );
}

// ─── Swipeable Hand ────────────────────────────────────────────────────────────
type Side = 'top' | 'bottom' | 'left' | 'right';

function HandSwipe({
  side,
  onSpin,
  disabled,
}: {
  side: Side;
  onSpin: (dir: SpinDir) => void;
  disabled: boolean;
}) {
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Hands sit just outside each cube edge, centered, all equidistant.
  const GAP = 6;
  const positions: Record<Side, React.CSSProperties> = {
    top:    { top: `-${36 + GAP}px`,      left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: `-${36 + GAP}px`,   left: '50%', transform: 'translateX(-50%)' },
    left:   { left: `-${36 + GAP}px`,     top: '50%',  transform: 'translateY(-50%)' },
    right:  { right: `-${36 + GAP}px`,    top: '50%',  transform: 'translateY(-50%)' },
  };

  // Rotate the hand icon to point in the swipe direction for each edge.
  const iconRotation: Record<Side, number> = {
    top: 180,    // default points up → flip to point down
    bottom: 0,   // already points up (toward the cube)
    left: 90,    // default up → rotate to point right
    right: -90,  // default up → rotate to point left
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    if (!start || disabled) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      onSpin(dx > 0 ? 'right' : 'left');
    } else {
      onSpin(dy > 0 ? 'down' : 'up');
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragRef.current = null; setDragging(false); }}
      className="absolute flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full ring-1 transition-transform active:cursor-grabbing"
      style={{
        ...positions[side],
        background: 'rgba(20,8,8,0.92)',
        borderColor: 'rgba(239,68,68,0.4)',
        boxShadow: `0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 12px rgba(239,68,68,0.35)`,
        scale: dragging ? '1.15' : '1',
        zIndex: 40,
      }}
    >
      <Hand
        className="h-5 w-5"
        style={{ color: '#ef4444', transform: `rotate(${iconRotation[side]}deg) ${dragging ? 'scale(1.1)' : 'scale(1)'}`, transition: 'transform 0.15s ease' }}
      />
    </div>
  );
}

// ─── Cube edge beams ──────────────────────────────────────────────────────────
const T = SIZE;
const H = HALF;
const EW = 16;

const CUBE_EDGES = [
  { transform: `translateZ(${H}px)`, w: T, h: EW, top: 0, left: 0 },
  { transform: `translateZ(${H}px)`, w: T, h: EW, top: T - EW, left: 0 },
  { transform: `translateZ(${H}px)`, w: EW, h: T, top: 0, left: 0 },
  { transform: `translateZ(${H}px)`, w: EW, h: T, top: 0, left: T - EW },
  { transform: `rotateY(180deg) translateZ(${H}px)`, w: T, h: EW, top: 0, left: 0 },
  { transform: `rotateY(180deg) translateZ(${H}px)`, w: T, h: EW, top: T - EW, left: 0 },
  { transform: `rotateY(180deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: 0 },
  { transform: `rotateY(180deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: T - EW },
  { transform: `rotateY(90deg) translateZ(${H}px)`, w: T, h: EW, top: 0, left: 0 },
  { transform: `rotateY(90deg) translateZ(${H}px)`, w: T, h: EW, top: T - EW, left: 0 },
  { transform: `rotateY(90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: 0 },
  { transform: `rotateY(90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: T - EW },
  { transform: `rotateY(-90deg) translateZ(${H}px)`, w: T, h: EW, top: 0, left: 0 },
  { transform: `rotateY(-90deg) translateZ(${H}px)`, w: T, h: EW, top: T - EW, left: 0 },
  { transform: `rotateY(-90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: 0 },
  { transform: `rotateY(-90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: T - EW },
  { transform: `rotateX(90deg) translateZ(${H}px)`, w: T, h: EW, top: 0, left: 0 },
  { transform: `rotateX(90deg) translateZ(${H}px)`, w: T, h: EW, top: T - EW, left: 0 },
  { transform: `rotateX(90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: 0 },
  { transform: `rotateX(90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: T - EW },
  { transform: `rotateX(-90deg) translateZ(${H}px)`, w: T, h: EW, top: 0, left: 0 },
  { transform: `rotateX(-90deg) translateZ(${H}px)`, w: T, h: EW, top: T - EW, left: 0 },
  { transform: `rotateX(-90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: 0 },
  { transform: `rotateX(-90deg) translateZ(${H}px)`, w: EW, h: T, top: 0, left: T - EW },
];

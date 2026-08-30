import { useRef, useState, useCallback } from 'react';
import type { Cell, Puzzle } from '@/game/types';
import { snapEnd, lineCells, checkSelection } from '@/game/matching';

interface Props {
  puzzle: Puzzle;
  foundWords: string[];
  onCorrect: (word: string, cells: Cell[]) => void;
  accent: string;
  revealed?: boolean;
}

interface SelectState {
  start: Cell;
  end: Cell;
}

const sameCell = (a: Cell, b: Cell) => a.row === b.row && a.col === b.col;

function tileStyle(state: 'idle' | 'active' | 'found' | 'wrong' | 'revealed', is3D = false) {
  const depth = is3D ? '4px' : '3px';
  switch (state) {
    case 'found':
      return {
        background: 'linear-gradient(160deg, #22c55e 0%, #15803d 100%)',
        borderTop: '1px solid rgba(255,255,255,0.30)',
        borderLeft: '1px solid rgba(255,255,255,0.20)',
        borderRight: '1px solid rgba(0,0,0,0.40)',
        borderBottom: `${depth} solid #14532d`,
        boxShadow: `0 ${depth} 10px rgba(0,0,0,0.8), 0 0 14px rgba(34,197,94,0.5)`,
        color: '#fff',
      };
    case 'wrong':
      return {
        background: 'linear-gradient(160deg, #ef4444 0%, #b91c1c 100%)',
        borderTop: '1px solid rgba(255,255,255,0.25)',
        borderLeft: '1px solid rgba(255,255,255,0.15)',
        borderRight: '1px solid rgba(0,0,0,0.40)',
        borderBottom: `${depth} solid #7f1d1d`,
        boxShadow: `0 ${depth} 10px rgba(0,0,0,0.8), 0 0 14px rgba(239,68,68,0.5)`,
        color: '#fff',
      };
    case 'active':
      return {
        background: 'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.14) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.50)',
        borderLeft: '1px solid rgba(255,255,255,0.35)',
        borderRight: '1px solid rgba(0,0,0,0.30)',
        borderBottom: `${depth} solid rgba(0,0,0,0.40)`,
        boxShadow: `0 ${depth} 8px rgba(0,0,0,0.7)`,
        color: '#fff',
      };
    case 'revealed':
      return {
        background: 'linear-gradient(160deg, #facc15 0%, #ca8a04 100%)',
        borderTop: '1px solid rgba(255,255,255,0.30)',
        borderLeft: '1px solid rgba(255,255,255,0.20)',
        borderRight: '1px solid rgba(0,0,0,0.40)',
        borderBottom: `${depth} solid #854d0e`,
        boxShadow: `0 ${depth} 10px rgba(0,0,0,0.8), 0 0 14px rgba(250,204,21,0.5)`,
        color: '#fff',
      };
    default:
      return {
        background: 'linear-gradient(160deg, #252530 0%, #13131a 100%)',
        borderTop: '1px solid rgba(255,255,255,0.13)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderRight: '1px solid rgba(0,0,0,0.60)',
        borderBottom: `${depth} solid rgba(0,0,0,0.85)`,
        boxShadow: `0 ${depth} 8px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)`,
        color: 'rgba(255,255,255,0.82)',
      };
  }
}

function foundCellSet(puzzle: Puzzle, foundWords: string[]): Set<string> {
  const foundSet = new Set(foundWords);
  const keys = new Set<string>();
  for (const w of puzzle.words) {
    if (foundSet.has(w.word)) {
      for (const c of w.cells) keys.add(`${c.row}-${c.col}`);
    }
  }
  return keys;
}

function allWordCells(puzzle: Puzzle): Set<string> {
  const keys = new Set<string>();
  for (const w of puzzle.words) {
    for (const c of w.cells) keys.add(`${c.row}-${c.col}`);
  }
  return keys;
}

// Static (non-interactive) grid used on the 3D cube faces during spin.
// Renders the same 3D keycap tiles so the cube looks consistent mid-rotation.
export function StaticGrid({ puzzle, foundWords, revealed }: { puzzle: Puzzle; foundWords: string[]; revealed?: boolean }) {
  const foundKey = foundCellSet(puzzle, foundWords);
  const revealKey = revealed ? allWordCells(puzzle) : new Set<string>();
  return (
    <div
      className="grid h-full w-full gap-[2px] p-1"
      style={{ gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0,1fr))` }}
    >
      {puzzle.grid.map((row, r) =>
        row.map((letter, c) => {
          const key = `${r}-${c}`;
          const found = foundKey.has(key);
          const isRevealed = revealKey.has(key);
          const s = tileStyle(found ? 'found' : isRevealed ? 'revealed' : 'idle', true);
          return (
            <div
              key={key}
              className="flex aspect-square items-center justify-center rounded-[3px] text-[1.3vh] font-bold tracking-tight"
              style={{ lineHeight: 1, ...s }}
            >
              {letter}
            </div>
          );
        }),
      )}
    </div>
  );
}

export default function GridFace({ puzzle, foundWords, onCorrect, accent, revealed }: Props) {
  const [selecting, setSelecting] = useState<SelectState | null>(null);
  const [flash, setFlash] = useState<{ cells: Cell[]; ok: boolean } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const foundKey = foundCellSet(puzzle, foundWords);
  const revealKey = revealed ? allWordCells(puzzle) : new Set<string>();
  const foundLines = puzzle.words.filter((w) => new Set(foundWords).has(w.word));
  const revealLines = revealed ? puzzle.words : [];

  const activeCells: Cell[] = selecting ? lineCells(selecting.start, selecting.end) : [];
  const activeKey = new Set(activeCells.map((c) => `${c.row}-${c.col}`));
  const flashKey = new Set<string>();
  if (flash) for (const c of flash.cells) flashKey.add(`${c.row}-${c.col}`);

  const cellFromPoint = useCallback((clientX: number, clientY: number): Cell | null => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const tile = el?.closest('[data-cell]') as HTMLElement | null;
    if (!tile) return null;
    const row = Number(tile.dataset.row);
    const col = Number(tile.dataset.col);
    if (Number.isNaN(row) || Number.isNaN(col)) return null;
    return { row, col };
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    if (flash) setFlash(null);
    const c = cellFromPoint(clientX, clientY);
    if (c) setSelecting({ start: c, end: c });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!selecting) return;
    const raw = cellFromPoint(clientX, clientY);
    if (!raw) return;
    const end = snapEnd(selecting.start, raw);
    setSelecting((prev) => (prev && !sameCell(prev.end, end) ? { ...prev, end } : prev));
  };

  const finish = () => {
    if (!selecting) return;
    const cells = lineCells(selecting.start, selecting.end);
    setSelecting(null);
    if (cells.length < 2) return;
    const { correct, word } = checkSelection(cells, puzzle);
    if (correct && word) {
      onCorrect(word, cells);
    } else {
      setFlash({ cells, ok: false });
      window.setTimeout(() => setFlash(null), 850);
    }
  };

  return (
    <div
      ref={gridRef}
      className="relative h-full w-full select-none touch-none"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleStart(e.clientX, e.clientY); }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <div
        className="grid h-full w-full gap-[2px] p-1"
        style={{ gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0,1fr))` }}
      >
        {puzzle.grid.map((row, r) =>
          row.map((letter, c) => {
            const key = `${r}-${c}`;
            const found = foundKey.has(key);
            const isRevealed = revealKey.has(key);
            const active = activeKey.has(key);
            const wrong = flashKey.has(key) && flash && !flash.ok;
            const state = wrong ? 'wrong' : found ? 'found' : isRevealed ? 'revealed' : active ? 'active' : 'idle';
            const s = tileStyle(state);

            return (
              <div
                key={key}
                data-cell
                data-row={r}
                data-col={c}
                className="flex aspect-square items-center justify-center rounded-[3px] text-[1.45vh] font-bold tracking-tight transition-all duration-100"
                style={{ lineHeight: 1, ...s }}
              >
                {letter}
              </div>
            );
          }),
        )}
      </div>

      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {foundLines.map((w) => (
          <SelectionLine key={w.word} cells={w.cells} gridRef={gridRef} color="#4ade80" opacity={0.55} thick />
        ))}
        {revealLines.map((w) => (
          <SelectionLine key={`reveal-${w.word}`} cells={w.cells} gridRef={gridRef} color="#facc15" opacity={0.6} thick />
        ))}
        {selecting && activeCells.length > 1 && (
          <SelectionLine cells={activeCells} gridRef={gridRef} color={accent} opacity={0.7} />
        )}
        {flash && !flash.ok && (
          <SelectionLine cells={flash.cells} gridRef={gridRef} color="#f87171" opacity={0.8} thick />
        )}
      </svg>
    </div>
  );
}

function SelectionLine({
  cells,
  gridRef,
  color,
  thick,
  opacity = 1,
}: {
  cells: Cell[];
  gridRef: React.RefObject<HTMLDivElement>;
  color: string;
  thick?: boolean;
  opacity?: number;
}) {
  if (cells.length < 2 || !gridRef.current) return null;
  const grid = gridRef.current;
  const first = grid.querySelector(`[data-row="${cells[0].row}"][data-col="${cells[0].col}"]`) as HTMLElement | null;
  const last  = grid.querySelector(`[data-row="${cells[cells.length - 1].row}"][data-col="${cells[cells.length - 1].col}"]`) as HTMLElement | null;
  if (!first || !last) return null;
  const gr = grid.getBoundingClientRect();
  const f = first.getBoundingClientRect();
  const l = last.getBoundingClientRect();
  const x1 = f.left - gr.left + f.width / 2;
  const y1 = f.top  - gr.top  + f.height / 2;
  const x2 = l.left - gr.left + l.width / 2;
  const y2 = l.top  - gr.top  + l.height / 2;
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={thick ? gr.width / 26 : gr.width / 32}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

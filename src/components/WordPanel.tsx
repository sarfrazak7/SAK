import { Check, Trophy, Sparkles } from 'lucide-react';
import type { Puzzle } from '@/game/types';

interface Props {
  puzzles: Puzzle[];
  puzzle: Puzzle;
  found: string[];
  totalFound: number;
  totalCount: number;
  onJump: (face: number) => void;
  foundByFace: Record<number, string[]>;
  pointsByFace?: Record<number, number>;
}

export default function WordPanel({ puzzles, puzzle, found, totalFound, totalCount, onJump, foundByFace, pointsByFace }: Props) {
  const foundSet = new Set(found);
  const completed = puzzle.words.filter((w) => foundSet.has(w.word)).length;
  const faceIndex = puzzles.indexOf(puzzle);

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: puzzle.accent, boxShadow: `0 0 10px ${puzzle.accent}` }}
          />
          <h2 className="text-lg font-semibold tracking-wide text-white">{puzzle.name}</h2>
          {completed === puzzle.words.length && (
            <span className="ml-auto flex items-center gap-1.5">
              {pointsByFace && pointsByFace[faceIndex] !== undefined && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-300">
                  +{pointsByFace[faceIndex]} pts
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                <Trophy className="h-3.5 w-3.5" /> Cleared
              </span>
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-white/50">{puzzle.theme}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-white/60">
        <span>This face</span>
        <span className="font-medium text-white/80">{completed}/{puzzle.words.length}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(completed / puzzle.words.length) * 100}%`, backgroundColor: puzzle.accent, boxShadow: `0 0 8px ${puzzle.accent}` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {puzzle.words.map((w) => {
          const isFound = foundSet.has(w.word);
          return (
            <div key={w.word} className={`flex items-center gap-1.5 text-sm transition-colors ${isFound ? 'text-emerald-300/90 line-through' : 'text-white/70'}`}>
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${isFound ? 'border-emerald-400/60 bg-emerald-500/20' : 'border-white/20'}`}>
                {isFound && <Check className="h-3 w-3" />}
              </span>
              {w.word}
            </div>
          );
        })}
      </div>

      <div className="mt-1 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-300" /> All faces</span>
          <span className="font-medium text-white/80">{totalFound}/{totalCount}</span>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {puzzles.map((p, i) => {
            const done = (foundByFace[i]?.length ?? 0) === p.words.length;
            return (
              <button key={i} onClick={() => onJump(i)} className="group relative h-9 rounded-lg border border-white/10 bg-white/[0.03] transition hover:border-white/30" title={p.name}>
                <span className="absolute inset-x-1 top-1 h-1 rounded-full" style={{ backgroundColor: p.accent, opacity: done ? 1 : 0.4 }} />
                <span className="flex h-full items-center justify-center text-[10px] font-medium text-white/50">{i + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500" style={{ width: `${(totalFound / totalCount) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

import { RotateCcw, Eye, EyeOff, ChevronDown } from 'lucide-react';
import type { Puzzle, SpinDir, Subject } from '@/game/types';
import { SUBJECTS, availableSubjects } from '@/game/puzzles';

interface Props {
  puzzles: Puzzle[];
  foundByFace: Record<number, string[]>;
  currentFace: number;
  onJump: (face: number) => void;
  onResetFace: () => void;
  onResetAll: () => void;
  onSpin: (dir: SpinDir) => void;
  revealed: boolean;
  onToggleReveal: () => void;
  subject: Subject;
  onSubjectChange: (s: Subject) => void;
}

export default function Controls({ puzzles, foundByFace, currentFace, onJump, onResetFace, onResetAll, revealed, onToggleReveal, subject, onSubjectChange }: Props) {
  const subjects = availableSubjects();
  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
      <div className="relative">
        <label className="mb-1 block text-[10px] font-medium tracking-wide text-white/50">SUBJECT</label>
        <div className="relative">
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value as Subject)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 pr-9 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/[0.06] focus:border-amber-400/40 focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        </div>
      </div>

      <span className="text-xs font-medium tracking-wide text-white/60">CATEGORIES</span>

      <div className="flex flex-col gap-1.5">
        {puzzles.map((p, i) => {
          const found = foundByFace[i]?.length ?? 0;
          const total = p.words.length;
          const isCurrent = i === currentFace;
          const done = found === total;
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                isCurrent ? 'bg-white/[0.08] ring-1 ring-white/15' : 'bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <span
                className={`h-7 w-1.5 shrink-0 rounded-full ${isCurrent && !done ? 'face-bar-blink' : ''}`}
                style={{
                  backgroundColor: done ? '#ffffff' : isCurrent ? '#ef4444' : p.accent,
                  opacity: done || isCurrent ? 1 : 0.45,
                  boxShadow: isCurrent && !done ? '0 0 8px #ef4444' : done ? '0 0 6px #ffffff' : 'none',
                }}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={`truncate text-xs font-semibold tracking-wide ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                  {p.name}
                </span>
                <span className="truncate text-[10px] text-white/40">{p.theme}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10"
                  aria-hidden
                >
                  <span
                    className="block h-full rounded-full transition-all duration-500"
                    style={{ width: `${(found / total) * 100}%`, backgroundColor: p.accent }}
                  />
                </span>
                <span className={`w-8 text-right text-[11px] font-semibold tabular-nums ${done ? 'text-emerald-300' : isCurrent ? 'text-white/85' : 'text-white/55'}`}>
                  {found}/{total}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onToggleReveal} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${revealed ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {revealed ? 'Hide' : 'Reveal'}
        </button>
        <button onClick={onResetFace} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10">
          <RotateCcw className="h-3.5 w-3.5" /> Reset face
        </button>
        <button onClick={onResetAll} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10">
          <RotateCcw className="h-3.5 w-3.5" /> Reset all
        </button>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl bg-white/[0.02] px-3 py-2.5">
        <span className="text-[10px] font-medium tracking-wide text-white/50">TIME BONUS (per face)</span>
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="rounded-lg bg-amber-500/10 py-1">
            <div className="text-[11px] font-bold text-amber-300">1000</div>
            <div className="text-[9px] text-white/40">≤2 min</div>
          </div>
          <div className="rounded-lg bg-amber-500/10 py-1">
            <div className="text-[11px] font-bold text-amber-300/80">500</div>
            <div className="text-[9px] text-white/40">≤3 min</div>
          </div>
          <div className="rounded-lg bg-amber-500/10 py-1">
            <div className="text-[11px] font-bold text-amber-300/60">300</div>
            <div className="text-[9px] text-white/40">≤4 min</div>
          </div>
          <div className="rounded-lg bg-amber-500/10 py-1">
            <div className="text-[11px] font-bold text-amber-300/40">100</div>
            <div className="text-[9px] text-white/40">≤5 min</div>
          </div>
        </div>
      </div>
    </div>
  );
}

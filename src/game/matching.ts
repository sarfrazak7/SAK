import type { Cell, Puzzle } from './types';
import { SIZE } from './puzzles';

export function snapEnd(start: Cell, raw: Cell): Cell {
  const dr = raw.row - start.row;
  const dc = raw.col - start.col;
  if (dr === 0 && dc === 0) return start;
  const angle = Math.atan2(dr, dc);
  const step = Math.PI / 4;
  const snapped = Math.round(angle / step) * step;
  const sr = Math.round(Math.sin(snapped));
  const sc = Math.round(Math.cos(snapped));
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  return {
    row: Math.max(0, Math.min(SIZE - 1, start.row + sr * len)),
    col: Math.max(0, Math.min(SIZE - 1, start.col + sc * len)),
  };
}

export function lineCells(start: Cell, end: Cell): Cell[] {
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [start];
  const sr = Math.sign(dr);
  const sc = Math.sign(dc);
  const cells: Cell[] = [];
  for (let i = 0; i <= len; i++) {
    cells.push({ row: start.row + sr * i, col: start.col + sc * i });
  }
  return cells;
}

function cellsMatch(a: Cell[], b: Cell[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((c, i) => c.row === b[i].row && c.col === b[i].col);
}

export function checkSelection(
  cells: Cell[],
  puzzle: Puzzle,
): { word?: string; correct: boolean } {
  if (cells.length < 2) return { correct: false };
  for (const w of puzzle.words) {
    if (cellsMatch(cells, w.cells) || cellsMatch(cells, [...w.cells].reverse())) {
      return { word: w.word, correct: true };
    }
  }
  return { correct: false };
}

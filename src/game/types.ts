export interface Cell {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  cells: Cell[];
}

export interface Puzzle {
  id: number;
  name: string;
  theme: string;
  accent: string;
  grid: string[][];
  words: PlacedWord[];
}

export type SpinDir = 'left' | 'right' | 'up' | 'down';
export type Mode = 'solve' | 'rotate';

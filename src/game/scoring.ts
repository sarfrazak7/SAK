// Speed bonus scoring for crossword faces.
// Faster face clears yield higher point multipliers.

export const DURATION = 300; // 5 minutes in seconds

export interface SpeedTier {
  label: string;
  maxSeconds: number;
  multiplier: number;
  color: string;
}

export const SPEED_TIERS: SpeedTier[] = [
  { label: 'Under 1 min',   maxSeconds: 60,  multiplier: 5, color: '#22d3ee' },
  { label: 'Under 2 mins',  maxSeconds: 120, multiplier: 3, color: '#34d399' },
  { label: 'Under 3 mins',  maxSeconds: 180, multiplier: 2, color: '#fbbf24' },
  { label: 'Under 4 mins',  maxSeconds: 240, multiplier: 1.5, color: '#fb923c' },
  { label: 'Under 5 mins',  maxSeconds: 300, multiplier: 1, color: '#f87171' },
];

const BASE_POINTS = 100;
export const WORD_POINTS = 10; // points per correctly guessed word

export function bonusForElapsed(elapsedSeconds: number): number {
  const tier = SPEED_TIERS.find((t) => elapsedSeconds <= t.maxSeconds);
  if (!tier) return 0;
  return Math.round(BASE_POINTS * tier.multiplier);
}

/**
 * Total score for a challenge run.
 * Awards WORD_POINTS for every word found, plus the speed bonus
 * (which only applies if the player cleared all words on the face).
 * Partial clears still keep their per-word points.
 */
export function computeScore(
  elapsedSeconds: number,
  wordsFound: number,
  totalWords: number,
): number {
  const wordPoints = wordsFound * WORD_POINTS;
  const speedBonus = wordsFound >= totalWords ? bonusForElapsed(elapsedSeconds) : 0;
  return wordPoints + speedBonus;
}

export function tierLabel(elapsedSeconds: number): string {
  const tier = SPEED_TIERS.find((t) => elapsedSeconds <= t.maxSeconds);
  if (!tier) return 'No bonus';
  return `${tier.label} · ${tier.multiplier}x bonus`;
}

export function tierForElapsed(elapsedSeconds: number): SpeedTier | undefined {
  return SPEED_TIERS.find((t) => elapsedSeconds <= t.maxSeconds);
}

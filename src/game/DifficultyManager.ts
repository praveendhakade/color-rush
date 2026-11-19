import type { Difficulty, DifficultyMode } from './types';

const DEFAULT_DIFFICULTIES: Difficulty[] = [
  {
    level: 1,
    tileCount: 4,
    colorCount: 4,
    responseTimeMs: 1500,
    decoyFrequency: 0.25,
  },
  {
    level: 2,
    tileCount: 4,
    colorCount: 4,
    responseTimeMs: 1300,
    decoyFrequency: 0.3,
  },
  {
    level: 3,
    tileCount: 6,
    colorCount: 4,
    responseTimeMs: 1200,
    decoyFrequency: 0.35,
  },
  {
    level: 5,
    tileCount: 6,
    colorCount: 5,
    responseTimeMs: 1000,
    decoyFrequency: 0.4,
  },
  {
    level: 10,
    tileCount: 9,
    colorCount: 6,
    responseTimeMs: 750,
    decoyFrequency: 0.5,
  },
  {
    level: 20,
    tileCount: 12,
    colorCount: 6,
    responseTimeMs: 500,
    decoyFrequency: 0.6,
  },
];

export class DifficultyManager {
  constructor(
    private readonly difficulties: readonly Difficulty[] = DEFAULT_DIFFICULTIES,
    private readonly mode: DifficultyMode = 'medium',
  ) {}

  forLevel(level: number): Difficulty {
    const normalizedLevel = Math.max(1, Math.floor(level));
    const selected = this.difficulties.reduce((current, candidate) =>
      candidate.level <= normalizedLevel ? candidate : current,
    );
    const scale = this.mode === 'easy' ? 1.35 : this.mode === 'hard' ? 0.72 : 1;
    return {
      ...selected,
      tileCount: Math.max(
        2,
        Math.round(
          selected.tileCount *
            (this.mode === 'easy' ? 0.75 : this.mode === 'hard' ? 1.25 : 1),
        ),
      ),
      colorCount:
        this.mode === 'easy'
          ? Math.max(2, selected.colorCount - 1)
          : selected.colorCount,
      responseTimeMs: Math.round(selected.responseTimeMs * scale),
      decoyFrequency: Math.max(
        0,
        Math.min(
          0.8,
          selected.decoyFrequency *
            (this.mode === 'easy' ? 0.7 : this.mode === 'hard' ? 1.2 : 1),
        ),
      ),
    };
  }

  levelForScore(score: number): number {
    return Math.max(1, Math.floor(score / 500) + 1);
  }
}

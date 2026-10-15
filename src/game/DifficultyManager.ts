import type { Difficulty } from './types';

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
  ) {}

  forLevel(level: number): Difficulty {
    const normalizedLevel = Math.max(1, Math.floor(level));
    return this.difficulties.reduce((current, candidate) =>
      candidate.level <= normalizedLevel ? candidate : current,
    );
  }

  levelForScore(score: number): number {
    return Math.max(1, Math.floor(score / 500) + 1);
  }
}

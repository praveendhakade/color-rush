export const COLOR_IDS = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
] as const;

export type ColorId = (typeof COLOR_IDS)[number];
export type GameStatus =
  'idle' | 'countdown' | 'playing' | 'paused' | 'reviveOffer' | 'gameOver';
export type DifficultyMode = 'easy' | 'medium' | 'hard';

export interface Tile {
  id: string;
  color: ColorId;
}

export interface Difficulty {
  level: number;
  tileCount: number;
  colorCount: number;
  responseTimeMs: number;
  decoyFrequency: number;
}

export interface GameConfig {
  startingBestScore: number;
  initialLevel: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  bestScore: number;
  combo: number;
  level: number;
  targetColor: ColorId | null;
  tiles: Tile[];
  timeRemaining: number;
  gamesPlayed: number;
  highestCombo: number;
  lives: number;
  revivesUsed: number;
  lifeLostPause?: boolean;
}

export interface GameResult {
  score: number;
  bestScore: number;
  combo: number;
  highestCombo: number;
  isNewBest: boolean;
}

export interface RandomProvider {
  next(): number;
}

import type { ColorId, GameConfig } from './types';

export const COLOR_CONFIG: Record<
  ColorId,
  { label: string; hex: string; textColor: string }
> = {
  red: { label: 'RED', hex: '#F05252', textColor: '#FFFFFF' },
  blue: { label: 'BLUE', hex: '#3B82F6', textColor: '#FFFFFF' },
  green: { label: 'GREEN', hex: '#22C55E', textColor: '#082414' },
  yellow: { label: 'YELLOW', hex: '#FACC15', textColor: '#302400' },
  purple: { label: 'PURPLE', hex: '#A855F7', textColor: '#FFFFFF' },
  orange: { label: 'ORANGE', hex: '#FB923C', textColor: '#3A1600' },
};

export const GAME_CONFIG: GameConfig = {
  startingBestScore: 0,
  initialLevel: 1,
};

export const SCORE_CONFIG = {
  baseScore: 100,
  maxSpeedBonus: 100,
  comboMultiplierStep: 0.1,
  streakBonusEvery: 5,
  streakBonus: 50,
} as const;

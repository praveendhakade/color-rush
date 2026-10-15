import { SCORE_CONFIG } from './config';

export class ScoreManager {
  calculate({
    combo,
    timeRemaining,
    responseTimeMs,
  }: {
    combo: number;
    timeRemaining: number;
    responseTimeMs: number;
  }): number {
    const clampedTime = Math.max(0, Math.min(timeRemaining, responseTimeMs));
    const speedBonus = Math.round(
      (clampedTime / responseTimeMs) * SCORE_CONFIG.maxSpeedBonus,
    );
    const multiplier =
      1 + Math.max(0, combo - 1) * SCORE_CONFIG.comboMultiplierStep;
    const streakBonus =
      combo > 0 && combo % SCORE_CONFIG.streakBonusEvery === 0
        ? SCORE_CONFIG.streakBonus
        : 0;
    return Math.round(
      (SCORE_CONFIG.baseScore + speedBonus) * multiplier + streakBonus,
    );
  }
}

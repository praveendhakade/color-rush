import { ScoreManager } from '../ScoreManager';

describe('ScoreManager', () => {
  it('rewards speed and combo', () => {
    const scores = new ScoreManager();
    const fast = scores.calculate({
      combo: 2,
      timeRemaining: 1500,
      responseTimeMs: 1500,
    });
    const slow = scores.calculate({
      combo: 1,
      timeRemaining: 0,
      responseTimeMs: 1500,
    });
    expect(fast).toBeGreaterThan(slow);
  });

  it('adds the configured streak bonus every five answers', () => {
    const scores = new ScoreManager();
    const fourth = scores.calculate({
      combo: 4,
      timeRemaining: 0,
      responseTimeMs: 1500,
    });
    const fifth = scores.calculate({
      combo: 5,
      timeRemaining: 0,
      responseTimeMs: 1500,
    });
    expect(fifth - fourth).toBeGreaterThanOrEqual(60);
  });
});

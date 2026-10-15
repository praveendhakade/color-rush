import { DifficultyManager } from '../DifficultyManager';

describe('DifficultyManager', () => {
  it('progresses to the configured difficulty bands', () => {
    const manager = new DifficultyManager();
    expect(manager.forLevel(1).tileCount).toBe(4);
    expect(manager.forLevel(3).tileCount).toBe(6);
    expect(manager.forLevel(10).responseTimeMs).toBe(750);
    expect(manager.forLevel(99).tileCount).toBe(12);
  });

  it('increases level with score', () => {
    const manager = new DifficultyManager();
    expect(manager.levelForScore(0)).toBe(1);
    expect(manager.levelForScore(500)).toBe(2);
  });

  it('accepts configurable difficulty bands', () => {
    const manager = new DifficultyManager([
      {
        level: 1,
        tileCount: 2,
        colorCount: 2,
        responseTimeMs: 2000,
        decoyFrequency: 0,
      },
    ]);
    expect(manager.forLevel(10)).toMatchObject({
      tileCount: 2,
      responseTimeMs: 2000,
    });
  });
});

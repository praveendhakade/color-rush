import { ColorGenerator } from '../ColorGenerator';
import { GameEngine } from '../GameEngine';
import { SeededRandom } from '../random';

const createEngine = (bestScore = 0) =>
  new GameEngine(
    new ColorGenerator(new SeededRandom(4)),
    undefined,
    undefined,
    bestScore,
  );

describe('GameEngine', () => {
  it('starts with a valid target round', () => {
    const state = createEngine().startGame();
    expect(state.status).toBe('playing');
    expect(state.tiles.some((tile) => tile.color === state.targetColor)).toBe(
      true,
    );
  });

  it('increments score and combo for a correct tap', () => {
    const engine = createEngine();
    const state = engine.startGame();
    const correctTile = state.tiles.find(
      (tile) => tile.color === state.targetColor,
    )!;
    const result = engine.handleTap(correctTile.id, state.timeRemaining);
    expect(result.correct).toBe(true);
    expect(result.state.score).toBeGreaterThan(0);
    expect(result.state.combo).toBe(1);
    expect(result.state.lives).toBe(3);
  });

  it('starts each game with three lives and rejects stale tile callbacks', () => {
    const engine = createEngine();
    expect(engine.startGame().lives).toBe(3);
    const before = engine.getState();
    const wrong = before.tiles.find(
      (tile) => tile.color !== before.targetColor,
    )!;
    const first = engine.handleTap(wrong.id);
    expect(first.state.lives).toBe(2);
    expect(first.state.status).toBe('playing');
    expect(engine.handleTap(wrong.id).state.lives).toBe(2);
  });

  it('opens the revive offer after three mistakes and resets combo', () => {
    const engine = createEngine();
    const state = engine.startGame();
    const correctTile = state.tiles.find(
      (tile) => tile.color === state.targetColor,
    )!;
    engine.handleTap(correctTile.id, state.timeRemaining);
    expect(engine.handleWrongAnswer().state.status).toBe('playing');
    expect(engine.handleWrongAnswer().state.status).toBe('playing');
    const result = engine.handleWrongAnswer();
    expect(result.state.status).toBe('reviveOffer');
    expect(result.state.lives).toBe(0);
    expect(result.state.combo).toBe(0);
    expect(result.state.highestCombo).toBe(1);
  });

  it('freezes round time while the revive offer is active', () => {
    const engine = createEngine();
    engine.startGame();
    engine.handleWrongAnswer();
    engine.handleWrongAnswer();
    const offer = engine.handleWrongAnswer().state;
    expect(engine.setTimeRemaining(0)).toMatchObject({
      status: 'reviveOffer',
      timeRemaining: offer.timeRemaining,
    });
    expect(engine.grantRevive().timeRemaining).toBeGreaterThan(0);
  });

  it('revives once after a verified reward and preserves score and level', () => {
    const engine = createEngine();
    let state = engine.startGame();
    const right = state.tiles.find((tile) => tile.color === state.targetColor)!;
    state = engine.handleTap(right.id, state.timeRemaining).state;
    const score = state.score;
    const level = state.level;
    const gamesPlayed = state.gamesPlayed;
    engine.handleWrongAnswer();
    engine.handleWrongAnswer();
    engine.handleWrongAnswer();
    state = engine.grantRevive();
    expect(state).toMatchObject({
      status: 'playing',
      lives: 1,
      revivesUsed: 1,
      score,
      level,
      gamesPlayed,
    });
    expect(engine.grantRevive()).toMatchObject({ lives: 1, revivesUsed: 1 });
    engine.handleWrongAnswer();
    expect(engine.handleWrongAnswer().state.status).toBe('gameOver');
  });

  it('does not grant a revive unless an offer is active and resets session lives', () => {
    const engine = createEngine();
    expect(engine.grantRevive().lives).toBe(3);
    engine.startGame();
    engine.handleWrongAnswer();
    engine.handleWrongAnswer();
    engine.handleWrongAnswer();
    expect(engine.startGame()).toMatchObject({ lives: 3, revivesUsed: 0 });
  });

  it('preserves score and level on a lost life and returns a final score', () => {
    const engine = createEngine();
    let state = engine.startGame();
    const right = state.tiles.find((tile) => tile.color === state.targetColor)!;
    state = engine.handleTap(right.id, state.timeRemaining).state;
    const { score, level } = state;
    state = engine.handleWrongAnswer().state;
    expect(state).toMatchObject({ score, level, lives: 2, combo: 0 });
    engine.endGame();
    expect(engine.getResult()).toMatchObject({ score, bestScore: score });
  });

  it('updates the high score when a game ends', () => {
    const engine = createEngine(50);
    const state = engine.startGame();
    const correctTile = state.tiles.find(
      (tile) => tile.color === state.targetColor,
    )!;
    engine.handleTap(correctTile.id, state.timeRemaining);
    const finalState = engine.endGame();
    expect(finalState.bestScore).toBe(finalState.score);
  });

  it('retains a persisted best score', () => {
    const engine = createEngine();
    expect(engine.setBestScore(900).bestScore).toBe(900);
  });

  it('has no timers in its pure logic', () => {
    const engine = createEngine();
    const state = engine.startGame();
    expect(engine.getState().timeRemaining).toBe(state.timeRemaining);
  });

  it('increases difficulty and generates a new valid round after scoring', () => {
    const engine = createEngine();
    let state = engine.startGame();
    for (let answer = 0; answer < 5; answer += 1) {
      const correctTile = state.tiles.find(
        (tile) => tile.color === state.targetColor,
      )!;
      state = engine.handleTap(correctTile.id, state.timeRemaining).state;
    }
    expect(state.level).toBeGreaterThan(1);
    expect(state.tiles).toHaveLength(6);
    expect(state.tiles.some((tile) => tile.color === state.targetColor)).toBe(
      true,
    );
  });
});

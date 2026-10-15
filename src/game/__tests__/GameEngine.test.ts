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
  });

  it('rejects invalid taps and ends the game', () => {
    const engine = createEngine();
    engine.startGame();
    const result = engine.handleTap('not-a-tile');
    expect(result.correct).toBe(false);
    expect(result.state.status).toBe('gameOver');
    expect(result.state.combo).toBe(0);
  });

  it('preserves the completed combo in a game result while resetting game state', () => {
    const engine = createEngine();
    const state = engine.startGame();
    const correctTile = state.tiles.find(
      (tile) => tile.color === state.targetColor,
    )!;
    engine.handleTap(correctTile.id, state.timeRemaining);
    const result = engine.handleWrongAnswer();
    expect(result.state.combo).toBe(0);
    expect(result.result).toMatchObject({ combo: 1, highestCombo: 1 });
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

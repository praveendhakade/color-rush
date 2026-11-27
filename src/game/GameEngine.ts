import { GAME_CONFIG, LIVES_CONFIG } from './config';
import { ColorGenerator } from './ColorGenerator';
import { DifficultyManager } from './DifficultyManager';
import { ScoreManager } from './ScoreManager';
import type {
  Difficulty,
  DifficultyMode,
  GameResult,
  GameState,
} from './types';

export interface TapResult {
  state: GameState;
  correct: boolean;
  result?: GameResult;
}

export class GameEngine {
  private state: GameState;
  private roundAnswered = false;
  private scoreAtDifficultyReset = 0;
  private difficulty: DifficultyManager;
  private mode: DifficultyMode = 'medium';

  constructor(
    private readonly colors = new ColorGenerator(),
    difficulty = new DifficultyManager(),
    private readonly scores = new ScoreManager(),
    bestScore = GAME_CONFIG.startingBestScore,
    mode: DifficultyMode = 'medium',
  ) {
    this.mode = mode;
    this.difficulty =
      mode === 'medium' ? difficulty : new DifficultyManager(undefined, mode);
    this.state = this.createIdleState(bestScore);
  }

  getState(): GameState {
    return { ...this.state, tiles: [...this.state.tiles] };
  }

  setDifficultyMode(mode: DifficultyMode): GameState {
    this.mode = mode;
    this.difficulty = new DifficultyManager(undefined, mode);
    this.state = { ...this.state, level: GAME_CONFIG.initialLevel };
    return this.getState();
  }

  setBestScore(bestScore: number): GameState {
    this.state = {
      ...this.state,
      bestScore: Math.max(this.state.bestScore, bestScore),
    };
    return this.getState();
  }

  loadBestScore(bestScore: number): GameState {
    this.state = { ...this.state, bestScore };
    return this.getState();
  }

  startGame(): GameState {
    this.scoreAtDifficultyReset = 0;
    this.state = {
      ...this.createIdleState(this.state.bestScore),
      status: 'playing',
      gamesPlayed: this.state.gamesPlayed + 1,
    };
    return this.advanceRound();
  }

  handleTap(
    tileId: string,
    timeRemaining = this.state.timeRemaining,
  ): TapResult {
    if (this.state.status !== 'playing' || this.roundAnswered)
      return { state: this.getState(), correct: false };
    const tile = this.state.tiles.find((item) => item.id === tileId);
    if (!tile) return { state: this.getState(), correct: false };
    if (tile.color !== this.state.targetColor) {
      return this.handleWrongAnswer();
    }
    return this.handleCorrectAnswer(timeRemaining);
  }

  handleCorrectAnswer(timeRemaining = this.state.timeRemaining): TapResult {
    if (this.state.status !== 'playing' || this.roundAnswered) {
      return { state: this.getState(), correct: false };
    }
    this.roundAnswered = true;
    const nextCombo = this.state.combo + 1;
    const points = this.calculateScore(nextCombo, timeRemaining);
    this.state = {
      ...this.state,
      score: this.state.score + points,
      combo: nextCombo,
      highestCombo: Math.max(this.state.highestCombo, nextCombo),
    };
    return { state: this.advanceRound(), correct: true };
  }

  handleWrongAnswer(): TapResult {
    if (this.state.status !== 'playing' || this.roundAnswered) {
      return { state: this.getState(), correct: false };
    }
    this.roundAnswered = true;
    const lives = Math.max(0, this.state.lives - 1);
    this.state = {
      ...this.state,
      lives,
      combo: 0,
      lifeLostPause: lives > 0,
      status:
        lives === 0
          ? this.state.revivesUsed < LIVES_CONFIG.maxRevivesPerGame
            ? 'reviveOffer'
            : 'gameOver'
          : 'playing',
    };
    if (lives > 0) {
      this.scoreAtDifficultyReset = this.state.score;
      this.state = { ...this.state, level: GAME_CONFIG.initialLevel };
      this.generateRound(this.difficulty.forLevel(GAME_CONFIG.initialLevel));
      this.state = { ...this.state, status: 'paused', lifeLostPause: true };
      return { state: this.getState(), correct: false };
    }
    return { state: this.getState(), correct: false };
  }

  grantRevive(): GameState {
    if (
      this.state.status !== 'reviveOffer' ||
      this.state.lives !== 0 ||
      this.state.revivesUsed >= LIVES_CONFIG.maxRevivesPerGame
    )
      return this.getState();
    this.state = {
      ...this.state,
      status: 'playing',
      lifeLostPause: false,
      lives: LIVES_CONFIG.reviveLives,
      revivesUsed: this.state.revivesUsed + 1,
    };
    return this.generateRoundAtCurrentLevel();
  }

  getResult(): GameResult {
    const bestScore = Math.max(this.state.bestScore, this.state.score);
    const isNewBest = this.state.score > this.state.bestScore;
    this.state = { ...this.state, bestScore };
    return {
      score: this.state.score,
      bestScore,
      combo: this.state.combo,
      highestCombo: this.state.highestCombo,
      isNewBest,
    };
  }

  calculateScore(combo: number, timeRemaining: number): number {
    return this.scores.calculate({
      combo,
      timeRemaining,
      responseTimeMs: this.difficulty.forLevel(this.state.level).responseTimeMs,
    });
  }

  setTimeRemaining(timeRemaining: number): GameState {
    if (this.state.status === 'playing')
      this.state = { ...this.state, timeRemaining: Math.max(0, timeRemaining) };
    return this.getState();
  }

  pauseGame(timeRemaining: number): GameState {
    if (this.state.status === 'playing') {
      this.state = {
        ...this.state,
        status: 'paused',
        lifeLostPause: false,
        timeRemaining: Math.max(0, timeRemaining),
      };
    }
    return this.getState();
  }

  resumeGame(): GameState {
    if (this.state.status === 'paused')
      this.state = { ...this.state, status: 'playing', lifeLostPause: false };
    return this.getState();
  }

  endGame(): GameState {
    const bestScore = Math.max(this.state.bestScore, this.state.score);
    this.state = { ...this.state, status: 'gameOver', combo: 0, bestScore };
    return this.getState();
  }

  resetGame(): GameState {
    this.state = this.createIdleState(this.state.bestScore);
    return this.getState();
  }

  increaseDifficulty(): Difficulty {
    const level = this.difficulty.levelForScore(
      this.state.score - this.scoreAtDifficultyReset,
    );
    const nextDifficulty = this.difficulty.forLevel(level);
    this.state = { ...this.state, level };
    return nextDifficulty;
  }

  generateRound(difficulty = this.increaseDifficulty()): GameState {
    this.roundAnswered = false;
    const targetColor = this.colors.chooseTarget(difficulty.colorCount);
    this.state = {
      ...this.state,
      targetColor,
      tiles: this.colors.generateTiles(
        targetColor,
        difficulty.tileCount,
        difficulty.colorCount,
      ),
      timeRemaining: difficulty.responseTimeMs,
    };
    return this.getState();
  }

  private generateRoundAtCurrentLevel(): GameState {
    return this.generateRound(this.difficulty.forLevel(this.state.level));
  }

  advanceRound(): GameState {
    return this.generateRound();
  }

  private createIdleState(bestScore: number): GameState {
    return {
      status: 'idle',
      score: 0,
      bestScore,
      combo: 0,
      level: GAME_CONFIG.initialLevel,
      targetColor: null,
      tiles: [],
      timeRemaining: 0,
      gamesPlayed: this.state?.gamesPlayed ?? 0,
      highestCombo: 0,
      lives: LIVES_CONFIG.initialLives,
      revivesUsed: 0,
    };
  }
}

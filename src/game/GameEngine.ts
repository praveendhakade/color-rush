import { GAME_CONFIG } from './config';
import { ColorGenerator } from './ColorGenerator';
import { DifficultyManager } from './DifficultyManager';
import { ScoreManager } from './ScoreManager';
import type { Difficulty, GameResult, GameState } from './types';

export interface TapResult {
  state: GameState;
  correct: boolean;
  result?: GameResult;
}

export class GameEngine {
  private state: GameState;

  constructor(
    private readonly colors = new ColorGenerator(),
    private readonly difficulty = new DifficultyManager(),
    private readonly scores = new ScoreManager(),
    bestScore = GAME_CONFIG.startingBestScore,
  ) {
    this.state = this.createIdleState(bestScore);
  }

  getState(): GameState {
    return { ...this.state, tiles: [...this.state.tiles] };
  }

  setBestScore(bestScore: number): GameState {
    this.state = {
      ...this.state,
      bestScore: Math.max(this.state.bestScore, bestScore),
    };
    return this.getState();
  }

  startGame(): GameState {
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
    if (this.state.status !== 'playing')
      return { state: this.getState(), correct: false };
    const tile = this.state.tiles.find((item) => item.id === tileId);
    if (!tile || tile.color !== this.state.targetColor) {
      return this.handleWrongAnswer();
    }
    return this.handleCorrectAnswer(timeRemaining);
  }

  handleCorrectAnswer(timeRemaining = this.state.timeRemaining): TapResult {
    if (this.state.status !== 'playing') {
      return { state: this.getState(), correct: false };
    }
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
    if (this.state.status !== 'playing') {
      return { state: this.getState(), correct: false };
    }
    const combo = this.state.combo;
    const highestCombo = this.state.highestCombo;
    const isNewBest = this.state.score > this.state.bestScore;
    const state = this.endGame();
    return {
      state,
      correct: false,
      result: {
        score: state.score,
        bestScore: state.bestScore,
        combo,
        highestCombo,
        isNewBest,
      },
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
    const level = this.difficulty.levelForScore(this.state.score);
    const nextDifficulty = this.difficulty.forLevel(level);
    this.state = { ...this.state, level };
    return nextDifficulty;
  }

  generateRound(difficulty = this.increaseDifficulty()): GameState {
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
    };
  }
}

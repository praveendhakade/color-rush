import { useCallback, useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { GameOverScreen } from '@/src/screens/GameOverScreen';
import { GameplayScreen } from '@/src/screens/GameplayScreen';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';
import { GameEngine } from '@/src/game/GameEngine';
import type { DifficultyMode, GameResult, GameState } from '@/src/game/types';
import { useGameTimer } from '@/src/hooks/useGameTimer';
import { feedback } from '@/src/services/Feedback';
import {
  DEFAULT_STORED_DATA,
  gameStorage,
  type StoredGameData,
} from '@/src/services/Persistence';

type Screen = 'home' | 'settings' | 'game' | 'gameOver';

export default function Index() {
  const [engine] = useState(() => new GameEngine());
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState>(() => engine.getState());
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [stored, setStored] = useState<StoredGameData>(DEFAULT_STORED_DATA);
  const [difficultyMode, setDifficultyMode] =
    useState<DifficultyMode>('medium');
  const [scoreScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    gameStorage.load().then((data) => {
      setStored(data);
      setDifficultyMode(data.difficultyMode);
      feedback.setSoundEnabled(data.soundEnabled);
      engine.setDifficultyMode(data.difficultyMode);
      setState(engine.setBestScore(data.bestScore));
    });
  }, [engine]);

  const chooseDifficulty = useCallback(
    (mode: DifficultyMode) => {
      setDifficultyMode(mode);
      setState(engine.setDifficultyMode(mode));
      const next = { ...stored, difficultyMode: mode };
      setStored(next);
      void gameStorage.save(next);
    },
    [engine, stored],
  );

  const toggleSound = useCallback(() => {
    const next = { ...stored, soundEnabled: !stored.soundEnabled };
    setStored(next);
    feedback.setSoundEnabled(next.soundEnabled);
    void gameStorage.save(next);
  }, [stored]);

  const persistResult = useCallback(
    (result: GameState) => {
      const next = {
        ...stored,
        bestScore: Math.max(stored.bestScore, result.bestScore),
        gamesPlayed: stored.gamesPlayed + 1,
        highestCombo: Math.max(stored.highestCombo, result.highestCombo),
      };
      setStored(next);
      void gameStorage.save(next);
    },
    [stored],
  );

  const finishGame = useCallback(() => {
    const result = engine.handleWrongAnswer();
    setState(result.state);
    setGameResult(result.result ?? null);
    persistResult(result.state);
    feedback.haptic('wrong');
    feedback.sound('gameover');
    setScreen('gameOver');
  }, [engine, persistResult]);

  const {
    start: startTimer,
    stop: stopTimer,
    pause: pauseTimer,
  } = useGameTimer(finishGame, (milliseconds) =>
    setState(engine.setTimeRemaining(milliseconds)),
  );

  const startGame = useCallback(() => {
    stopTimer();
    const next = engine.startGame();
    setState(next);
    setGameResult(null);
    setScreen('game');
    startTimer(next.timeRemaining);
  }, [engine, startTimer, stopTimer]);

  const pauseGame = useCallback(() => {
    const remaining = pauseTimer();
    setState(engine.pauseGame(remaining));
  }, [engine, pauseTimer]);

  const resumeGame = useCallback(() => {
    const next = engine.resumeGame();
    setState(next);
    startTimer(next.timeRemaining);
  }, [engine, startTimer]);

  const tapTile = useCallback(
    (tileId: string) => {
      feedback.sound('tap');
      const result = engine.handleTap(tileId);
      setState(result.state);
      if (!result.correct) {
        stopTimer();
        persistResult(result.state);
        setGameResult(result.result ?? null);
        feedback.haptic('wrong');
        feedback.sound('wrong');
        setScreen('gameOver');
        return;
      }
      feedback.haptic(result.state.combo >= 5 ? 'combo' : 'correct');
      feedback.sound(result.state.combo >= 5 ? 'combo' : 'correct');
      Animated.sequence([
        Animated.timing(scoreScale, {
          toValue: 1.15,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(scoreScale, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();
      startTimer(result.state.timeRemaining);
    },
    [engine, persistResult, scoreScale, startTimer, stopTimer],
  );

  const goHome = useCallback(() => {
    stopTimer();
    setState(engine.resetGame());
    setGameResult(null);
    setScreen('home');
  }, [engine, stopTimer]);

  if (screen === 'home')
    return (
      <HomeScreen
        bestScore={Math.max(stored.bestScore, state.bestScore)}
        onSettings={() => setScreen('settings')}
        onPlay={startGame}
      />
    );
  if (screen === 'settings')
    return (
      <SettingsScreen
        difficultyMode={difficultyMode}
        soundEnabled={stored.soundEnabled}
        onChooseDifficulty={chooseDifficulty}
        onToggleSound={toggleSound}
        onBack={() => setScreen('home')}
      />
    );
  if (screen === 'gameOver')
    return (
      <GameOverScreen
        state={state}
        result={gameResult}
        onReplay={startGame}
        onHome={goHome}
      />
    );
  return (
    <GameplayScreen
      state={state}
      difficultyMode={difficultyMode}
      scoreScale={scoreScale}
      onTap={tapTile}
      onPause={pauseGame}
      onResume={resumeGame}
      onHome={goHome}
    />
  );
}

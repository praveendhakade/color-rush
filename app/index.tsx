import { useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorTile } from '@/src/components/ColorTile';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { COLOR_CONFIG } from '@/src/game/config';
import { GameEngine } from '@/src/game/GameEngine';
import type { GameResult, GameState } from '@/src/game/types';
import { useGameTimer } from '@/src/hooks/useGameTimer';
import { feedback } from '@/src/services/Feedback';
import {
  DEFAULT_STORED_DATA,
  gameStorage,
  type StoredGameData,
} from '@/src/services/Persistence';

type Screen = 'home' | 'game' | 'gameOver';

export default function Index() {
  const [engine] = useState(() => new GameEngine());
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState>(() => engine.getState());
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [stored, setStored] = useState<StoredGameData>(DEFAULT_STORED_DATA);
  const [scoreScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    gameStorage.load().then((data) => {
      setStored(data);
      setState(engine.setBestScore(data.bestScore));
    });
  }, [engine]);

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

  const { start: startTimer, stop: stopTimer } = useGameTimer(
    finishGame,
    (milliseconds) => setState(engine.setTimeRemaining(milliseconds)),
  );

  const startGame = useCallback(() => {
    stopTimer();
    const next = engine.startGame();
    setState(next);
    setGameResult(null);
    setScreen('game');
    startTimer(next.timeRemaining);
  }, [engine, startTimer, stopTimer]);

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
      <Home
        bestScore={Math.max(stored.bestScore, state.bestScore)}
        onPlay={startGame}
      />
    );
  if (screen === 'gameOver')
    return (
      <GameOver
        state={state}
        result={gameResult}
        onReplay={startGame}
        onHome={goHome}
      />
    );
  return <Game state={state} scoreScale={scoreScale} onTap={tapTile} />;
}

const Home = ({
  bestScore,
  onPlay,
}: {
  bestScore: number;
  onPlay: () => void;
}) => (
  <SafeAreaView style={styles.page}>
    <View style={styles.home}>
      <Text style={styles.brand}>COLOR{`\n`}RUSH</Text>
      <Text style={styles.best}>
        BEST SCORE <Text style={styles.bestNumber}>{bestScore}</Text>
      </Text>
      <PrimaryButton label="PLAY" testID="play-button" onPress={onPlay} />
      <Text style={styles.help}>
        Match the named color before time runs out.
      </Text>
    </View>
  </SafeAreaView>
);

const Game = ({
  state,
  scoreScale,
  onTap,
}: {
  state: GameState;
  scoreScale: Animated.Value;
  onTap: (tileId: string) => void;
}) => {
  const target = state.targetColor ? COLOR_CONFIG[state.targetColor] : null;
  const progress =
    `${Math.max(0, Math.round((state.timeRemaining / 1500) * 100))}%` as `${number}%`;
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.game}>
        <View style={styles.stats}>
          <Animated.Text
            style={[styles.score, { transform: [{ scale: scoreScale }] }]}
          >
            SCORE {state.score}
          </Animated.Text>
          <Text style={styles.level}>LEVEL {state.level}</Text>
        </View>
        {state.combo > 0 && (
          <Text style={styles.combo}>COMBO x{state.combo}</Text>
        )}
        <View
          accessibilityLabel={`Time remaining ${state.timeRemaining} milliseconds`}
          style={styles.timerTrack}
        >
          <View style={[styles.timerFill, { width: progress }]} />
        </View>
        <Text style={styles.instruction}>
          TAP <Text style={{ color: target?.hex }}>{target?.label}</Text>
        </Text>
        <Text style={styles.a11yHint}>
          Choose the tile labeled {target?.label}.
        </Text>
        <View style={styles.grid}>
          {state.tiles.map((tile) => (
            <ColorTile key={tile.id} tile={tile} onPress={onTap} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const GameOver = ({
  state,
  result,
  onReplay,
  onHome,
}: {
  state: GameState;
  result: GameResult | null;
  onReplay: () => void;
  onHome: () => void;
}) => (
  <SafeAreaView style={styles.page}>
    <View style={styles.home}>
      <Text style={styles.over}>GAME OVER</Text>
      <Text style={styles.finalScore}>{state.score}</Text>
      <Text style={styles.best}>
        BEST <Text style={styles.bestNumber}>{state.bestScore}</Text>
      </Text>
      <Text style={styles.combo}>COMBO x{result?.combo ?? 0}</Text>
      <PrimaryButton label="PLAY AGAIN" onPress={onReplay} />
      <PrimaryButton label="HOME" onPress={onHome} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  page: { backgroundColor: '#17142E', flex: 1 },
  home: { flex: 1, gap: 22, justifyContent: 'center', padding: 28 },
  brand: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 51,
  },
  best: { color: '#C4C1E0', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  bestNumber: { color: '#FDE047', fontSize: 26 },
  help: { color: '#9994BA', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  game: { flex: 1, padding: 20 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  score: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  level: { color: '#C4C1E0', fontSize: 17, fontWeight: '800' },
  combo: { color: '#FDE047', fontSize: 17, fontWeight: '900', marginTop: 10 },
  timerTrack: {
    backgroundColor: '#353052',
    borderRadius: 6,
    height: 9,
    marginTop: 15,
    overflow: 'hidden',
  },
  timerFill: { backgroundColor: '#FDE047', height: '100%' },
  instruction: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
    marginTop: 36,
    textAlign: 'center',
  },
  a11yHint: {
    color: '#AAA6C8',
    fontSize: 14,
    marginTop: 7,
    textAlign: 'center',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 28,
  },
  over: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
  },
  finalScore: {
    color: '#FDE047',
    fontSize: 76,
    fontWeight: '900',
    textAlign: 'center',
  },
});

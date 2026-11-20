import { useEffect, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorTile } from '@/src/components/ColorTile';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { COLOR_CONFIG } from '@/src/game/config';
import { DifficultyManager } from '@/src/game/DifficultyManager';
import type { DifficultyMode, GameState } from '@/src/game/types';

export const GameplayScreen = ({
  state,
  difficultyMode,
  scoreScale,
  onTap,
  onPause,
  onResume,
  onHome,
  onRevive,
  onEndGame,
}: {
  state: GameState;
  difficultyMode: DifficultyMode;
  scoreScale: Animated.Value;
  onTap: (tileId: string) => void;
  onPause: () => void;
  onResume: () => void;
  onHome: () => void;
  onRevive: () => void;
  onEndGame: () => void;
}) => {
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  const [lifeScale] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (state.lives < 3) {
      Animated.sequence([
        Animated.timing(lifeScale, {
          toValue: 1.25,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(lifeScale, {
          toValue: 1,
          duration: 130,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [lifeScale, state.lives]);
  const target = state.targetColor ? COLOR_CONFIG[state.targetColor] : null;
  const columns = Math.min(3, state.tiles.length);
  const rows = Math.ceil(state.tiles.length / columns);
  const roundDuration = new DifficultyManager(
    undefined,
    difficultyMode,
  ).forLevel(state.level).responseTimeMs;
  const tileSize =
    gridSize.width > 0 && gridSize.height > 0
      ? Math.floor(
          Math.min(
            136,
            (gridSize.width - 12 * (columns - 1)) / columns,
            (gridSize.height - 12 * (rows - 1)) / rows,
          ),
        )
      : 96;
  const updateGridSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setGridSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  };
  const progress =
    `${Math.max(0, Math.round((state.timeRemaining / roundDuration) * 100))}%` as `${number}%`;

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
        <Animated.View
          accessibilityLabel={`${state.lives} lives remaining`}
          accessibilityRole="text"
          style={[styles.lives, { transform: [{ scale: lifeScale }] }]}
        >
          {[0, 1, 2].map((index) => (
            <Text
              key={index}
              style={index < state.lives ? styles.heart : styles.lostHeart}
            >
              {index < state.lives ? '♥' : '♡'}
            </Text>
          ))}
        </Animated.View>
        <View style={styles.pauseRow}>
          {state.combo > 0 ? (
            <Text style={styles.combo}>COMBO x{state.combo}</Text>
          ) : (
            <View />
          )}
          <PrimaryButton label="PAUSE" onPress={onPause} />
        </View>
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
        <View onLayout={updateGridSize} style={styles.grid}>
          {state.tiles.map((tile) => (
            <View key={tile.id} style={{ width: tileSize, height: tileSize }}>
              <ColorTile tile={tile} onPress={onTap} />
            </View>
          ))}
        </View>
      </View>
      {state.status === 'paused' && (
        <View accessibilityViewIsModal style={styles.pauseOverlay}>
          <Text style={styles.title}>PAUSED</Text>
          <Text style={styles.pauseScore}>SCORE {state.score}</Text>
          <PrimaryButton label="RESUME" onPress={onResume} />
          <PrimaryButton label="HOME" onPress={onHome} />
        </View>
      )}
      {state.status === 'reviveOffer' && (
        <View accessibilityViewIsModal style={styles.pauseOverlay}>
          <Text style={styles.title}>DON&apos;T GIVE UP!</Text>
          <Text style={styles.pauseScore}>OUT OF LIVES</Text>
          <Text style={styles.reviveScore}>
            YOUR CURRENT RUN{`\n`}SCORE: {state.score}
          </Text>
          <Text style={styles.adNote}>
            {__DEV__
              ? 'DEV-ONLY REWARDED AD SIMULATION'
              : 'REWARDED ADS COMING SOON'}
          </Text>
          <PrimaryButton
            label={
              __DEV__ ? 'WATCH AD & CONTINUE (DEV)' : 'REWARDED ADS COMING SOON'
            }
            onPress={onRevive}
            disabled={!__DEV__}
          />
          <PrimaryButton label="END GAME" onPress={onEndGame} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { backgroundColor: '#17142E', flex: 1 },
  game: { flex: 1, padding: 20 },
  pauseOverlay: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(23, 20, 46, 0.82)',
    gap: 24,
    justifyContent: 'center',
    padding: 28,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
  },
  pauseScore: {
    color: '#C4C1E0',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  score: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  level: { color: '#C4C1E0', fontSize: 17, fontWeight: '800' },
  lives: { alignSelf: 'center', flexDirection: 'row', gap: 7, marginTop: 9 },
  heart: { color: '#FB7185', fontSize: 26, fontWeight: '900' },
  lostHeart: { color: '#6B6684', fontSize: 26, fontWeight: '900' },
  reviveScore: {
    color: '#FDE047',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  adNote: {
    color: '#AAA6C8',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  pauseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  combo: { color: '#FDE047', fontSize: 17, fontWeight: '900' },
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
    alignContent: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 28,
    paddingBottom: 8,
  },
});

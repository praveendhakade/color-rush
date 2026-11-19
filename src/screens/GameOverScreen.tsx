import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { GameResult, GameState } from '@/src/game/types';

export const GameOverScreen = ({
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
    <View style={styles.content}>
      <Text style={styles.title}>GAME OVER</Text>
      <Text style={styles.finalScore}>{state.score}</Text>
      <Text style={styles.best}>
        BEST <Text style={styles.bestNumber}>{state.bestScore}</Text>
      </Text>
      <Text style={styles.levelReached}>
        LEVEL REACHED <Text style={styles.levelNumber}>{state.level}</Text>
      </Text>
      <Text style={styles.combo}>COMBO x{result?.combo ?? 0}</Text>
      <PrimaryButton label="PLAY AGAIN" onPress={onReplay} />
      <PrimaryButton label="HOME" onPress={onHome} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  page: { backgroundColor: '#17142E', flex: 1 },
  content: { flex: 1, gap: 22, justifyContent: 'center', padding: 28 },
  title: {
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
  best: {
    color: '#C4C1E0',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  bestNumber: { color: '#FDE047', fontSize: 26 },
  levelReached: {
    color: '#C4C1E0',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  levelNumber: { color: '#FDE047', fontSize: 22 },
  combo: {
    color: '#FDE047',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },
});

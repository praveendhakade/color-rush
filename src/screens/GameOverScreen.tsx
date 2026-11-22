import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArcadeBackground } from '@/src/components/ArcadeBackground';
import { PlayerAvatar } from '@/src/components/PlayerAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import type { PlayerProfile } from '@/src/services/Persistence';
import type { GameResult, GameState } from '@/src/game/types';

const CONFETTI = [
  '#4DEBFF',
  '#F472B6',
  '#FDE047',
  '#A78BFA',
  '#FB923C',
  '#4ADE80',
];

export const GameOverScreen = ({
  state,
  result,
  onReplay,
  onHome,
  player,
}: {
  state: GameState;
  result: GameResult | null;
  onReplay: () => void;
  onHome: () => void;
  player: PlayerProfile;
}) => {
  const reducedMotion = useReducedMotion();
  const [particles] = useState(() => CONFETTI.map(() => new Animated.Value(0)));
  useEffect(() => {
    if (!result?.isNewBest || reducedMotion) return;
    Animated.stagger(
      65,
      particles.map((particle) =>
        Animated.timing(particle, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [particles, reducedMotion, result?.isNewBest]);

  return (
    <ArcadeBackground>
      {!reducedMotion && result?.isNewBest && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {particles.map((particle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  backgroundColor: CONFETTI[index],
                  left: `${12 + index * 14}%`,
                  opacity: particle.interpolate({
                    inputRange: [0, 0.12, 0.8, 1],
                    outputRange: [0, 1, 0.85, 0],
                  }),
                  transform: [
                    {
                      translateY: particle.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-15, 210 + (index % 2) * 45],
                      }),
                    },
                    {
                      rotate: particle.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${180 + index * 70}deg`],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>COLOR RUSH ARCADE</Text>
          <Text style={styles.title}>GAME OVER</Text>
        </View>
        <View style={styles.playerPill}>
          <PlayerAvatar avatarId={player.avatarId} size={42} />
          <Text style={styles.playerName}>{player.name}</Text>
        </View>
        <View
          style={[styles.scoreCard, result?.isNewBest && styles.recordCard]}
        >
          {result?.isNewBest && (
            <Text style={styles.recordTag}>★ NEW PERSONAL BEST ★</Text>
          )}
          <Text style={styles.scoreLabel}>YOUR SCORE</Text>
          <Text style={styles.finalScore}>{state.score}</Text>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.bestScore}</Text>
              <Text style={styles.statLabel}>PERSONAL BEST</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.level}</Text>
              <Text style={styles.statLabel}>LEVEL</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>×{result?.highestCombo ?? 0}</Text>
              <Text style={styles.statLabel}>BEST COMBO</Text>
            </View>
          </View>
        </View>
        <PrimaryButton label="PLAY AGAIN" onPress={onReplay} />
        <PrimaryButton label="HOME" onPress={onHome} variant="secondary" />
      </ScrollView>
    </ArcadeBackground>
  );
};

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 16, justifyContent: 'center', padding: 24 },
  confetti: {
    borderRadius: 3,
    height: 12,
    position: 'absolute',
    top: '25%',
    width: 7,
  },
  header: { alignItems: 'center', gap: 5 },
  kicker: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: { color: '#FFF', fontSize: 31, fontWeight: '900', letterSpacing: 1.1 },
  playerPill: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#201A39',
    borderColor: '#393153',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  playerName: { color: '#F7F4FF', fontSize: 15, fontWeight: '800' },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: '#211B3B',
    borderColor: '#393153',
    borderRadius: 26,
    borderWidth: 1,
    gap: 9,
    padding: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
  recordCard: { borderColor: '#FDE047' },
  recordTag: {
    color: '#FDE047',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreLabel: {
    color: '#AAA4C5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  finalScore: {
    color: '#FDE047',
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 78,
  },
  divider: {
    alignSelf: 'stretch',
    backgroundColor: '#393153',
    height: 1,
    marginVertical: 5,
  },
  statsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: { alignItems: 'center', flex: 1, gap: 5 },
  statValue: { color: '#FFF', fontSize: 21, fontWeight: '900' },
  statLabel: {
    color: '#A8A1C3',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});

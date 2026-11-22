import { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArcadeBackground } from '@/src/components/ArcadeBackground';
import { PlayerAvatar } from '@/src/components/PlayerAvatar';
import { PlayerCard } from '@/src/components/PlayerCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { DifficultyMode } from '@/src/game/types';
import { rankPlayers } from '@/src/game/Leaderboard';
import type { PlayerProfile, ScoreRecord } from '@/src/services/Persistence';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

const MODES: DifficultyMode[] = ['easy', 'medium', 'hard'];
const PODIUM = [
  { place: 2, height: 51, color: '#A7B4D0', medal: '2ND' },
  { place: 1, height: 78, color: '#FDE047', medal: '1ST' },
  { place: 3, height: 38, color: '#FB923C', medal: '3RD' },
];

const Entrance = ({
  children,
  index,
  reducedMotion,
}: {
  children: React.ReactNode;
  index: number;
  reducedMotion: boolean;
}) => {
  const [progress] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));
  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay: Math.min(index * 45, 225),
      duration: 230,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [index, progress, reducedMotion]);
  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

export const LeaderboardScreen = ({
  profiles,
  activeProfileId,
  difficulty,
  records,
  onDifficulty,
  onBack,
}: {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  difficulty: DifficultyMode;
  records: ScoreRecord[];
  onDifficulty: (mode: DifficultyMode) => void;
  onBack: () => void;
}) => {
  const reducedMotion = useReducedMotion();
  const ranked = rankPlayers(profiles, records, difficulty);
  const scored = ranked.filter((item) => item.bestRecord);
  const active = profiles.find((profile) => profile.id === activeProfileId);
  const activeRank = scored.findIndex(
    (item) => item.profile.id === activeProfileId,
  );
  const activeScore =
    activeRank >= 0 ? (scored[activeRank]?.bestRecord?.score ?? 0) : 0;
  const leader = scored[0];
  const rivals = scored.filter((item) => item.profile.id !== activeProfileId);
  const rival = [...rivals].sort(
    (a, b) =>
      Math.abs((a.bestRecord?.score ?? 0) - activeScore) -
      Math.abs((b.bestRecord?.score ?? 0) - activeScore),
  )[0];
  const leadMessage = !leader
    ? 'Play a round to claim your place on the board.'
    : leader.profile.id === activeProfileId
      ? 'You’re leading your crew! Keep that streak alive.'
      : activeRank < 0
        ? 'Play your first round and jump onto the board.'
        : `Only ${Math.max(0, (leader.bestRecord?.score ?? 0) - activeScore)} points to catch the leader!`;

  return (
    <ArcadeBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>THE LOCAL ARCADE</Text>
          <Text style={styles.title}>LEADERBOARD</Text>
          <Text style={styles.subtitle}>
            Best run wins. Play on this device.
          </Text>
        </View>
        <View style={styles.modePicker}>
          {MODES.map((mode) => (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === difficulty }}
              onPress={() => onDifficulty(mode)}
              style={[styles.mode, mode === difficulty && styles.modeSelected]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === difficulty && styles.modeSelectedText,
                ]}
              >
                {mode.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.leadBanner}>
          <Text style={styles.leadIcon}>
            {leader?.profile.id === activeProfileId ? '✦' : '⚡'}
          </Text>
          <Text style={styles.leadMessage}>{leadMessage}</Text>
        </View>

        {scored.length > 0 ? (
          <>
            <View style={styles.podium}>
              {PODIUM.map(({ place, height, color, medal }) => {
                const item = scored[place - 1];
                return (
                  <Entrance
                    key={place}
                    index={place}
                    reducedMotion={reducedMotion}
                  >
                    <View style={styles.podiumColumn}>
                      {item ? (
                        <View style={styles.podiumPlayer}>
                          {place === 1 && <Text style={styles.crown}>👑</Text>}
                          <PlayerAvatar
                            avatarId={item.profile.avatarId}
                            size={place === 1 ? 58 : 48}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.podiumName,
                              item.profile.id === activeProfileId &&
                                styles.myName,
                            ]}
                          >
                            {item.profile.name}
                          </Text>
                          <Text style={[styles.podiumScore, { color }]}>
                            {item.bestRecord?.score ?? 0}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.emptyPodiumPlayer} />
                      )}
                      <View
                        style={[
                          styles.podiumBase,
                          {
                            height,
                            borderColor: `${color}66`,
                            backgroundColor: `${color}1A`,
                          },
                        ]}
                      >
                        <Text style={[styles.podiumPlace, { color }]}>
                          {medal}
                        </Text>
                      </View>
                    </View>
                  </Entrance>
                );
              })}
            </View>

            {scored.length > 3 && (
              <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>IN THE RACE</Text>
                {scored.slice(3).map(({ profile, bestRecord }, index) => (
                  <Entrance
                    key={profile.id}
                    index={index}
                    reducedMotion={reducedMotion}
                  >
                    <PlayerCard
                      profile={profile}
                      active={profile.id === activeProfileId}
                      detail={`LEVEL ${bestRecord?.level ?? 1}${profile.id === activeProfileId ? '  ·  YOU' : ''}`}
                      style={styles.rankedCard}
                    >
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{index + 4}</Text>
                      </View>
                      <Text style={styles.listScore}>
                        {bestRecord?.score ?? 0}
                      </Text>
                    </PlayerCard>
                  </Entrance>
                ))}
              </View>
            )}

            {rival ? (
              <View style={styles.rivalCard}>
                <Text style={styles.sectionTitle}>RIVAL CHALLENGE</Text>
                <View style={styles.rivalRow}>
                  <PlayerAvatar avatarId={rival.profile.avatarId} size={46} />
                  <View style={styles.rivalCopy}>
                    <Text style={styles.rivalName}>{rival.profile.name}</Text>
                    <Text style={styles.rivalHint}>
                      Your closest score to chase
                    </Text>
                  </View>
                  <View style={styles.gapPill}>
                    <Text style={styles.gapValue}>
                      {Math.abs((rival.bestRecord?.score ?? 0) - activeScore)}
                    </Text>
                    <Text style={styles.gapLabel}>PTS GAP</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.rivalCard}>
                <Text style={styles.sectionTitle}>RIVAL CHALLENGE</Text>
                <Text style={styles.emptyRival}>
                  Add another player to start a friendly rivalry.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🏁</Text>
            <Text style={styles.emptyTitle}>It’s a clean slate!</Text>
            <Text style={styles.emptyCopy}>
              {profiles.length === 1
                ? 'Play a round, then add your family to chase your score.'
                : 'Play your first round. Your best score will light up the podium.'}
            </Text>
          </View>
        )}

        {active && (
          <View style={styles.myStats}>
            <View style={styles.statsHeading}>
              <PlayerAvatar avatarId={active.avatarId} size={38} />
              <View style={styles.statsHeadingCopy}>
                <Text style={styles.sectionTitle}>MY ARCADE STATS</Text>
                <Text style={styles.activeName}>{active.name}</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <Stat
                value={String(active.statistics.bestScore)}
                label="BEST SCORE"
              />
              <Stat
                value={String(active.statistics.gamesPlayed)}
                label="GAMES"
              />
              <Stat
                value={String(active.statistics.highestLevel)}
                label="TOP LEVEL"
              />
              <Stat
                value={`×${active.statistics.highestCombo}`}
                label="BEST COMBO"
              />
            </View>
          </View>
        )}
        <PrimaryButton
          label="BACK TO ARCADE"
          onPress={onBack}
          variant="secondary"
        />
      </ScrollView>
    </ArcadeBackground>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 16, padding: 20 },
  header: { alignItems: 'center', gap: 4, paddingTop: 6 },
  eyebrow: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.9,
  },
  title: { color: '#FFF', fontSize: 29, fontWeight: '900', letterSpacing: 0.7 },
  subtitle: { color: '#AAA4C5', fontSize: 12 },
  modePicker: {
    alignSelf: 'center',
    backgroundColor: '#1A1630',
    borderColor: '#373052',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  mode: {
    alignItems: 'center',
    borderRadius: 10,
    minWidth: 76,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  modeSelected: { backgroundColor: '#4DEBFF' },
  modeText: {
    color: '#AFA8C9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  modeSelectedText: { color: '#100D24' },
  leadBanner: {
    alignItems: 'center',
    backgroundColor: '#27203F',
    borderColor: '#59467F',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  leadIcon: { color: '#FDE047', fontSize: 21, fontWeight: '900' },
  leadMessage: { color: '#F2EDFF', flex: 1, fontSize: 12, fontWeight: '800' },
  podium: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 203,
    paddingHorizontal: 3,
  },
  podiumColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: 130,
  },
  podiumPlayer: {
    alignItems: 'center',
    gap: 3,
    justifyContent: 'flex-end',
    minHeight: 120,
    paddingHorizontal: 4,
    width: '100%',
  },
  emptyPodiumPlayer: { minHeight: 120 },
  crown: { fontSize: 20, height: 24 },
  podiumName: {
    color: '#EEEAF7',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: '100%',
  },
  myName: { color: '#4DEBFF' },
  podiumScore: { fontSize: 13, fontWeight: '900' },
  podiumBase: {
    alignItems: 'center',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 7,
    width: '92%',
  },
  podiumPlace: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  listSection: { gap: 9 },
  sectionTitle: {
    color: '#AFA8C9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  rankedCard: { padding: 10 },
  rankBadge: {
    alignItems: 'center',
    backgroundColor: '#352D4F',
    borderRadius: 9,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  rankText: { color: '#D4CFF0', fontSize: 12, fontWeight: '900' },
  listScore: {
    color: '#FDE047',
    fontSize: 19,
    fontWeight: '900',
    minWidth: 45,
    textAlign: 'right',
  },
  rivalCard: {
    backgroundColor: '#1C1933',
    borderColor: '#3B3155',
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  rivalRow: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  rivalCopy: { flex: 1 },
  rivalName: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  rivalHint: { color: '#AAA4C5', fontSize: 10, marginTop: 3 },
  gapPill: {
    alignItems: 'center',
    backgroundColor: '#302544',
    borderColor: '#65405D',
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 62,
    padding: 7,
  },
  gapValue: { color: '#F9A8D4', fontSize: 17, fontWeight: '900' },
  gapLabel: {
    color: '#C5A5BF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  emptyRival: { color: '#AAA4C5', fontSize: 12, lineHeight: 18 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#1E1937',
    borderColor: '#3A3158',
    borderRadius: 22,
    borderWidth: 1,
    gap: 9,
    padding: 27,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#FFF', fontSize: 19, fontWeight: '900' },
  emptyCopy: {
    color: '#B7B0CD',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  myStats: {
    backgroundColor: '#1C1933',
    borderColor: '#3B3155',
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    padding: 15,
  },
  statsHeading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  statsHeadingCopy: { gap: 3 },
  activeName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 13 },
  stat: { alignItems: 'center', gap: 3, width: '50%' },
  statValue: { color: '#FDE047', fontSize: 18, fontWeight: '900' },
  statLabel: {
    color: '#AAA4C5',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});

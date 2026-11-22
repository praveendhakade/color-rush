import {
  Animated,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { ArcadeBackground } from '@/src/components/ArcadeBackground';
import { PlayerCard } from '@/src/components/PlayerCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { PlayerProfile } from '@/src/services/Persistence';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

const PRIVACY_POLICY_URL =
  'https://praveendhakade.github.io/color-rush/privacy-policy.html';

export const HomeScreen = ({
  bestScore,
  onSettings,
  onPlay,
  activeProfile,
  onProfiles,
  onLeaderboard,
}: {
  bestScore: number;
  onSettings: () => void;
  onPlay: () => void;
  activeProfile: PlayerProfile;
  onProfiles: () => void;
  onLeaderboard: () => void;
}) => {
  const [playerIntro] = useState(() => new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) {
      playerIntro.setValue(1);
      return;
    }
    Animated.spring(playerIntro, {
      toValue: 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [playerIntro, reducedMotion]);
  const nextTarget = Math.max(100, (Math.floor(bestScore / 100) + 1) * 100);
  const challengeProgress = Math.min(1, bestScore / nextTarget);
  return (
    <ArcadeBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.eyebrow}>LOCAL ARCADE</Text>
            <Text style={styles.brand}>COLOR RUSH</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="SETTINGS"
            onPress={onSettings}
            style={({ pressed }) => [
              styles.settings,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>

        <Animated.View
          style={{
            opacity: playerIntro,
            transform: [
              {
                scale: playerIntro.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.97, 1],
                }),
              },
            ],
          }}
        >
          <PlayerCard
            profile={activeProfile}
            detail={`PERSONAL BEST  ${bestScore}`}
            active
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch player"
              onPress={onProfiles}
              style={({ pressed }) => [
                styles.switchButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.switchText}>SWITCH</Text>
            </Pressable>
          </PlayerCard>
        </Animated.View>

        <View style={styles.challengeCard}>
          <View style={styles.challengeHeading}>
            <View style={styles.challengeIcon}>
              <Text style={styles.targetIcon}>✦</Text>
            </View>
            <View style={styles.challengeCopy}>
              <Text style={styles.challengeEyebrow}>PERSONAL CHALLENGE</Text>
              <Text style={styles.challengeTitle}>
                Reach {nextTarget} points
              </Text>
            </View>
            <Text style={styles.challengeProgressText}>
              {Math.round(challengeProgress * 100)}%
            </Text>
          </View>
          <View
            accessibilityLabel={`${Math.round(challengeProgress * 100)} percent to next target`}
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${challengeProgress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.challengeHint}>
            {bestScore > 0
              ? `${Math.max(0, nextTarget - bestScore)} points to your next milestone`
              : 'Your first milestone is waiting. Jump in!'}
          </Text>
        </View>

        <PrimaryButton label="PLAY NOW" testID="play-button" onPress={onPlay} />
        <View style={styles.shortcuts}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="LEADERBOARD"
            onPress={onLeaderboard}
            style={({ pressed }) => [
              styles.shortcut,
              styles.leaderboardShortcut,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.shortcutIcon}>🏆</Text>
            <Text style={styles.shortcutTitle}>LEADERBOARD</Text>
            <Text style={styles.shortcutCaption}>Family face-off</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ACHIEVEMENTS"
            onPress={() =>
              Alert.alert(
                'Achievements',
                'Unlockable achievements are coming soon. For now, chase your next personal best!',
              )
            }
            style={({ pressed }) => [
              styles.shortcut,
              styles.achievementShortcut,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.shortcutIcon}>✦</Text>
            <Text style={styles.shortcutTitle}>ACHIEVEMENTS</Text>
            <Text style={styles.shortcutCaption}>Coming soon</Text>
          </Pressable>
        </View>

        <Text style={styles.help}>
          Match the named color before time runs out.
        </Text>
        <Text
          accessibilityRole="link"
          accessibilityLabel="Privacy policy"
          onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          style={styles.privacyLink}
        >
          Privacy Policy
        </Text>
      </ScrollView>
    </ArcadeBackground>
  );
};

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 16, justifyContent: 'center', padding: 22 },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
  },
  eyebrow: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brand: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginTop: 2,
  },
  settings: {
    alignItems: 'center',
    backgroundColor: '#211B3B',
    borderColor: '#393153',
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  settingsIcon: { color: '#D3CFF0', fontSize: 23 },
  switchButton: {
    backgroundColor: '#30294C',
    borderColor: '#51476F',
    borderRadius: 11,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  switchText: {
    color: '#E4DEFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  challengeCard: {
    backgroundColor: '#1C1933',
    borderColor: '#352E53',
    borderRadius: 19,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  challengeHeading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  challengeIcon: {
    alignItems: 'center',
    backgroundColor: '#393056',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  targetIcon: { color: '#FDE047', fontSize: 23, fontWeight: '900' },
  challengeCopy: { flex: 1 },
  challengeEyebrow: {
    color: '#AAA4C5',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  challengeTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  challengeProgressText: { color: '#FDE047', fontSize: 13, fontWeight: '900' },
  progressTrack: {
    backgroundColor: '#342E4E',
    borderRadius: 5,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#FDE047', borderRadius: 5, height: '100%' },
  challengeHint: { color: '#AAA4C5', fontSize: 11 },
  shortcuts: { flexDirection: 'row', gap: 11 },
  shortcut: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 105,
    padding: 13,
  },
  leaderboardShortcut: { backgroundColor: '#192D3B', borderColor: '#23566A' },
  achievementShortcut: { backgroundColor: '#2B1D38', borderColor: '#5C3565' },
  shortcutIcon: { fontSize: 21, marginBottom: 2 },
  shortcutTitle: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  shortcutCaption: { color: '#B8B2CC', fontSize: 10 },
  help: { color: '#A8A1C3', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  privacyLink: {
    color: '#8D86A8',
    fontSize: 11,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

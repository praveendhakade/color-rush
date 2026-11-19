import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';

const PRIVACY_POLICY_URL =
  'https://praveendhakade.github.io/color-rush/privacy-policy.html';

export const HomeScreen = ({
  bestScore,
  onSettings,
  onPlay,
}: {
  bestScore: number;
  onSettings: () => void;
  onPlay: () => void;
}) => (
  <SafeAreaView style={styles.page}>
    <View style={styles.content}>
      <Text style={styles.brand}>COLOR{'\n'}RUSH</Text>
      <Text style={styles.best}>
        BEST SCORE <Text style={styles.bestNumber}>{bestScore}</Text>
      </Text>
      <PrimaryButton label="PLAY" testID="play-button" onPress={onPlay} />
      <PrimaryButton label="SETTINGS" onPress={onSettings} />
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
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  page: { backgroundColor: '#17142E', flex: 1 },
  content: { flex: 1, gap: 22, justifyContent: 'center', padding: 28 },
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
  privacyLink: {
    color: '#C4C1E0',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

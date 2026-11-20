import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import type { DifficultyMode } from '@/src/game/types';

export const SettingsScreen = ({
  difficultyMode,
  soundEnabled,
  hapticsEnabled,
  onChooseDifficulty,
  onToggleSound,
  onToggleHaptics,
  onBack,
}: {
  difficultyMode: DifficultyMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onChooseDifficulty: (mode: DifficultyMode) => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onBack: () => void;
}) => (
  <SafeAreaView style={styles.page}>
    <View style={styles.content}>
      <Text style={styles.title}>SETTINGS</Text>
      <Text style={styles.settingLabel}>DIFFICULTY</Text>
      <View style={styles.choices}>
        {(['easy', 'medium', 'hard'] as const).map((mode) => (
          <Pressable
            key={mode}
            accessibilityRole="button"
            accessibilityState={{ selected: difficultyMode === mode }}
            onPress={() => onChooseDifficulty(mode)}
            style={[styles.choice, difficultyMode === mode && styles.selected]}
          >
            <Text
              style={[
                styles.choiceText,
                difficultyMode === mode && styles.selectedText,
              ]}
            >
              {mode.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.settingLabel}>SOUND</Text>
      <Pressable
        accessibilityLabel="SOUND"
        accessibilityRole="switch"
        accessibilityState={{ checked: soundEnabled }}
        onPress={onToggleSound}
        style={[styles.soundToggle, soundEnabled && styles.selected]}
      >
        <Text style={[styles.choiceText, soundEnabled && styles.selectedText]}>
          {soundEnabled ? 'ON' : 'OFF'}
        </Text>
      </Pressable>
      <Text style={styles.settingLabel}>HAPTICS</Text>
      <Pressable
        accessibilityLabel="HAPTICS"
        accessibilityRole="switch"
        accessibilityState={{ checked: hapticsEnabled }}
        onPress={onToggleHaptics}
        style={[styles.soundToggle, hapticsEnabled && styles.selected]}
      >
        <Text
          style={[styles.choiceText, hapticsEnabled && styles.selectedText]}
        >
          {hapticsEnabled ? 'ON' : 'OFF'}
        </Text>
      </Pressable>
      <PrimaryButton label="BACK" onPress={onBack} />
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
  settingLabel: {
    color: '#AAA6C8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  choices: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  choice: {
    borderColor: '#514B72',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  soundToggle: {
    alignSelf: 'center',
    borderColor: '#514B72',
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 90,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  selected: { backgroundColor: '#FDE047', borderColor: '#FDE047' },
  choiceText: { color: '#C4C1E0', fontSize: 12, fontWeight: '800' },
  selectedText: { color: '#302400' },
});

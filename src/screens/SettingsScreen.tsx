import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArcadeBackground } from '@/src/components/ArcadeBackground';
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
  <ArcadeBackground>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>TUNE YOUR GAME</Text>
        <Text style={styles.title}>SETTINGS</Text>
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>DIFFICULTY</Text>
        <Text style={styles.caption}>Pick your pace for the next run.</Text>
        <View style={styles.choices}>
          {(['easy', 'medium', 'hard'] as const).map((mode) => (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityState={{ selected: difficultyMode === mode }}
              onPress={() => onChooseDifficulty(mode)}
              style={[
                styles.choice,
                difficultyMode === mode && styles.selected,
              ]}
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
      </View>
      <ToggleRow label="SOUND" value={soundEnabled} onPress={onToggleSound} />
      <ToggleRow
        label="HAPTICS"
        value={hapticsEnabled}
        onPress={onToggleHaptics}
      />
      <PrimaryButton
        label="BACK TO ARCADE"
        onPress={onBack}
        variant="secondary"
      />
    </ScrollView>
  </ArcadeBackground>
);

const ToggleRow = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: boolean;
  onPress: () => void;
}) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleCopy}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.caption}>
        {value ? 'Enabled for your game.' : 'Turned off.'}
      </Text>
    </View>
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[styles.toggle, value && styles.toggleOn]}
    >
      <View style={[styles.toggleThumb, value && styles.thumbOn]} />
      <Text style={[styles.toggleText, value && styles.toggleTextOn]}>
        {value ? 'ON' : 'OFF'}
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 15, justifyContent: 'center', padding: 23 },
  heading: { alignItems: 'center', gap: 5, marginBottom: 5 },
  eyebrow: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  title: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  group: {
    backgroundColor: '#201A39',
    borderColor: '#393153',
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 17,
  },
  label: {
    color: '#F7F4FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  caption: { color: '#AAA4C5', fontSize: 11, marginTop: 4 },
  choices: { flexDirection: 'row', gap: 8, marginTop: 5 },
  choice: {
    alignItems: 'center',
    backgroundColor: '#2A2444',
    borderColor: '#494064',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  selected: { backgroundColor: '#4DEBFF', borderColor: '#4DEBFF' },
  choiceText: {
    color: '#CCC5E3',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  selectedText: { color: '#100D24' },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: '#201A39',
    borderColor: '#393153',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 78,
    paddingHorizontal: 17,
    paddingVertical: 12,
  },
  toggleCopy: { flex: 1 },
  toggle: {
    alignItems: 'center',
    backgroundColor: '#342C4D',
    borderColor: '#50466D',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 78,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  toggleOn: { backgroundColor: '#163C43', borderColor: '#34808A' },
  toggleThumb: {
    backgroundColor: '#A8A1C3',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  thumbOn: { backgroundColor: '#4DEBFF' },
  toggleText: { color: '#B8B2CC', fontSize: 10, fontWeight: '900' },
  toggleTextOn: { color: '#4DEBFF' },
});

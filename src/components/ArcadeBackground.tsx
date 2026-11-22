import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ArcadeBackground = ({ children }: { children: ReactNode }) => (
  <SafeAreaView style={styles.page}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.glowPurple} />
      <View style={styles.glowCyan} />
      <View style={styles.glowPink} />
    </View>
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  page: { backgroundColor: '#100D24', flex: 1, overflow: 'hidden' },
  glowPurple: {
    backgroundColor: '#7349D8',
    borderRadius: 180,
    height: 290,
    opacity: 0.11,
    position: 'absolute',
    right: -150,
    top: -120,
    width: 290,
  },
  glowCyan: {
    backgroundColor: '#21D4E8',
    borderRadius: 160,
    bottom: 70,
    height: 240,
    left: -160,
    opacity: 0.07,
    position: 'absolute',
    width: 240,
  },
  glowPink: {
    backgroundColor: '#F472B6',
    borderRadius: 100,
    height: 150,
    opacity: 0.05,
    position: 'absolute',
    right: 20,
    top: '45%',
    width: 150,
  },
});

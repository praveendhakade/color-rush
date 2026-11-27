import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

export const ArcadeBackground = ({
  children,
  animatedShapes = false,
}: {
  children: ReactNode;
  animatedShapes?: boolean;
}) => (
  <SafeAreaView style={styles.page}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.glowPurple} />
      <View style={styles.glowCyan} />
      <View style={styles.glowPink} />
      {animatedShapes && (
        <>
          <FloatingShape size={76} color="#8B5CF6" style={styles.shapeOne} duration={18000} />
          <FloatingShape size={54} color="#22D3EE" style={styles.shapeTwo} duration={23000} />
          <FloatingShape size={42} color="#F472B6" style={styles.shapeThree} duration={20000} />
        </>
      )}
    </View>
    {children}
  </SafeAreaView>
);

const FloatingShape = ({
  size,
  color,
  style,
  duration,
}: {
  size: number;
  color: string;
  style: StyleProp<ViewStyle>;
  duration: number;
}) => {
  const [motion] = useState(() => new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) {
      motion.setValue(0.5);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [duration, motion, reducedMotion]);

  const rotateX = motion.interpolate({ inputRange: [0, 1], outputRange: ['-26deg', '26deg'] });
  const rotateY = motion.interpolate({ inputRange: [0, 1], outputRange: ['32deg', '-32deg'] });
  const rotateZ = motion.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] });
  const translateY = motion.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });

  return (
    <Animated.View
      style={[
        styles.floatingShape,
        style,
        {
          backgroundColor: `${color}18`,
          borderColor: `${color}75`,
          height: size,
          width: size,
          transform: [
            { perspective: 500 },
            { rotateX },
            { rotateY },
            { rotateZ },
            { translateY },
          ],
        },
      ]}
    >
      <Text style={[styles.shapeMark, { color }]}>✦</Text>
      <View style={[styles.shapeInset, { borderColor: `${color}70` }]} />
    </Animated.View>
  );
};

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
  floatingShape: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    opacity: 0.24,
    position: 'absolute',
  },
  shapeInset: {
    borderRadius: 12,
    borderWidth: 1,
    bottom: 8,
    left: 8,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  shapeMark: { fontSize: 23, opacity: 0.8 },
  shapeOne: { right: 24, top: '24%' },
  shapeTwo: { bottom: '26%', left: 12 },
  shapeThree: { bottom: '12%', right: 36 },
});

import { Pressable, StyleSheet, Text } from 'react-native';
import { COLOR_CONFIG } from '@/src/game/config';
import type { Tile } from '@/src/game/types';

export const ColorTile = ({
  tile,
  onPress,
}: {
  tile: Tile;
  onPress: (tileId: string) => void;
}) => {
  const color = COLOR_CONFIG[tile.color];
  return (
    <Pressable
      accessibilityLabel={`${color.label} tile`}
      accessibilityRole="button"
      onPress={() => onPress(tile.id)}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: color.hex,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <Text style={[styles.label, { color: color.textColor }]}>
        {color.label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: 24,
    elevation: 4,
    flex: 1,
    justifyContent: 'center',
    minHeight: 104,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  label: { fontSize: 17, fontWeight: '900', letterSpacing: 1 },
});

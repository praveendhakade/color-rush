import { Pressable, StyleSheet, Text } from 'react-native';

export const PrimaryButton = ({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    testID={testID}
    onPress={onPress}
    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  >
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#FDE047',
    borderRadius: 18,
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  label: {
    color: '#17142E',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

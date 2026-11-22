import { Pressable, StyleSheet, Text } from 'react-native';

export const PrimaryButton = ({
  label,
  onPress,
  testID,
  disabled = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'pink' | 'quiet';
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    testID={testID}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      styles[variant],
      disabled && styles.disabled,
      pressed && styles.pressed,
    ]}
  >
    <Text
      style={[
        styles.label,
        (variant === 'secondary' || variant === 'quiet') && styles.lightLabel,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 18,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  label: {
    color: '#100D24',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  lightLabel: { color: '#F7F4FF' },
  primary: {
    backgroundColor: '#4DEBFF',
    shadowColor: '#4DEBFF',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#292341',
    borderColor: '#51476F',
    borderWidth: 1,
  },
  pink: { backgroundColor: '#F472B6' },
  quiet: {
    backgroundColor: 'transparent',
    borderColor: '#51476F',
    borderWidth: 1,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
});

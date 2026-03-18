import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors.ts';
import spacing from '../../theme/spacing.ts';
import typography from '../../theme/typography.ts';

const variants = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    textColor: colors.white,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    textColor: colors.textPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    textColor: colors.textPrimary,
  },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const tone = variants[variant] || variants.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tone.backgroundColor,
          borderColor: tone.borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: tone.textColor }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
  },
});

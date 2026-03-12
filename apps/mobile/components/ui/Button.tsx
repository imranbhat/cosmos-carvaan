import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantConfig = {
  primary: {
    bg: colors.primary,
    text: '#FFFFFF',
    border: 'transparent',
    shadow: shadows.md,
  },
  secondary: {
    bg: colors.accent,
    text: '#FFFFFF',
    border: 'transparent',
    shadow: shadows.md,
  },
  outline: {
    bg: 'transparent',
    text: colors.primary,
    border: colors.primary,
    shadow: {},
  },
  ghost: {
    bg: 'transparent',
    text: colors.primary,
    border: 'transparent',
    shadow: {},
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const config = variantConfig[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        config.shadow as ViewStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={config.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: config.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.md,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...typography.label,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

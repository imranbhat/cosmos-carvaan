import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'accent' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.primary + '15', text: colors.primary },
  success: { bg: colors.success + '15', text: colors.success },
  warning: { bg: colors.warning + '15', text: colors.accentDark },
  accent: { bg: colors.accent + '15', text: colors.accentDark },
  muted: { bg: colors.borderLight, text: colors.textSecondary },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});

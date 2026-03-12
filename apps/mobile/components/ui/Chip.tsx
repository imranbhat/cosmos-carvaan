import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  onRemove?: () => void;
}

export function Chip({ label, selected = false, onPress, onRemove }: ChipProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onRemove ?? onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
      {selected && onRemove && (
        <Text style={styles.remove}> ✕</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  remove: {
    ...typography.caption,
    color: colors.primary,
  },
});

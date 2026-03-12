import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

const QUICK_REPLIES = [
  'Is this still available?',
  "What's the lowest price?",
  'Can I schedule a test drive?',
  'Is the price negotiable?',
  'Can you share more photos?',
];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

export function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QUICK_REPLIES.map((reply) => (
        <Pressable
          key={reply}
          style={styles.chip}
          onPress={() => onSelect(reply)}
        >
          <Text style={styles.chipText}>{reply}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});

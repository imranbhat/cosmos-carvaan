import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
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
    <View style={styles.wrapper}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
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

import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
}

export function EmptyState({ title, message, icon = 'car' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <SymbolView
          name={{ ios: icon as any, android: 'directions_car', web: 'directions_car' }}
          tintColor={colors.textTertiary}
          size={36}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['6xl'],
    paddingHorizontal: spacing['3xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
  },
});

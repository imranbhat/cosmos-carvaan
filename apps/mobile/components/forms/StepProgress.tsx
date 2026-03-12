import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Vehicle', 'Details', 'Photos', 'Pricing', 'Review'];

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.labels}>
        {STEP_LABELS.slice(0, totalSteps).map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <View key={label} style={styles.labelItem}>
              <View
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isActive && styles.dotActive,
                ]}
              >
                <Text
                  style={[
                    styles.dotText,
                    (isDone || isActive) && styles.dotTextActive,
                  ]}
                >
                  {isDone ? '✓' : String(step)}
                </Text>
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  barBg: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelItem: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  dotTextActive: {
    color: '#fff',
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

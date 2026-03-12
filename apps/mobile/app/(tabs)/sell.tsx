import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useSellStore } from '@/stores/sellStore';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const FEATURES = [
  {
    icon: '📸',
    title: 'Guided Photos',
    desc: 'Step-by-step photo capture for best results',
  },
  {
    icon: '📊',
    title: 'Smart Pricing',
    desc: 'AI-powered price suggestions based on market data',
  },
  {
    icon: '⚡',
    title: 'Quick Listing',
    desc: 'List your car in under 5 minutes',
  },
];

const STEPS_PREVIEW = [
  { step: '1', label: 'Car Details' },
  { step: '2', label: 'Condition' },
  { step: '3', label: 'Photos' },
  { step: '4', label: 'Pricing' },
  { step: '5', label: 'Review' },
];

export default function SellScreen() {
  const router = useRouter();
  const { currentStep, makeId, reset } = useSellStore();
  const hasDraft = makeId !== null;

  return (
    <Screen>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🚗</Text>
        <Text style={styles.heroTitle}>Sell Your Car</Text>
        <Text style={styles.heroSubtitle}>
          List your car and reach thousands of buyers across the UAE
        </Text>
      </View>

      {/* CTA */}
      <View style={[styles.ctaCard, shadows.md]}>
        <Button
          title="Start New Listing"
          onPress={() => {
            reset();
            router.push('/sell/step1' as any);
          }}
          fullWidth
        />

        {/* Steps preview */}
        <View style={styles.stepsRow}>
          {STEPS_PREVIEW.map((s, i) => (
            <View key={s.step} style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>{s.step}</Text>
              </View>
              <Text style={styles.stepLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Draft card */}
      {hasDraft && (
        <Pressable
          style={({ pressed }) => [styles.draftCard, shadows.sm, pressed && { opacity: 0.9 }]}
          onPress={() => router.push(`/sell/step${currentStep}` as any)}
        >
          <View style={styles.draftIcon}>
            <Text style={{ fontSize: 24 }}>📝</Text>
          </View>
          <View style={styles.draftContent}>
            <Text style={styles.draftTitle}>Continue Draft</Text>
            <Text style={styles.draftDesc}>Resume where you left off — Step {currentStep}/5</Text>
          </View>
          <Text style={styles.draftChevron}>›</Text>
        </Pressable>
      )}

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Why sell on Carvaan?</Text>
        {FEATURES.map((f) => (
          <View key={f.title} style={[styles.featureCard, shadows.sm]}>
            <View style={styles.featureIcon}>
              <Text style={{ fontSize: 24 }}>{f.icon}</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  heroIcon: { fontSize: 48, marginBottom: spacing.md },
  heroTitle: { ...typography.h1, color: colors.text, textAlign: 'center' },
  heroSubtitle: {
    ...typography.body, color: colors.textSecondary,
    textAlign: 'center', marginTop: spacing.sm,
    paddingHorizontal: spacing['2xl'],
  },

  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  stepNum: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  stepLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },

  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  draftIcon: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  draftContent: { flex: 1 },
  draftTitle: { ...typography.label, color: colors.primary },
  draftDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  draftChevron: { fontSize: 22, fontWeight: '300', color: colors.primary },

  featuresSection: { marginTop: spacing.sm },
  featuresTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  featureIcon: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  featureContent: { flex: 1 },
  featureTitle: { ...typography.label, color: colors.text },
  featureDesc: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 2 },
});

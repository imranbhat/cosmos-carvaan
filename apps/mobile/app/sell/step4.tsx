import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepProgress } from '@/components/forms/StepProgress';
import { Button } from '@/components/ui/Button';
import { useSellStore } from '@/stores/sellStore';
import { listingStep4Schema } from '@/lib/validators/listing';
import { formatPrice } from '@/lib/format';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

export default function SellStep4() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSellStore();

  // Simple price estimation heuristic for MVP
  const estimatedPrice = store.year && store.mileage
    ? Math.round(
        (((store.year - 2000) * 2500 + 30000 - store.mileage * 0.1) * (store.condition === 'excellent' ? 1.1 : store.condition === 'good' ? 1.0 : store.condition === 'fair' ? 0.85 : 0.7))
      )
    : null;

  const estimatedMin = estimatedPrice ? Math.round(estimatedPrice * 0.85) : null;
  const estimatedMax = estimatedPrice ? Math.round(estimatedPrice * 1.15) : null;

  const handleNext = () => {
    const result = listingStep4Schema.safeParse({
      price: store.price,
      negotiable: store.negotiable,
    });

    if (!result.success) {
      Alert.alert('Missing Info', result.error.issues[0]?.message ?? 'Please enter a price');
      return;
    }

    store.setStep(5);
    router.push('/sell/step5' as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={4} totalSteps={5} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Set Your Price</Text>

        {/* Price Estimate Card */}
        {estimatedPrice && estimatedPrice > 0 && (
          <View style={[styles.estimateCard, shadows.sm]}>
            <Text style={styles.estimateTitle}>Estimated Market Price</Text>
            <Text style={styles.estimatePrice}>
              {formatPrice(estimatedPrice)}
            </Text>
            <View style={styles.rangeBar}>
              <View style={styles.rangeTrack}>
                <View style={styles.rangeFill} />
              </View>
              <View style={styles.rangeLabels}>
                <Text style={styles.rangeLabel}>
                  {formatPrice(estimatedMin!)}
                </Text>
                <Text style={styles.rangeLabel}>
                  {formatPrice(estimatedMax!)}
                </Text>
              </View>
            </View>
            <Text style={styles.estimateNote}>
              Based on similar vehicles. Use as a guide only.
            </Text>
          </View>
        )}

        {/* Price Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Your Asking Price (₹) *</Text>
          <View style={styles.priceInputRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              style={styles.priceInput}
              value={store.price ? String(store.price) : ''}
              onChangeText={(t) => {
                const num = Number(t.replace(/[^0-9]/g, ''));
                store.updateField('price', num || null);
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Negotiable Toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Price is Negotiable</Text>
            <Text style={styles.toggleDesc}>Buyers can make offers below your asking price</Text>
          </View>
          <Switch
            value={store.negotiable}
            onValueChange={(v) => store.updateField('negotiable', v)}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={store.negotiable ? colors.primary : colors.textTertiary}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          title="Back"
          variant="ghost"
          onPress={() => { store.setStep(3); router.back(); }}
          fullWidth={false}
        />
        <Button title="Review" onPress={handleNext} fullWidth={false} style={styles.nextBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },

  // Estimate
  estimateCard: {
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  estimateTitle: { ...typography.label, color: colors.primary },
  estimatePrice: { ...typography.h1, color: colors.primary, marginTop: spacing.sm },
  rangeBar: { marginTop: spacing.lg },
  rangeTrack: {
    height: 6,
    backgroundColor: colors.primary + '20',
    borderRadius: 3,
  },
  rangeFill: {
    height: '100%',
    width: '60%',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rangeLabel: { ...typography.caption, color: colors.primary },
  estimateNote: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.md },

  // Price Input
  field: { marginBottom: spacing.xl },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  currency: {
    ...typography.label,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.borderLight,
  },
  priceInput: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toggleInfo: { flex: 1, marginRight: spacing.md },
  toggleLabel: { ...typography.label, color: colors.text },
  toggleDesc: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  nextBtn: { paddingHorizontal: spacing['3xl'] },
});

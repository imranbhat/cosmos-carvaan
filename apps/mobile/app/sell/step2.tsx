import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepProgress } from '@/components/forms/StepProgress';
import { Button } from '@/components/ui/Button';
import { useSellStore } from '@/stores/sellStore';
import { listingStep2Schema } from '@/lib/validators/listing';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

const CONDITIONS: { value: 'excellent' | 'good' | 'fair' | 'poor'; label: string; desc: string }[] = [
  { value: 'excellent', label: 'Excellent', desc: 'Like new, minimal wear' },
  { value: 'good', label: 'Good', desc: 'Minor cosmetic issues' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, fully functional' },
  { value: 'poor', label: 'Poor', desc: 'Significant wear or issues' },
];

const CAR_COLORS = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue',
  'Brown', 'Gold', 'Green', 'Beige', 'Orange', 'Maroon',
];

export default function SellStep2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSellStore();

  const handleNext = () => {
    const result = listingStep2Schema.safeParse({
      mileage: store.mileage,
      condition: store.condition,
      color: store.color,
      numOwners: store.numOwners,
      description: store.description || undefined,
    });

    if (!result.success) {
      Alert.alert('Missing Info', result.error.issues[0]?.message ?? 'Please fill required fields');
      return;
    }

    store.setStep(3);
    router.push('/sell/step3' as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={2} totalSteps={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Vehicle Details</Text>

        {/* Mileage */}
        <View style={styles.field}>
          <Text style={styles.label}>Mileage (km) *</Text>
          <TextInput
            style={styles.input}
            value={store.mileage ? String(store.mileage) : ''}
            onChangeText={(t) => store.updateField('mileage', t ? Number(t.replace(/[^0-9]/g, '')) : null)}
            keyboardType="number-pad"
            placeholder="e.g. 45000"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Condition */}
        <View style={styles.field}>
          <Text style={styles.label}>Condition *</Text>
          <View style={styles.conditionGrid}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c.value}
                style={[
                  styles.conditionCard,
                  store.condition === c.value && styles.conditionCardSelected,
                ]}
                onPress={() => store.updateField('condition', c.value)}
              >
                <Text style={[styles.conditionLabel, store.condition === c.value && styles.conditionLabelSelected]}>
                  {c.label}
                </Text>
                <Text style={styles.conditionDesc}>{c.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Color */}
        <View style={styles.field}>
          <Text style={styles.label}>Color *</Text>
          <View style={styles.colorGrid}>
            {CAR_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorChip,
                  store.color === c && styles.colorChipSelected,
                ]}
                onPress={() => store.updateField('color', c)}
              >
                <Text style={[styles.colorText, store.color === c && styles.colorTextSelected]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Number of Owners */}
        <View style={styles.field}>
          <Text style={styles.label}>Number of Owners *</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => store.updateField('numOwners', Math.max(1, store.numOwners - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{store.numOwners}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => store.updateField('numOwners', Math.min(10, store.numOwners + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={store.description}
            onChangeText={(t) => store.updateField('description', t)}
            multiline
            numberOfLines={4}
            maxLength={2000}
            placeholder="Describe any notable features, modifications, or history..."
            placeholderTextColor={colors.textTertiary}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{store.description.length}/2000</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          title="Back"
          variant="ghost"
          onPress={() => { store.setStep(1); router.back(); }}
          fullWidth={false}
        />
        <Button title="Next" onPress={handleNext} fullWidth={false} style={styles.nextBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  field: { marginBottom: spacing.xl },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  textarea: { minHeight: 100 },
  charCount: { ...typography.caption, color: colors.textTertiary, textAlign: 'right', marginTop: 4 },

  // Condition
  conditionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  conditionCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  conditionCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  conditionLabel: { ...typography.label, color: colors.text },
  conditionLabelSelected: { color: colors.primary },
  conditionDesc: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },

  // Color
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorChipSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  colorText: { ...typography.bodySmall, color: colors.text },
  colorTextSelected: { color: colors.primary, fontWeight: '600' },

  // Stepper
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: { ...typography.h3, color: colors.primary },
  stepperValue: { ...typography.h2, color: colors.text, minWidth: 30, textAlign: 'center' },

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

import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/layout/Screen';
import { StepProgress } from '@/components/forms/StepProgress';
import { CascadingSelect } from '@/components/forms/CascadingSelect';
import { Button } from '@/components/ui/Button';
import { useSellStore } from '@/stores/sellStore';
import { useMakes, useModels, useVariants } from '@/hooks/useCarData';
import { listingStep1Schema } from '@/lib/validators/listing';
import { colors, spacing, typography } from '@/constants/theme';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 2 }, (_, i) => ({
  id: String(CURRENT_YEAR + 1 - i),
  name: String(CURRENT_YEAR + 1 - i),
}));

export default function SellStep1() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSellStore();

  const { data: makes = [], isLoading: makesLoading } = useMakes();
  const { data: models = [], isLoading: modelsLoading } = useModels(store.makeId);
  const { data: variants = [], isLoading: variantsLoading } = useVariants(store.modelId);

  const handleNext = () => {
    const result = listingStep1Schema.safeParse({
      makeId: store.makeId,
      modelId: store.modelId,
      variantId: store.variantId ?? undefined,
      year: store.year,
    });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? 'Please fill in all required fields';
      Alert.alert('Missing Info', firstError);
      return;
    }

    store.setStep(2);
    router.push('/sell/step2' as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={1} totalSteps={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Select Your Vehicle</Text>

        <CascadingSelect
          label="Make *"
          options={makes}
          selectedId={store.makeId}
          onSelect={(id) => {
            store.updateField('makeId', id);
            store.updateField('modelId', null);
            store.updateField('variantId', null);
          }}
          isLoading={makesLoading}
          searchable
          placeholder="Select make..."
        />

        <CascadingSelect
          label="Model *"
          options={models}
          selectedId={store.modelId}
          onSelect={(id) => {
            store.updateField('modelId', id);
            store.updateField('variantId', null);
          }}
          isLoading={modelsLoading}
          disabled={!store.makeId}
          searchable
          placeholder="Select model..."
        />

        <CascadingSelect
          label="Year *"
          options={YEARS}
          selectedId={store.year ? String(store.year) : null}
          onSelect={(id) => store.updateField('year', Number(id))}
          placeholder="Select year..."
        />

        <CascadingSelect
          label="Variant (optional)"
          options={variants}
          selectedId={store.variantId}
          onSelect={(id) => store.updateField('variantId', id)}
          isLoading={variantsLoading}
          disabled={!store.modelId}
          placeholder="Select variant..."
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} fullWidth={false} />
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

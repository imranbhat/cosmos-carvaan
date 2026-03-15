import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { useFilterStore, type SortOption } from '@/stores/filterStore';
import { useMakes } from '@/hooks/useCarData';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'truck', 'coupe', 'van'];
const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric'];
const TRANSMISSIONS = ['automatic', 'manual'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'mileage', label: 'Lowest Mileage' },
  { value: 'year', label: 'Newest Year' },
];
const CITIES = ['Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore', 'Pulwama', 'Kupwara', 'Budgam'];

export const FilterSheet = forwardRef<BottomSheet>((_, ref) => {
  const snapPoints = useMemo(() => ['85%'], []);
  const filters = useFilterStore();
  const { data: makes = [] } = useMakes();

  const toggleArrayFilter = useCallback(
    <K extends 'makes' | 'models' | 'bodyTypes' | 'fuelTypes' | 'colors'>(
      key: K,
      value: string
    ) => {
      const arr = filters[key] as string[];
      if (arr.includes(value)) {
        filters.setFilter(key, arr.filter((v) => v !== value) as any);
      } else {
        filters.setFilter(key, [...arr, value] as any);
      }
    },
    [filters]
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.heading}>Filters</Text>

          {/* Sort */}
          <Text style={styles.label}>Sort By</Text>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={filters.sortBy === opt.value}
                onPress={() => filters.setFilter('sortBy', opt.value)}
              />
            ))}
          </View>

          {/* Makes */}
          <Text style={styles.label}>Make</Text>
          <View style={styles.chipRow}>
            {makes.filter((m) => m.is_popular).map((make) => (
              <Chip
                key={make.id}
                label={make.name}
                selected={filters.makes.includes(make.id)}
                onPress={() => toggleArrayFilter('makes', make.id)}
              />
            ))}
          </View>

          {/* Body Type */}
          <Text style={styles.label}>Body Type</Text>
          <View style={styles.chipRow}>
            {BODY_TYPES.map((bt) => (
              <Chip
                key={bt}
                label={bt.charAt(0).toUpperCase() + bt.slice(1)}
                selected={filters.bodyTypes.includes(bt)}
                onPress={() => toggleArrayFilter('bodyTypes', bt)}
              />
            ))}
          </View>

          {/* Fuel Type */}
          <Text style={styles.label}>Fuel Type</Text>
          <View style={styles.chipRow}>
            {FUEL_TYPES.map((ft) => (
              <Chip
                key={ft}
                label={ft.charAt(0).toUpperCase() + ft.slice(1)}
                selected={filters.fuelTypes.includes(ft)}
                onPress={() => toggleArrayFilter('fuelTypes', ft)}
              />
            ))}
          </View>

          {/* Transmission */}
          <Text style={styles.label}>Transmission</Text>
          <View style={styles.chipRow}>
            {TRANSMISSIONS.map((t) => (
              <Chip
                key={t}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                selected={filters.transmission === t}
                onPress={() =>
                  filters.setFilter('transmission', filters.transmission === t ? null : t)
                }
              />
            ))}
          </View>

          {/* City */}
          <Text style={styles.label}>City</Text>
          <View style={styles.chipRow}>
            {CITIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={filters.city === c}
                onPress={() =>
                  filters.setFilter('city', filters.city === c ? null : c)
                }
              />
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Reset All"
              onPress={() => filters.resetFilters()}
              variant="outline"
              fullWidth={false}
              style={{ flex: 1 }}
            />
            <View style={{ width: spacing.sm }} />
            <Button
              title="Apply"
              onPress={() => (ref as any)?.current?.close()}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

FilterSheet.displayName = 'FilterSheet';

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: colors.background },
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  label: { ...typography.label, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: {
    flexDirection: 'row',
    marginTop: spacing['3xl'],
    gap: spacing.sm,
  },
});

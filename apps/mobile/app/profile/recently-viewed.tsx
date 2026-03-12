import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { CarCard } from '@/components/car/CarCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { colors, spacing, typography } from '@/constants/theme';

export default function RecentlyViewedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const viewedIds = useRecentlyViewedStore((s) => s.ids);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['recently-viewed', viewedIds.slice(0, 20)],
    queryFn: async () => {
      if (viewedIds.length === 0) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id, year, mileage, price, price_currency, negotiable, city,
          featured, created_at,
          make:car_makes!make_id(id, name),
          model:car_models!model_id(id, name),
          variant:car_variants!variant_id(fuel_type, transmission),
          photos:listing_photos(url, thumbnail_url, is_primary)
        `)
        .in('id', viewedIds.slice(0, 20))
        .eq('status', 'active');

      if (error) throw error;
      // Reorder to match viewedIds order
      const map = new Map((data ?? []).map((d) => [d.id, d]));
      return viewedIds.map((id) => map.get(id)).filter(Boolean);
    },
    enabled: viewedIds.length > 0,
    staleTime: 30_000,
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Recently Viewed</Text>
      </View>

      {viewedIds.length === 0 ? (
        <EmptyState
          icon="clock"
          title="No recently viewed cars"
          message="Cars you view will appear here"
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => <CarCard listing={item as any} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  backText: { ...typography.label, color: colors.primary },
  title: { ...typography.h2, color: colors.text },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['5xl'] },
});

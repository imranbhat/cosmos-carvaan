import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSavedCarsList } from '@/hooks/useSavedCars';
import { CarCard } from '@/components/car/CarCard';
import { CarCardSkeleton } from '@/components/car/CarCardSkeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { colors, spacing, typography } from '@/constants/theme';

export default function SavedCarsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: listings = [], isLoading, refetch, isRefetching } = useSavedCarsList();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Saved Cars</Text>
        <Text style={styles.count}>{listings.length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {[0, 1, 2].map((i) => <CarCardSkeleton key={i} />)}
        </View>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No saved cars"
          message="Browse listings and tap the heart to save cars you like"
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => <CarCard listing={item as any} />}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
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
  title: { ...typography.h2, color: colors.text, flex: 1 },
  count: { ...typography.label, color: colors.textTertiary },
  skeletons: { paddingHorizontal: spacing.lg, gap: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['5xl'] },
});

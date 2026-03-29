import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useSavedSearches,
  useToggleSavedSearchNotify,
  useDeleteSavedSearch,
  type SavedSearch,
} from '@/hooks/useSavedSearches';
import { useFilterStore } from '@/stores/filterStore';
import { EmptyState } from '@/components/layout/EmptyState';
import { formatPrice } from '@/lib/format';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

function buildFilterSummary(filters: Record<string, any>): string {
  const parts: string[] = [];

  if (filters.makes?.length) {
    parts.push(filters.makes.join(', '));
  }
  if (filters.models?.length) {
    parts.push(filters.models.join(', '));
  }
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    if (min > 0 || max < 1_000_000) {
      parts.push(`${formatPrice(min)} - ${formatPrice(max)}`);
    }
  }
  if (filters.yearRange) {
    const [min, max] = filters.yearRange;
    if (min > 2000 || max < new Date().getFullYear() + 1) {
      parts.push(`${min} - ${max}`);
    }
  }
  if (filters.fuelTypes?.length) {
    parts.push(filters.fuelTypes.join(', '));
  }
  if (filters.transmission) {
    parts.push(filters.transmission);
  }
  if (filters.city) {
    parts.push(filters.city);
  }
  if (filters.bodyTypes?.length) {
    parts.push(filters.bodyTypes.join(', '));
  }

  return parts.length > 0 ? parts.join(' · ') : 'All cars';
}

export default function SavedSearchesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setFilter = useFilterStore((s) => s.setFilter);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const { data: searches = [], isLoading, refetch, isRefetching } = useSavedSearches();
  const { mutate: toggleNotify } = useToggleSavedSearchNotify();
  const { mutate: deleteSearch } = useDeleteSavedSearch();

  const handleApplyFilters = (filters: Record<string, any>) => {
    resetFilters();
    const filterKeys = [
      'makes', 'models', 'yearRange', 'priceRange', 'mileageRange',
      'bodyTypes', 'fuelTypes', 'transmission', 'colors', 'city',
      'numOwners', 'inspectionStatus', 'sortBy', 'query',
    ] as const;

    for (const key of filterKeys) {
      if (filters[key] !== undefined) {
        setFilter(key, filters[key]);
      }
    }

    router.push('/(tabs)/search' as any);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Saved Search', 'Are you sure you want to remove this saved search?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSearch(id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedSearch }) => {
    const summary = buildFilterSummary(item.filters);

    return (
      <Pressable
        style={[styles.card, shadows.sm]}
        onPress={() => handleApplyFilters(item.filters)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name ?? 'Saved Search'}
            </Text>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
              <Text style={styles.deleteText}>Remove</Text>
            </Pressable>
          </View>

          <Text style={styles.filterSummary} numberOfLines={2}>
            {summary}
          </Text>

          <View style={styles.notifyRow}>
            <Text style={styles.notifyLabel}>Notifications</Text>
            <Switch
              value={item.notify}
              onValueChange={(value) => toggleNotify({ id: item.id, notify: value })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={item.notify ? colors.primary : colors.textTertiary}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Saved Searches</Text>
        <Text style={styles.count}>{searches.length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : searches.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title="No Saved Searches"
          message="Save a search from the search screen to get notified about new matches"
        />
      ) : (
        <FlatList
          data={searches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.textTertiary },

  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['5xl'] },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardContent: { padding: spacing.lg },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardName: { ...typography.label, color: colors.text, flex: 1, marginRight: spacing.sm },
  deleteText: { ...typography.bodySmall, color: colors.error },

  filterSummary: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  notifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  notifyLabel: { ...typography.bodySmall, color: colors.textTertiary },
});

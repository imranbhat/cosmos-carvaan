import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { CarCard } from '@/components/car/CarCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { MOCK_LISTINGS, shouldUseMockData } from '@/lib/mockData';
import { useListingsInfinite } from '@/hooks/useListings';
import { useFilterStore, type SortOption } from '@/stores/filterStore';
import { Analytics, Events } from '@/lib/analytics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Filter chip data
// ---------------------------------------------------------------------------

const BODY_TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'SUV', label: 'SUV' },
  { key: 'Sedan', label: 'Sedan' },
  { key: 'Hatchback', label: 'Hatchback' },
  { key: 'Truck', label: 'Truck' },
  { key: 'Coupe', label: 'Coupe' },
  { key: 'Van', label: 'Van' },
] as const;

const FUEL_TYPE_FILTERS = [
  { key: 'all', label: 'All Fuel' },
  { key: 'Petrol', label: 'Petrol' },
  { key: 'Diesel', label: 'Diesel' },
  { key: 'Electric', label: 'Electric' },
  { key: 'Hybrid', label: 'Hybrid' },
  { key: 'CNG', label: 'CNG' },
] as const;

const TRANSMISSION_FILTERS = [
  { key: 'all', label: 'Any Trans.' },
  { key: 'Manual', label: 'Manual' },
  { key: 'Automatic', label: 'Automatic' },
] as const;

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price \u2191' },
  { key: 'price_desc', label: 'Price \u2193' },
];

// ---------------------------------------------------------------------------
// Skeleton placeholder
// ---------------------------------------------------------------------------

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderLight, colors.shimmer],
  });

  return (
    <View style={skeletonStyles.card}>
      <Animated.View style={[skeletonStyles.image, { backgroundColor: bg }]} />
      <View style={skeletonStyles.body}>
        <Animated.View style={[skeletonStyles.lineWide, { backgroundColor: bg }]} />
        <Animated.View style={[skeletonStyles.lineMedium, { backgroundColor: bg }]} />
        <Animated.View style={[skeletonStyles.lineNarrow, { backgroundColor: bg }]} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: colors.borderLight,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lineWide: {
    height: 20,
    borderRadius: borderRadius.sm,
    width: '60%',
  },
  lineMedium: {
    height: 14,
    borderRadius: borderRadius.sm,
    width: '80%',
  },
  lineNarrow: {
    height: 14,
    borderRadius: borderRadius.sm,
    width: '40%',
  },
});

// ---------------------------------------------------------------------------
// Main search screen
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 400;

export default function SearchScreen() {
  // ---- Local UI state (text input before debounce) ----
  const [searchText, setSearchText] = useState('');

  // ---- Zustand filter store (persisted) ----
  const bodyTypes = useFilterStore((s) => s.bodyTypes);
  const fuelTypes = useFilterStore((s) => s.fuelTypes);
  const transmission = useFilterStore((s) => s.transmission);
  const sortBy = useFilterStore((s) => s.sortBy);
  const query = useFilterStore((s) => s.query);
  const setFilter = useFilterStore((s) => s.setFilter);

  // Derive active single-select values for the chip rows
  const activeBodyType = bodyTypes.length === 1 ? bodyTypes[0] : 'all';
  const activeFuelType = fuelTypes.length === 1 ? fuelTypes[0] : 'all';
  const activeTransmission = transmission ?? 'all';

  // ---- Debounced search ----
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = searchText.trim();
      setFilter('query', trimmed.length > 0 ? trimmed : null);
      if (trimmed.length > 0) {
        Analytics.track(Events.SEARCH_PERFORMED, { query: trimmed });
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchText, setFilter]);

  // ---- Build filters object for the hook ----
  const filters = useMemo(
    () => ({
      bodyTypes,
      fuelTypes,
      transmission,
      sortBy,
      query,
    }),
    [bodyTypes, fuelTypes, transmission, sortBy, query],
  );

  // ---- React Query infinite query ----
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useListingsInfinite(filters);

  // Flatten pages into a single array
  const allListings = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data],
  );

  // ---- Mock data fallback (fresh/empty database) ----
  const useMock = shouldUseMockData(allListings) && !isLoading;
  const listings = useMock ? MOCK_LISTINGS : allListings;

  // ---- Total count ----
  const totalCount = listings.length;

  // ---- Filter handlers ----
  const handleBodyType = useCallback(
    (key: string) => {
      if (key === 'all') {
        setFilter('bodyTypes', []);
      } else {
        setFilter('bodyTypes', [key]);
      }
    },
    [setFilter],
  );

  const handleFuelType = useCallback(
    (key: string) => {
      if (key === 'all') {
        setFilter('fuelTypes', []);
      } else {
        setFilter('fuelTypes', [key]);
      }
    },
    [setFilter],
  );

  const handleTransmission = useCallback(
    (key: string) => {
      if (key === 'all') {
        setFilter('transmission', null);
      } else {
        setFilter('transmission', key);
      }
    },
    [setFilter],
  );

  const handleSort = useCallback(
    (key: SortOption) => {
      setFilter('sortBy', key);
    },
    [setFilter],
  );

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setFilter('query', null);
  }, [setFilter]);

  // ---- Infinite scroll trigger ----
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !useMock) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, useMock]);

  // ---- Pull-to-refresh ----
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // ---- Render helpers ----
  const renderItem = useCallback(
    ({ item }: { item: (typeof listings)[number] }) => (
      <CarCard listing={item as any} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: (typeof listings)[number]) => item.id,
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  // ---- Main render ----
  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.searchSection}>
        <Text style={styles.title}>Search</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClearSearch}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Body type filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
          style={styles.chipScroll}
        >
          {BODY_TYPE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => handleBodyType(f.key)}
              style={[styles.pill, activeBodyType === f.key && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  activeBodyType === f.key && styles.pillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Fuel type filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
          style={styles.chipScroll}
        >
          {FUEL_TYPE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => handleFuelType(f.key)}
              style={[
                styles.pill,
                styles.pillSecondary,
                activeFuelType === f.key && styles.pillSecondaryActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  activeFuelType === f.key && styles.pillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}

          <View style={styles.chipDivider} />

          {TRANSMISSION_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => handleTransmission(f.key)}
              style={[
                styles.pill,
                styles.pillSecondary,
                activeTransmission === f.key && styles.pillSecondaryActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  activeTransmission === f.key && styles.pillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Sort + result count row */}
        <View style={styles.sortRow}>
          <Text style={styles.resultCount}>
            {isLoading
              ? 'Searching...'
              : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
            {useMock && !isLoading ? ' (sample data)' : ''}
          </Text>
          <View style={styles.sortPills}>
            {SORT_OPTIONS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => handleSort(s.key)}
                style={[
                  styles.sortPill,
                  sortBy === s.key && styles.sortPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortText,
                    sortBy === s.key && styles.sortTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* --- Content area --- */}
      {isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <EmptyState
          icon="exclamationmark.triangle"
          title="Something went wrong"
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load listings. Pull down to retry.'
          }
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title="No cars found"
          message="Try adjusting your filters or search terms"
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: spacing.xs,
  },

  // Horizontal chip scrolls
  chipScroll: {
    marginBottom: spacing.sm,
    marginHorizontal: -spacing.xl, // bleed to edge
  },
  chipScrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xs,
  },

  // Pills (primary row - body types)
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },

  // Secondary pills (fuel type + transmission)
  pillSecondary: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  pillSecondaryActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sortPills: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sortPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sortPillActive: {
    backgroundColor: colors.primaryMuted,
  },
  sortText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  sortTextActive: {
    color: colors.primary,
  },

  // Result count
  resultCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // List
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
    gap: spacing.md,
  },

  // Footer loader
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { CarCard } from '@/components/car/CarCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { MOCK_LISTINGS } from '@/lib/mockData';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const BODY_TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'SUV', label: 'SUV' },
  { key: 'Sedan', label: 'Sedan' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeBodyType, setActiveBodyType] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');

  const listings = useMemo(() => {
    let filtered = [...MOCK_LISTINGS];

    // Filter by search text
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter((l) => {
        const text = `${l.make.name} ${l.model.name} ${l.variant.name} ${l.city}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Filter by body type
    if (activeBodyType !== 'all') {
      filtered = filtered.filter(
        (l) => l.model.body_type.toLowerCase() === activeBodyType.toLowerCase()
      );
    }

    // Sort
    if (activeSort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [searchText, activeBodyType, activeSort]);

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
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Body type filter pills */}
        <View style={styles.pillRow}>
          {BODY_TYPE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setActiveBodyType(f.key)}
              style={[styles.pill, activeBodyType === f.key && styles.pillActive]}
            >
              <Text style={[styles.pillText, activeBodyType === f.key && styles.pillTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}

          <View style={{ flex: 1 }} />

          {/* Sort pills */}
          {SORT_OPTIONS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setActiveSort(s.key)}
              style={[styles.sortPill, activeSort === s.key && styles.sortPillActive]}
            >
              <Text style={[styles.sortText, activeSort === s.key && styles.sortTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.resultCount}>
        {listings.length} result{listings.length !== 1 ? 's' : ''}
      </Text>

      {listings.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title="No cars found"
          message="Try adjusting your filters or search terms"
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CarCard listing={item as any} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
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
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
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
  resultCount: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
    gap: spacing.md,
  },
});

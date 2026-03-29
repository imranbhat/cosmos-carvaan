import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/layout/EmptyState';
import { CarCard } from '@/components/car/CarCard';
import { CarCardSkeleton } from '@/components/car/CarCardSkeleton';
import { useAuthStore } from '@/stores/authStore';
import { useFeaturedListings, useListingsInfinite } from '@/hooks/useListings';
import { MOCK_LISTINGS, MOCK_FEATURED, shouldUseMockData } from '@/lib/mockData';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

/* ── Quick Category Pills ──────────────────────── */
const CATEGORIES = [
  { label: 'SUV', emoji: '🚙' },
  { label: 'Sedan', emoji: '🚗' },
  { label: 'Sports', emoji: '🏎️' },
  { label: 'Luxury', emoji: '💎' },
  { label: 'Electric', emoji: '⚡' },
  { label: 'Budget', emoji: '💰' },
];

function CategoryPills() {
  const router = useRouter();
  return (
    <View style={styles.pillsRow}>
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat.label}
          style={({ pressed }) => [styles.pill, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/(tabs)/search' as any)}
        >
          <Text style={styles.pillEmoji}>{cat.emoji}</Text>
          <Text style={styles.pillLabel}>{cat.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ── Featured Carousel ─────────────────────────── */
function FeaturedSection() {
  const { data: featured = [], isLoading } = useFeaturedListings();
  const displayData = shouldUseMockData(featured) ? MOCK_FEATURED : featured;

  if (isLoading && !shouldUseMockData(featured)) return null;
  if (displayData.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Cars</Text>
        <Pressable>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <FlatList
        data={displayData as any[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CarCard listing={item as any} horizontal />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xl }}
        snapToInterval={300 + spacing.md}
        decelerationRate="fast"
      />
    </View>
  );
}

/* ── Hero Banner ───────────────────────────────── */
function HeroBanner() {
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <View style={styles.hero}>
      <View style={styles.heroContent}>
        <Text style={styles.heroWelcome}>Hello, {firstName} 👋</Text>
        <Text style={styles.heroTitle}>Find your perfect{'\n'}car today</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.searchBar, pressed && { opacity: 0.9 }]}
        onPress={() => router.push('/(tabs)/search' as any)}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search make, model, or keyword...</Text>
      </Pressable>
    </View>
  );
}

/* ── Stats Row ─────────────────────────────────── */
function StatsRow() {
  return (
    <View style={styles.statsRow}>
      {[
        { value: '2,500+', label: 'Cars Listed' },
        { value: '150+', label: 'Verified Sellers' },
        { value: '98%', label: 'Satisfaction' },
      ].map((stat) => (
        <View key={stat.label} style={styles.statItem}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ── Main Screen ───────────────────────────────── */
export default function HomeScreen() {
  const {
    data, isLoading, isRefetching, fetchNextPage,
    hasNextPage, isFetchingNextPage, refetch,
  } = useListingsInfinite({ sortBy: 'newest' });

  const listings = data?.pages.flat() ?? [];
  const displayListings = shouldUseMockData(listings) ? MOCK_LISTINGS : listings;

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={displayListings as any[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <CarCard listing={item as any} />
          </View>
        )}
        ListHeaderComponent={
          <>
            <HeroBanner />
            <CategoryPills />
            <FeaturedSection />
            <StatsRow />
            <View style={styles.sectionHeader2}>
              <Text style={styles.sectionTitle}>Recently Added</Text>
              <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingHorizontal: spacing.xl }}>
              {[1, 2].map((i) => <CarCardSkeleton key={i} />)}
            </View>
          ) : (
            <EmptyState title="No cars yet" message="Be the first to list a car on Carvaan" />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingHorizontal: spacing.xl }}><CarCardSkeleton /></View>
          ) : <View style={{ height: spacing['5xl'] }} />
        }
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  heroContent: { marginBottom: spacing.xl },
  heroWelcome: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  heroTitle: { ...typography.hero, color: colors.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
    gap: spacing.md,
  },
  searchIcon: { fontSize: 18 },
  searchPlaceholder: { ...typography.body, color: colors.textTertiary, flex: 1 },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  pillEmoji: { fontSize: 16 },
  pillLabel: { ...typography.caption, color: colors.text, fontWeight: '600' },
  section: { marginBottom: spacing['2xl'] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeader2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: { ...typography.h3, color: colors.text },
  seeAll: { ...typography.label, color: colors.primary },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3,
  },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});

import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyListings, useUpdateListingStatus } from '@/hooks/useMyListings';
import { ListingStatusBadge } from '@/components/car/ListingStatusBadge';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

const TABS = ['all', 'active', 'pending', 'sold', 'rejected'] as const;

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('all');

  const { data: listings = [], isLoading, refetch } = useMyListings(activeTab);
  const { mutate: updateStatus } = useUpdateListingStatus();

  const handleMarkSold = (id: string) => {
    Alert.alert('Mark as Sold', 'Are you sure this car has been sold?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Sold',
        onPress: () => updateStatus({ id, status: 'sold' }),
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Listing', 'This will remove your listing. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => updateStatus({ id, status: 'expired' }),
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My Listings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Listings */}
      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="car"
          title="No Listings"
          message={activeTab === 'all' ? "You haven't listed any cars yet" : `No ${activeTab} listings`}
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item: any) => item.id}
          refreshing={false}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: any }) => {
            const photo = item.photos?.find((p: any) => p.is_primary) ?? item.photos?.[0];
            const carTitle = `${item.year} ${item.make?.name ?? ''} ${item.model?.name ?? ''}`;

            return (
              <Pressable
                style={[styles.card, shadows.sm]}
                onPress={() => router.push(`/car/${item.id}` as any)}
              >
                <Image
                  source={{ uri: photo?.thumbnail_url ?? photo?.url }}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <View style={styles.cardInfo}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{carTitle}</Text>
                    <ListingStatusBadge status={item.status} />
                  </View>
                  <Text style={styles.cardPrice}>{formatPrice(item.price, item.price_currency)}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>{item.views_count ?? 0} views</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>{item.saves_count ?? 0} saves</Text>
                  </View>
                  {item.status === 'active' && (
                    <View style={styles.cardActions}>
                      <Button
                        title="Mark Sold"
                        variant="outline"
                        onPress={() => handleMarkSold(item.id)}
                        fullWidth={false}
                        style={styles.actionBtn}
                      />
                      <Button
                        title="Delete"
                        variant="ghost"
                        onPress={() => handleDelete(item.id)}
                        fullWidth={false}
                        style={styles.actionBtn}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
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

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { ...typography.bodySmall, color: colors.text },
  tabTextActive: { color: '#fff', fontWeight: '600' },

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
  cardImage: { width: '100%', height: 160 },
  cardInfo: { padding: spacing.md },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: { ...typography.label, color: colors.text, flex: 1, marginRight: spacing.sm },
  cardPrice: { ...typography.price, color: colors.primary },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: { ...typography.caption, color: colors.textTertiary },
  metaDot: { ...typography.caption, color: colors.textTertiary, marginHorizontal: spacing.xs },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: { paddingVertical: spacing.sm },
});

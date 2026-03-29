import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListing, useSimilarListings } from '@/hooks/useListings';
import { SaveButton } from '@/components/car/SaveButton';
import { CarCard } from '@/components/car/CarCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatMileage, timeAgo } from '@/lib/format';
import { getOrCreateConversation } from '@/hooks/useSendMessage';
import { useAuthStore } from '@/stores/authStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { Analytics, Events } from '@/lib/analytics';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.session?.user?.id);
  const [activePhoto, setActivePhoto] = useState(0);
  const galleryRef = useRef<FlatList>(null);

  const addViewed = useRecentlyViewedStore((s) => s.addViewed);
  const { data: listing, isLoading, error } = useListing(id!);

  useEffect(() => {
    if (id) addViewed(id);
  }, [id, addViewed]);

  useEffect(() => {
    Analytics.screen('CarDetail', { listingId: id });
    Analytics.track(Events.LISTING_VIEWED, { listingId: id });
  }, [id]);

  const {
    data: similarListings = [],
  } = useSimilarListings(
    id!,
    listing?.make?.id ?? '',
    listing?.price ?? 0
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems[0]?.index != null) {
        setActivePhoto(viewableItems[0].index);
      }
    },
    []
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Listing not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const sortedPhotos = [...(listing.photos ?? [])].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );
  const title = `${listing.year} ${listing.make?.name ?? ''} ${listing.model?.name ?? ''}`;
  const variantName = listing.variant?.name;

  const specs: { label: string; value: string }[] = [
    { label: 'Year', value: String(listing.year) },
    { label: 'Mileage', value: formatMileage(listing.mileage) },
    { label: 'Fuel', value: listing.variant?.fuel_type ?? '—' },
    { label: 'Transmission', value: listing.variant?.transmission ?? '—' },
    { label: 'Body Type', value: listing.model?.body_type ?? '—' },
    { label: 'Engine', value: listing.variant?.engine_cc ? `${listing.variant.engine_cc}cc` : '—' },
    { label: 'Color', value: listing.color ?? '—' },
    { label: 'Condition', value: listing.condition ?? '—' },
    { label: 'Owners', value: listing.num_owners ? String(listing.num_owners) : '—' },
  ];

  const sellerInitial = listing.seller?.full_name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Gallery */}
        <View style={styles.gallery}>
          <FlatList
            ref={galleryRef}
            data={sortedPhotos}
            keyExtractor={(p: any) => p.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item }: { item: any }) => (
              <Image
                source={{ uri: item.url }}
                style={styles.galleryImage}
                contentFit="cover"
                transition={200}
              />
            )}
          />

          {/* Back Button */}
          <Pressable
            style={[styles.backBtn, { top: insets.top + spacing.sm }]}
            onPress={() => router.back()}
          >
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor={colors.text}
              size={20}
            />
          </Pressable>

          {/* Save Button */}
          <View style={[styles.gallSaveBtn, { top: insets.top + spacing.sm }]}>
            <SaveButton listingId={listing.id} size={22} />
          </View>

          {/* Photo Indicator */}
          {sortedPhotos.length > 1 && (
            <View style={styles.indicator}>
              <Text style={styles.indicatorText}>
                {activePhoto + 1}/{sortedPhotos.length}
              </Text>
            </View>
          )}
        </View>

        {/* Price & Title */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(listing.price, listing.price_currency)}
            </Text>
            {listing.negotiable && (
              <Badge label="Negotiable" variant="muted" style={{ marginLeft: spacing.sm }} />
            )}
          </View>
          {listing.original_price && listing.original_price > listing.price && (
            <View style={styles.priceDropRow}>
              <Text style={styles.originalPrice}>
                {formatPrice(listing.original_price, listing.price_currency)}
              </Text>
              <Badge label="Price Drop" variant="success" style={{ marginLeft: spacing.sm }} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {variantName && <Text style={styles.variant}>{variantName}</Text>}
          <Text style={styles.location}>{listing.city} · {timeAgo(listing.created_at)}</Text>
        </View>

        {/* Specs Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {specs.map((spec) => (
              <View key={spec.label} style={styles.specCell}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {listing.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        ) : null}

        {/* Inspection Status */}
        {listing.inspection_status && listing.inspection_status !== 'not_inspected' && (
          <View style={styles.section}>
            <View style={styles.inspectionRow}>
              <SymbolView
                name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
                tintColor={colors.success}
                size={20}
              />
              <Text style={styles.inspectionText}>
                {listing.inspection_status === 'passed' ? 'Inspection Passed' : 'Inspection In Progress'}
              </Text>
            </View>
          </View>
        )}

        {/* Seller Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={[styles.sellerCard, shadows.sm]}>
            <View style={styles.sellerAvatar}>
              {listing.seller?.avatar_url ? (
                <Image
                  source={{ uri: listing.seller.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarInitial}>{sellerInitial}</Text>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.seller?.full_name ?? 'Seller'}</Text>
              {listing.seller?.rating_avg ? (
                <View style={styles.ratingRow}>
                  <SymbolView
                    name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                    tintColor={colors.accent}
                    size={14}
                  />
                  <Text style={styles.ratingText}>
                    {listing.seller.rating_avg.toFixed(1)}
                    {listing.seller.rating_count ? ` (${listing.seller.rating_count})` : ''}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.sellerLocation}>{listing.seller?.city ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* Similar Cars */}
        {similarListings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Cars</Text>
            <FlatList
              data={similarListings}
              keyExtractor={(item: any) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }: { item: any }) => (
                <CarCard listing={item} horizontal />
              )}
              contentContainerStyle={{ gap: spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          title="Chat with Seller"
          onPress={async () => {
            if (!userId || !listing?.seller?.id) return;
            try {
              const convId = await getOrCreateConversation(listing.id, userId, listing.seller.id);
              router.push(`/chat/${convId}` as any);
            } catch {}
          }}
          style={{ flex: 1 }}
          fullWidth={false}
        />
        <Button
          title="Call"
          onPress={() => {
            const phone = listing?.seller?.phone;
            if (!phone) {
              Alert.alert('Phone unavailable', 'This seller has not shared a phone number.');
              return;
            }
            Linking.openURL(`tel:${phone}`);
          }}
          variant="outline"
          fullWidth={false}
          style={{ flex: 0.4, marginLeft: spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  errorText: { ...typography.body, color: colors.textSecondary },

  // Gallery
  gallery: { position: 'relative', backgroundColor: colors.border },
  galleryImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.65 },
  backBtn: {
    position: 'absolute',
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gallSaveBtn: {
    position: 'absolute',
    right: spacing.md,
  },
  indicator: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  indicatorText: { ...typography.caption, color: '#fff', fontWeight: '600' },

  // Content sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Price & title
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { ...typography.h1, color: colors.primary },
  priceDropRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  originalPrice: {
    ...typography.body,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  title: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  variant: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  location: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },

  // Specs grid
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  specCell: {
    width: '33.33%',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.borderLight,
  },
  specLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: 2 },
  specValue: { ...typography.label, color: colors.text, textTransform: 'capitalize' },

  // Description
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },

  // Inspection
  inspectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inspectionText: { ...typography.label, color: colors.success },

  // Seller
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 48, height: 48 },
  avatarInitial: { ...typography.h3, color: colors.primary },
  sellerInfo: { marginLeft: spacing.md, flex: 1 },
  sellerName: { ...typography.label, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...typography.caption, color: colors.textSecondary },
  sellerLocation: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
});

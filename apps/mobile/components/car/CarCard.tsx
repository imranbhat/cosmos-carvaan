import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CarImage } from '@/components/ui/CarImage';
import { SaveButton } from './SaveButton';
import { formatPrice, formatMileage } from '@/lib/format';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

interface CarCardProps {
  listing: {
    id: string;
    year: number;
    mileage: number;
    price: number;
    price_currency?: string;
    negotiable?: boolean;
    city: string;
    featured?: boolean;
    original_price?: number | null;
    make: { name: string } | null;
    model: { name: string } | null;
    variant?: { fuel_type?: string; transmission?: string } | null;
    photos: { url: string; thumbnail_url?: string; is_primary?: boolean }[];
  };
  horizontal?: boolean;
}

export function CarCard({ listing, horizontal = false }: CarCardProps) {
  const router = useRouter();
  const primaryPhoto = listing.photos?.find((p) => p.is_primary) ?? listing.photos?.[0];
  const imageUrl = primaryPhoto?.thumbnail_url ?? primaryPhoto?.url;
  const title = `${listing.year} ${listing.make?.name ?? ''} ${listing.model?.name ?? ''}`.trim();

  const specs = [
    formatMileage(listing.mileage),
    listing.variant?.fuel_type,
    listing.variant?.transmission,
  ].filter(Boolean);

  const hasPriceDrop = listing.original_price && listing.original_price > listing.price;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        horizontal && styles.cardHorizontal,
        shadows.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/car/${listing.id}` as any)}
    >
      {/* Image */}
      <View style={[styles.imageWrapper, horizontal && styles.imageHorizontal]}>
        <CarImage uri={imageUrl} style={styles.image} />

        {/* Gradient overlay at bottom of image */}
        <View style={styles.imageGradient} />

        {/* Save button */}
        <View style={styles.saveBtn}>
          <SaveButton listingId={listing.id} size={20} />
        </View>

        {/* Badges */}
        {listing.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}

        {hasPriceDrop && (
          <View style={styles.priceDropBadge}>
            <Text style={styles.priceDropText}>PRICE DROP</Text>
          </View>
        )}

        {/* Photo count */}
        {listing.photos?.length > 1 && (
          <View style={styles.photoCount}>
            <Text style={styles.photoCountText}>{listing.photos.length}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.priceRow}>
          <Text style={[horizontal ? styles.priceSmall : styles.price]}>
            {formatPrice(listing.price, listing.price_currency)}
          </Text>
          {listing.negotiable && (
            <View style={styles.negotiableBadge}>
              <Text style={styles.negotiableText}>Negotiable</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, horizontal && styles.titleSmall]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.specsRow}>
          {specs.map((spec, i) => (
            <View key={i} style={styles.specChip}>
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.city}>{listing.city}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = 300;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  cardHorizontal: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
    marginBottom: 0,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: colors.borderLight,
  },
  imageHorizontal: {
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    // CSS gradient fallback for web
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.15))',
  } as any,
  saveBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  priceDropBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  priceDropText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  photoCount: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    padding: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    ...typography.price,
    color: colors.text,
  },
  priceSmall: {
    ...typography.priceSmall,
    color: colors.text,
  },
  negotiableBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  negotiableText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  titleSmall: {
    fontSize: 13,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  specChip: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  specText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  city: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

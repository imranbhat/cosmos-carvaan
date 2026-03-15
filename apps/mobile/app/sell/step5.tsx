import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepProgress } from '@/components/forms/StepProgress';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSellStore } from '@/stores/sellStore';
import { useMakes, useModels, useVariants } from '@/hooks/useCarData';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

export default function SellStep5() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSellStore();
  const { session } = useAuthStore();
  const { uploadAllPhotos, uploading } = usePhotoUpload();
  const [submitting, setSubmitting] = useState(false);

  const { data: makes = [] } = useMakes();
  const { data: models = [] } = useModels(store.makeId);
  const { data: variants = [] } = useVariants(store.modelId);

  const makeName = makes.find((m) => m.id === store.makeId)?.name ?? '—';
  const modelName = models.find((m) => m.id === store.modelId)?.name ?? '—';
  const variantName = variants.find((v) => v.id === store.variantId)?.name;

  const title = `${store.year ?? ''} ${makeName} ${modelName}`;
  const primaryPhoto = store.photos[0];

  const goToStep = (step: number) => {
    store.setStep(step);
    router.push(`/sell/step${step}` as any);
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'Please sign in to create a listing');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Generate a draft ID for photo paths
      const draftId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // 2. Upload photos
      const uploadedPhotos = await uploadAllPhotos(store.photos, draftId);

      // 3. Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: session.user.id,
          make_id: store.makeId!,
          model_id: store.modelId!,
          variant_id: store.variantId,
          year: store.year!,
          mileage: store.mileage!,
          condition: store.condition!,
          color: store.color,
          num_owners: store.numOwners,
          description: store.description || null,
          price: store.price!,
          price_currency: 'INR',
          negotiable: store.negotiable,
          city: store.city ?? 'Srinagar',
          status: 'pending_review',
        })
        .select('id')
        .single();

      if (listingError) throw listingError;

      // 4. Create photo records
      const photoRows = uploadedPhotos.map((p, i) => ({
        listing_id: listing.id,
        url: p.remoteUrl!,
        thumbnail_url: p.remoteUrl!,
        position: p.position,
        is_primary: i === 0,
      }));

      const { error: photoError } = await supabase
        .from('listing_photos')
        .insert(photoRows);

      if (photoError) throw photoError;

      // 5. Reset store and show success
      store.reset();

      Alert.alert(
        'Listing Submitted!',
        'Your listing is under review and will be live shortly.',
        [
          { text: 'View Listing', onPress: () => router.replace(`/car/${listing.id}` as any) },
          { text: 'Back to Home', onPress: () => router.replace('/(tabs)' as any) },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to submit listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={5} totalSteps={5} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Review Your Listing</Text>

        {/* Photo Preview */}
        {primaryPhoto && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: primaryPhoto.uri }} style={styles.heroImage} contentFit="cover" />
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>{store.photos.length} photos</Text>
            </View>
            <Pressable style={styles.editBtn} onPress={() => goToStep(3)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          </View>
        )}

        {/* Vehicle Info */}
        <View style={[styles.section, shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Pressable onPress={() => goToStep(1)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
          <Text style={styles.carTitle}>{title}</Text>
          {variantName && <Text style={styles.variant}>{variantName}</Text>}
        </View>

        {/* Details */}
        <View style={[styles.section, shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Pressable onPress={() => goToStep(2)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.detailGrid}>
            <DetailRow label="Mileage" value={store.mileage ? `${store.mileage.toLocaleString()} km` : '—'} />
            <DetailRow label="Condition" value={store.condition ?? '—'} />
            <DetailRow label="Color" value={store.color ?? '—'} />
            <DetailRow label="Owners" value={String(store.numOwners)} />
          </View>
          {store.description ? (
            <Text style={styles.description} numberOfLines={3}>{store.description}</Text>
          ) : null}
        </View>

        {/* Pricing */}
        <View style={[styles.section, shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <Pressable onPress={() => goToStep(4)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
          <Text style={styles.price}>{formatPrice(store.price ?? 0)}</Text>
          {store.negotiable && <Badge label="Negotiable" variant="muted" />}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          title="Back"
          variant="ghost"
          onPress={() => { store.setStep(4); router.back(); }}
          fullWidth={false}
        />
        <Button
          title={submitting || uploading ? 'Submitting...' : 'Submit Listing'}
          onPress={handleSubmit}
          loading={submitting || uploading}
          fullWidth={false}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '500', textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },

  // Photo
  photoPreview: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  heroImage: { width: '100%', height: 200 },
  photoCount: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  photoCountText: { ...typography.caption, color: '#fff' },
  editBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  editBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  // Sections
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.label, color: colors.textSecondary },
  editLink: { ...typography.label, color: colors.primary },
  carTitle: { ...typography.h3, color: colors.text },
  variant: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  detailGrid: {},
  description: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.md },
  price: { ...typography.h1, color: colors.primary },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  submitBtn: { paddingHorizontal: spacing['3xl'] },
});

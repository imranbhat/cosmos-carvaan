import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { StepProgress } from '@/components/forms/StepProgress';
import { Button } from '@/components/ui/Button';
import { useSellStore, type PhotoSlot } from '@/stores/sellStore';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

const REQUIRED_SLOTS = [
  { position: 0, label: 'Front' },
  { position: 1, label: 'Back' },
  { position: 2, label: 'Left Side' },
  { position: 3, label: 'Right Side' },
  { position: 4, label: 'Interior' },
  { position: 5, label: 'Dashboard' },
];

const MAX_PHOTOS = 20;

export default function SellStep3() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSellStore();
  const { pickImage, takePhoto, progress } = usePhotoUpload();

  const photos = store.photos;
  const optionalCount = photos.filter((p) => p.position >= REQUIRED_SLOTS.length).length;

  const addPhoto = async (position: number, label: string, method: 'camera' | 'gallery') => {
    const uri = method === 'camera' ? await takePhoto() : await pickImage();
    if (!uri) return;

    const newSlot: PhotoSlot = { uri, position, label, uploaded: false };
    const updated = [...photos.filter((p) => p.position !== position), newSlot].sort(
      (a, b) => a.position - b.position
    );
    store.setPhotos(updated);
  };

  const removePhoto = (position: number) => {
    store.setPhotos(photos.filter((p) => p.position !== position));
  };

  const showPicker = (position: number, label: string) => {
    Alert.alert('Add Photo', `${label}`, [
      { text: 'Camera', onPress: () => addPhoto(position, label, 'camera') },
      { text: 'Gallery', onPress: () => addPhoto(position, label, 'gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleNext = () => {
    const requiredFilled = REQUIRED_SLOTS.every((slot) =>
      photos.some((p) => p.position === slot.position)
    );

    if (!requiredFilled) {
      Alert.alert('Photos Required', 'Please add all 6 required photos before continuing');
      return;
    }

    store.setStep(4);
    router.push('/sell/step4' as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StepProgress currentStep={3} totalSteps={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Upload Photos</Text>
        <Text style={styles.subheading}>
          Minimum 6 required photos. Add up to {MAX_PHOTOS} for better visibility.
        </Text>

        {/* Required Slots */}
        <Text style={styles.sectionLabel}>Required Photos</Text>
        <View style={styles.grid}>
          {REQUIRED_SLOTS.map((slot) => {
            const photo = photos.find((p) => p.position === slot.position);
            const uploadProgress = progress[slot.position];
            return (
              <View key={slot.position} style={styles.slotWrapper}>
                {photo ? (
                  <Pressable
                    style={styles.slot}
                    onPress={() =>
                      Alert.alert('Photo', slot.label, [
                        { text: 'Replace', onPress: () => showPicker(slot.position, slot.label) },
                        { text: 'Remove', onPress: () => removePhoto(slot.position), style: 'destructive' },
                        { text: 'Cancel', style: 'cancel' },
                      ])
                    }
                  >
                    <Image source={{ uri: photo.uri }} style={styles.slotImage} contentFit="cover" />
                    {uploadProgress !== undefined && uploadProgress < 100 && (
                      <View style={styles.progressOverlay}>
                        <Text style={styles.progressText}>{uploadProgress}%</Text>
                      </View>
                    )}
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.slotEmpty}
                    onPress={() => showPicker(slot.position, slot.label)}
                  >
                    <SymbolView
                      name={{ ios: 'camera' as any, android: 'photo_camera', web: 'photo_camera' }}
                      tintColor={colors.textTertiary}
                      size={24}
                    />
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        {/* Optional Slots */}
        {photos.length < MAX_PHOTOS && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
              Additional Photos ({optionalCount}/{MAX_PHOTOS - REQUIRED_SLOTS.length})
            </Text>
            <Pressable
              style={styles.addMore}
              onPress={() => {
                const nextPos = REQUIRED_SLOTS.length + optionalCount;
                if (nextPos < MAX_PHOTOS) {
                  showPicker(nextPos, `Photo ${nextPos + 1}`);
                }
              }}
            >
              <SymbolView
                name={{ ios: 'plus.circle' as any, android: 'add_circle', web: 'add_circle' }}
                tintColor={colors.primary}
                size={24}
              />
              <Text style={styles.addMoreText}>Add More Photos</Text>
            </Pressable>
          </>
        )}

        {/* Optional additional photos preview */}
        {optionalCount > 0 && (
          <View style={styles.grid}>
            {photos
              .filter((p) => p.position >= REQUIRED_SLOTS.length)
              .map((photo) => (
                <View key={photo.position} style={styles.slotWrapper}>
                  <Pressable
                    style={styles.slot}
                    onPress={() =>
                      Alert.alert('Photo', photo.label, [
                        { text: 'Remove', onPress: () => removePhoto(photo.position), style: 'destructive' },
                        { text: 'Cancel', style: 'cancel' },
                      ])
                    }
                  >
                    <Image source={{ uri: photo.uri }} style={styles.slotImage} contentFit="cover" />
                  </Pressable>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          title="Back"
          variant="ghost"
          onPress={() => { store.setStep(2); router.back(); }}
          fullWidth={false}
        />
        <Button title="Next" onPress={handleNext} fullWidth={false} style={styles.nextBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  heading: { ...typography.h2, color: colors.text },
  subheading: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.md },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotWrapper: {
    width: '31%',
    aspectRatio: 4 / 3,
  },
  slot: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  slotImage: { width: '100%', height: '100%' },
  slotEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  slotLabel: { ...typography.caption, color: colors.textTertiary, textAlign: 'center' },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: { ...typography.label, color: '#fff' },

  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  addMoreText: { ...typography.label, color: colors.primary },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  nextBtn: { paddingHorizontal: spacing['3xl'] },
});

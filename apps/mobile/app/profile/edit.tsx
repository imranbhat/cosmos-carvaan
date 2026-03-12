import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/useProfile';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

const CITIES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      await updateProfile({ full_name: name.trim(), city });
      Alert.alert('Success', 'Profile updated');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleAvatarPress = async () => {
    try {
      await uploadAvatar();
    } catch (err: any) {
      if (err.message !== 'cancelled') {
        Alert.alert('Error', err.message);
      }
    }
  };

  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <Pressable style={styles.avatarSection} onPress={handleAvatarPress}>
          <View style={styles.avatar}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <Text style={styles.changePhoto}>Change Photo</Text>
        </Pressable>

        {/* Name */}
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />

        {/* Phone (read-only) */}
        <View style={styles.readOnly}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.phoneText}>{profile?.phone ?? '—'}</Text>
        </View>

        {/* City */}
        <View style={styles.field}>
          <Text style={styles.label}>City</Text>
          <View style={styles.cityGrid}>
            {CITIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={city === c}
                onPress={() => setCity(c)}
              />
            ))}
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isUpdating}
          style={{ marginTop: spacing.xl }}
        />
      </View>
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
  content: { padding: spacing.lg },

  avatarSection: { alignItems: 'center', marginBottom: spacing['2xl'] },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 80, height: 80 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  changePhoto: { ...typography.label, color: colors.primary, marginTop: spacing.sm },

  readOnly: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  phoneText: { ...typography.body, color: colors.textTertiary },

  field: { marginBottom: spacing.lg },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});

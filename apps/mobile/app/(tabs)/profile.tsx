import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const MENU_SECTIONS = [
  {
    items: [
      { label: 'My Listings', icon: '🚗', route: '/profile/my-listings', desc: 'Manage your cars' },
      { label: 'Saved Cars', icon: '❤️', route: '/profile/saved-cars', desc: 'Your favorites' },
      { label: 'Saved Searches', icon: '🔔', route: '/profile/saved-searches', desc: 'Price alerts' },
      { label: 'Recently Viewed', icon: '👁️', route: '/profile/recently-viewed', desc: 'Browse history' },
    ],
  },
  {
    items: [
      { label: 'Edit Profile', icon: '✏️', route: '/profile/edit', desc: 'Update your info' },
      { label: 'Settings', icon: '⚙️', route: '/profile/settings', desc: 'App preferences' },
      { label: 'Help & Support', icon: '💬', route: '/profile/help', desc: 'Get in touch' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { signOut } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); } catch (err: any) { Alert.alert('Error', err.message); }
        },
      },
    ]);
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.name}>{profile?.full_name ?? 'Guest User'}</Text>
        {profile?.city ? (
          <View style={styles.cityBadge}>
            <Text style={styles.cityIcon}>📍</Text>
            <Text style={styles.cityText}>{profile.city}</Text>
          </View>
        ) : null}
      </View>

      {MENU_SECTIONS.map((section, si) => (
        <View key={si} style={[styles.menuSection, shadows.sm]}>
          {section.items.map((item, ii) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                ii < section.items.length - 1 && styles.menuItemBorder,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={styles.menuIconWrap}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}

      <View style={{ marginTop: spacing.lg, marginBottom: spacing['3xl'] }}>
        <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatar: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  name: { ...typography.h2, color: colors.text },
  cityBadge: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  cityIcon: { fontSize: 14 },
  cityText: { ...typography.body, color: colors.textSecondary },
  menuSection: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    overflow: 'hidden', marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, gap: spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuItemPressed: { backgroundColor: colors.borderLight },
  menuIconWrap: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 20 },
  menuContent: { flex: 1 },
  menuLabel: { ...typography.label, color: colors.text },
  menuDesc: { ...typography.bodySmall, color: colors.textTertiary, marginTop: 1 },
  menuChevron: { fontSize: 22, fontWeight: '300', color: colors.textTertiary },
});

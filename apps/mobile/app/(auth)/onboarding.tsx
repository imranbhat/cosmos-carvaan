import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/hooks/useProfile';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const CITIES = [
  'Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore',
  'Pulwama', 'Kupwara', 'Budgam', 'Shopian', 'Bandipora',
];

const ROLES = [
  { value: 'buyer' as const, label: 'Buy a Car', desc: "I'm looking to purchase" },
  { value: 'seller' as const, label: 'Sell a Car', desc: 'I want to sell my car' },
  { value: 'both' as const, label: 'Both', desc: 'Buy and sell cars' },
];

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'both'>('buyer');
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();

  async function handleComplete() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (!city) {
      Alert.alert('Required', 'Please select your city');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ full_name: name.trim(), city, role });
      // AuthGate will handle navigation to (tabs)
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          autoCapitalize="words"
        />

        <View style={styles.section}>
          <Text style={styles.label}>City</Text>
          <View style={styles.chipRow}>
            {CITIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, city === c && styles.chipActive]}
                onPress={() => setCity(c)}
              >
                <Text
                  style={[styles.chipText, city === c && styles.chipTextActive]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>I want to</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                onPress={() => setRole(r.value)}
              >
                <Text
                  style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}
                >
                  {r.label}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Button
          title="Get Started"
          onPress={handleComplete}
          loading={loading}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing['3xl'],
  },
  section: {
    marginTop: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  roleRow: {
    gap: spacing.sm,
  },
  roleCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#E6F7F8',
  },
  roleLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  roleLabelActive: {
    color: colors.primary,
  },
  roleDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

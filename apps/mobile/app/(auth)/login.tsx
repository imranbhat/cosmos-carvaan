import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography } from '@/constants/theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('+971');
  const [loading, setLoading] = useState(false);
  const { signInWithOtp, enterGuestMode } = useAuth();
  const router = useRouter();

  async function handleSendOtp() {
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await signInWithOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Carvaan</Text>
          <Text style={styles.tagline}>Find your perfect ride</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started
          </Text>

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+971 50 123 4567"
            autoFocus
          />

          <Button
            title="Continue"
            onPress={handleSendOtp}
            loading={loading}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>

        <Button
          title="Continue with Google"
          onPress={() => Alert.alert('Coming Soon', 'Google sign-in will be available soon')}
          variant="outline"
        />
        <View style={{ height: spacing.sm }} />
        <Button
          title="Continue with Apple"
          onPress={() => Alert.alert('Coming Soon', 'Apple sign-in will be available soon')}
          variant="outline"
        />

        <View style={styles.guestSection}>
          <Text
            style={styles.guestLink}
            onPress={() => {
              enterGuestMode();
              router.replace('/(tabs)' as any);
            }}
          >
            Browse as Guest
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginHorizontal: spacing.lg,
  },
  guestSection: {
    alignItems: 'center' as const,
    marginTop: spacing.xl,
  },
  guestLink: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
});

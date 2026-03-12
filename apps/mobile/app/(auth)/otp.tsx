import { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { OtpInput } from '@/components/ui/OtpInput';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography } from '@/constants/theme';
import { config } from '@/constants/config';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number>(config.otpExpirySeconds);
  const { verifyOtp, signInWithOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleVerify(code: string) {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      await verifyOtp(phone, code);
      // Auth state change will handle navigation via AuthGate
    } catch (err: any) {
      setError(err.message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!phone) return;
    try {
      await signInWithOtp(phone);
      setCountdown(config.otpExpirySeconds);
      Alert.alert('OTP Sent', 'A new code has been sent to your phone');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to resend OTP');
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Verify Phone</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {phone}
        </Text>

        <View style={styles.otpContainer}>
          <OtpInput onComplete={handleVerify} error={error} />
        </View>

        {loading && (
          <Text style={styles.verifying}>Verifying...</Text>
        )}

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.countdown}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing['3xl'],
  },
  backButton: {
    marginBottom: spacing['2xl'],
  },
  backText: {
    ...typography.body,
    color: colors.primary,
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
  otpContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  verifying: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  countdown: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  resendLink: {
    ...typography.label,
    color: colors.primary,
  },
});

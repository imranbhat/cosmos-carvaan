import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { APP_INFO } from '@/constants/appInfo';
import { useAuth } from '@/hooks/useAuth';

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <SettingsRow
          label="Privacy Policy"
          onPress={() => Linking.openURL(APP_INFO.privacyPolicyUrl)}
        />
        <SettingsRow
          label="Terms of Service"
          onPress={() => Linking.openURL(APP_INFO.termsUrl)}
        />

        <Text style={styles.sectionTitle}>Support</Text>
        <SettingsRow
          label="Contact Us"
          value={APP_INFO.supportEmail}
          onPress={() => Linking.openURL(`mailto:${APP_INFO.supportEmail}`)}
        />
        <SettingsRow
          label="Website"
          onPress={() => Linking.openURL(APP_INFO.websiteUrl)}
        />

        <Text style={styles.sectionTitle}>About</Text>
        <SettingsRow label="Version" value={APP_INFO.version} />

        <View style={styles.signOutContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  rowValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signOutContainer: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl * 2,
  },
  signOutButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
});

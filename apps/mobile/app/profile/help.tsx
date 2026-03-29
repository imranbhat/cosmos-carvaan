import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

const FAQS = [
  {
    question: 'How do I list my car for sale?',
    answer:
      'Tap the "Sell" tab at the bottom of the screen. Fill in your car details, upload at least 6 photos, set your price, and submit. Our team will review your listing within 24 hours.',
  },
  {
    question: 'Is it free to list a car?',
    answer:
      'Yes, basic listings are completely free. You can optionally boost your listing with a featured placement for better visibility.',
  },
  {
    question: 'How does the inspection work?',
    answer:
      'Once you list your car, you can request an inspection. Our certified mechanics will visit your location, inspect the car, and provide a detailed report that buyers can trust.',
  },
  {
    question: 'How do I contact a seller?',
    answer:
      'On any car listing page, you can tap "Chat with Seller" to send a message or tap "Call" to phone them directly.',
  },
  {
    question: 'Can I negotiate the price?',
    answer:
      'If a listing shows "Negotiable", you can make an offer through the chat. The seller will accept, decline, or counter your offer.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to Settings > scroll to bottom > tap "Delete Account". This will permanently remove your account and all associated data within 30 days.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[styles.faqItem, expanded && styles.faqItemExpanded]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqChevron}>{expanded ? '−' : '+'}</Text>
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </Pressable>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={[styles.section, shadows.sm]}>
          {FAQS.map((faq, index) => (
            <View key={index}>
              <FAQItem question={faq.question} answer={faq.answer} />
              {index < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={[styles.section, shadows.sm]}>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@carvaan.in')}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@carvaan.in</Text>
            </View>
            <Text style={styles.contactChevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:+911234567890')}
          >
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+91 123 456 7890</Text>
            </View>
            <Text style={styles.contactChevron}>›</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Carvaan</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
          <Text style={styles.appTagline}>Kashmir's Trusted Car Marketplace</Text>
        </View>
      </ScrollView>
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

  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  // FAQ styles
  faqItem: {
    padding: spacing.lg,
  },
  faqItemExpanded: {
    backgroundColor: colors.primaryMuted,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    ...typography.label,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  faqChevron: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.textTertiary,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  // Contact styles
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  contactIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { ...typography.caption, color: colors.textTertiary },
  contactValue: { ...typography.label, color: colors.text, marginTop: 2 },
  contactChevron: { fontSize: 22, fontWeight: '300', color: colors.textTertiary },

  // App info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  appName: { ...typography.h2, color: colors.primary },
  appVersion: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
  appTagline: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
});

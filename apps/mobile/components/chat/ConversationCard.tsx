import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { timeAgo } from '@/lib/format';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface ConversationCardProps {
  conversation: {
    id: string;
    buyer_id: string;
    seller_id: string;
    last_message_text: string | null;
    last_message_at: string | null;
    last_message_sender_id: string | null;
    listing: any;
    buyer: any;
    seller: any;
  };
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.session?.user?.id);
  const unread = useChatStore((s) => s.unreadCounts[conversation.id] ?? 0);

  const otherUser = conversation.buyer_id === userId
    ? conversation.seller
    : conversation.buyer;

  const listing = conversation.listing;
  const carPhoto = listing?.photos?.find((p: any) => p.is_primary) ?? listing?.photos?.[0];
  const carTitle = listing
    ? `${listing.year} ${listing.make?.name ?? ''} ${listing.model?.name ?? ''}`
    : 'Car';

  const initial = otherUser?.full_name?.charAt(0)?.toUpperCase() ?? '?';
  const isMyMessage = conversation.last_message_sender_id === userId;

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/chat/${conversation.id}` as any)}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        {otherUser?.avatar_url ? (
          <Image source={{ uri: otherUser.avatar_url }} style={styles.avatarImg} contentFit="cover" />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, unread > 0 && styles.nameBold]} numberOfLines={1}>
            {otherUser?.full_name ?? 'User'}
          </Text>
          {conversation.last_message_at && (
            <Text style={styles.time}>{timeAgo(conversation.last_message_at)}</Text>
          )}
        </View>

        <Text style={styles.carTitle} numberOfLines={1}>{carTitle}</Text>

        <View style={styles.bottomRow}>
          <Text
            style={[styles.preview, unread > 0 && styles.previewUnread]}
            numberOfLines={1}
          >
            {isMyMessage ? 'You: ' : ''}
            {conversation.last_message_text ?? 'No messages yet'}
          </Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Car thumbnail */}
      {carPhoto?.thumbnail_url && (
        <Image
          source={{ uri: carPhoto.thumbnail_url }}
          style={styles.carThumb}
          contentFit="cover"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  avatarImg: { width: 48, height: 48 },
  avatarText: { ...typography.h3, color: colors.primary },
  content: { flex: 1, marginRight: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.label, color: colors.text, flex: 1, marginRight: spacing.sm },
  nameBold: { fontWeight: '700' },
  time: { ...typography.caption, color: colors.textTertiary },
  carTitle: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  preview: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  previewUnread: { color: colors.text, fontWeight: '600' },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: { ...typography.caption, color: '#fff', fontWeight: '700', fontSize: 11 },
  carThumb: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
});

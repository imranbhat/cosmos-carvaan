import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMessages } from '@/hooks/useMessages';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { formatPrice } from '@/lib/format';
import { colors, borderRadius, spacing, typography, shadows } from '@/constants/theme';

export default function ChatThreadScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.session?.user?.id);
  const { setActiveConversation } = useChatStore();
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  // Set active conversation for unread tracking
  useEffect(() => {
    setActiveConversation(conversationId!);
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: queryKeys.conversations.detail(conversationId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, listing_id, buyer_id, seller_id,
          listing:listings!listing_id(
            id, year, price, price_currency,
            make:car_makes!make_id(name),
            model:car_models!model_id(name),
            photos:listing_photos(thumbnail_url, is_primary)
          ),
          buyer:profiles!buyer_id(id, full_name, avatar_url),
          seller:profiles!seller_id(id, full_name, avatar_url)
        `)
        .eq('id', conversationId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId!);

  const { mutate: sendMessage } = useSendMessage();

  const messages = messagesData?.pages.flat() ?? [];

  const otherUser = conversation
    ? (conversation.buyer_id === userId ? conversation.seller : conversation.buyer) as any
    : null;

  const listing = conversation?.listing as any;
  const carPhoto = listing?.photos?.find((p: any) => p.is_primary) ?? listing?.photos?.[0];
  const carTitle = listing
    ? `${listing.year} ${listing.make?.name ?? ''} ${listing.model?.name ?? ''}`
    : '';

  const handleSend = useCallback(
    (text: string) => {
      if (!conversationId) return;
      sendMessage({ conversationId: conversationId!, content: text });
      setShowQuickReplies(false);
    },
    [conversationId, sendMessage]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUser?.full_name ?? 'Chat'}
          </Text>
        </View>
      </View>

      {/* Car Card Header */}
      {listing && (
        <Pressable
          style={[styles.carHeader, shadows.sm]}
          onPress={() => router.push(`/car/${listing.id}` as any)}
        >
          {carPhoto?.thumbnail_url && (
            <Image
              source={{ uri: carPhoto.thumbnail_url }}
              style={styles.carThumb}
              contentFit="cover"
            />
          )}
          <View style={styles.carInfo}>
            <Text style={styles.carTitle} numberOfLines={1}>{carTitle}</Text>
            <Text style={styles.carPrice}>
              {formatPrice(listing.price, listing.price_currency)}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <MessageBubble
            message={item}
            isOwn={item.sender_id === userId}
          />
        )}
        inverted
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
      />

      {/* Quick Replies */}
      {showQuickReplies && messages.length === 0 && (
        <QuickReplies onSelect={handleSend} />
      )}

      {/* Input */}
      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { marginRight: spacing.md, padding: spacing.xs },
  backText: { ...typography.h3, color: colors.primary },
  headerInfo: { flex: 1 },
  headerName: { ...typography.label, color: colors.text },

  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  carThumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  carInfo: { flex: 1 },
  carTitle: { ...typography.bodySmall, color: colors.text },
  carPrice: { ...typography.label, color: colors.primary, marginTop: 1 },

  messageList: { flex: 1 },
  messageContent: { paddingVertical: spacing.md },
});

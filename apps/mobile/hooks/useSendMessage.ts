import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/stores/authStore';

interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'offer';
  imageUrl?: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async ({ conversationId, content, messageType = 'text', imageUrl }: SendMessageInput) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId!,
          message_type: messageType,
          content,
          image_url: imageUrl ?? null,
        })
        .select('id, conversation_id, sender_id, message_type, content, image_url, created_at')
        .single();

      if (error) throw error;

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message_at: data.created_at,
          last_message_text: content,
          last_message_sender_id: userId,
        })
        .eq('id', conversationId);

      return data;
    },
    onMutate: async ({ conversationId, content, messageType = 'text' }) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData(
        queryKeys.conversations.messages(conversationId)
      );

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        message_type: messageType,
        content,
        image_url: null,
        created_at: new Date().toISOString(),
        sender: { id: userId, full_name: 'You', avatar_url: null },
      };

      queryClient.setQueryData(
        queryKeys.conversations.messages(conversationId),
        (old: any) => {
          if (!old?.pages?.[0]) return { pages: [[optimisticMessage]], pageParams: [0] };
          return {
            ...old,
            pages: [[optimisticMessage, ...old.pages[0]], ...old.pages.slice(1)],
          };
        }
      );

      return { previousMessages };
    },
    onError: (_err, { conversationId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.conversations.messages(conversationId),
          context.previousMessages
        );
      }
    },
    onSettled: (_data, _err, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export async function getOrCreateConversation(
  listingId: string,
  buyerId: string,
  sellerId: string
): Promise<string> {
  // Check for existing conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .single();

  if (existing) return existing.id;

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

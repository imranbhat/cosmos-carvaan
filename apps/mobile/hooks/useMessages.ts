import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { useChatStore } from '@/stores/chatStore';

const PAGE_SIZE = 30;

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, conversation_id, sender_id, message_type, content,
          image_url, created_at,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data ?? [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _all, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
    enabled: !!conversationId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Prepend new message to first page
          queryClient.setQueryData(
            queryKeys.conversations.messages(conversationId),
            (old: any) => {
              if (!old?.pages?.[0]) return old;
              return {
                ...old,
                pages: [
                  [payload.new, ...old.pages[0]],
                  ...old.pages.slice(1),
                ],
              };
            }
          );
          // Refresh conversation list
          queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });

          // Increment unread if not the active conversation
          useChatStore.getState().incrementUnread(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

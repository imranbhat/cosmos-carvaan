import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';

export function useConversations() {
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: queryKeys.conversations.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, listing_id, buyer_id, seller_id, last_message_at,
          last_message_text, last_message_sender_id, unread_count_buyer,
          unread_count_seller, created_at,
          listing:listings!listing_id(
            id, year, price, price_currency,
            make:car_makes!make_id(name),
            model:car_models!model_id(name),
            photos:listing_photos(thumbnail_url, is_primary)
          ),
          buyer:profiles!buyer_id(id, full_name, avatar_url),
          seller:profiles!seller_id(id, full_name, avatar_url)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: queryConfig.staleTime.conversations,
  });
}

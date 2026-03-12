import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';

export function useMyListings(statusFilter?: string) {
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [...queryKeys.listings.all, 'mine', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          id, year, mileage, price, price_currency, negotiable, city,
          status, featured, views_count, saves_count, created_at,
          make:car_makes!make_id(id, name),
          model:car_models!model_id(id, name),
          photos:listing_photos(url, thumbnail_url, is_primary)
        `)
        .eq('seller_id', userId!)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: queryConfig.staleTime.listings,
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

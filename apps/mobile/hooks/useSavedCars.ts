import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';

export function useSavedCarsList() {
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [...queryKeys.savedCars, 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_cars')
        .select(`
          id, created_at,
          listing:listings!listing_id(
            id, year, mileage, price, price_currency, negotiable, city,
            featured, created_at,
            make:car_makes!make_id(id, name),
            model:car_models!model_id(id, name),
            variant:car_variants!variant_id(fuel_type, transmission),
            photos:listing_photos(url, thumbnail_url, is_primary)
          )
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((d: any) => d.listing).filter(Boolean);
    },
    enabled: !!userId,
    staleTime: queryConfig.staleTime.savedCars,
  });
}

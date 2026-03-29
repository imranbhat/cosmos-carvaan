import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';

export interface SavedSearch {
  id: string;
  name: string | null;
  filters: Record<string, any>;
  notify: boolean;
  created_at: string;
}

export function useSavedSearches() {
  const { session } = useAuthStore();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: queryKeys.savedSearches.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('id, name, filters, notify, created_at')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as SavedSearch[];
    },
    enabled: !!userId,
    staleTime: queryConfig.staleTime.savedCars,
  });
}

export function useToggleSavedSearchNotify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notify }: { id: string; notify: boolean }) => {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notify })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedSearches.all });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedSearches.all });
    },
  });
}

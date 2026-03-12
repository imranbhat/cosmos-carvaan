import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { toggleSaveCar, fetchSavedCarIds } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export function useSavedCarIds() {
  const userId = useAuthStore((s) => s.profile?.id);

  return useQuery({
    queryKey: queryKeys.savedCars,
    queryFn: () => fetchSavedCarIds(userId!),
    staleTime: queryConfig.staleTime.savedCars,
    enabled: !!userId,
  });
}

export function useToggleSave() {
  const userId = useAuthStore((s) => s.profile?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => toggleSaveCar(listingId, userId!),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.savedCars });
      const previous = queryClient.getQueryData<string[]>(queryKeys.savedCars) ?? [];

      const isSaved = previous.includes(listingId);
      queryClient.setQueryData<string[]>(
        queryKeys.savedCars,
        isSaved ? previous.filter((id) => id !== listingId) : [...previous, listingId]
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.savedCars, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedCars });
    },
  });
}

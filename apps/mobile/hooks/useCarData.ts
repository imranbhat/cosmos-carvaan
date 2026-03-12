import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { fetchMakes, fetchModels, fetchVariants } from '@/lib/api';

export function useMakes() {
  return useQuery({
    queryKey: queryKeys.makes.all,
    queryFn: fetchMakes,
    staleTime: queryConfig.staleTime.masterData,
  });
}

export function useModels(makeId: string | null) {
  return useQuery({
    queryKey: queryKeys.makes.models(makeId ?? ''),
    queryFn: () => fetchModels(makeId!),
    staleTime: queryConfig.staleTime.masterData,
    enabled: !!makeId,
  });
}

export function useVariants(modelId: string | null) {
  return useQuery({
    queryKey: queryKeys.makes.variants(modelId ?? ''),
    queryFn: () => fetchVariants(modelId!),
    staleTime: queryConfig.staleTime.masterData,
    enabled: !!modelId,
  });
}

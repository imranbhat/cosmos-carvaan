import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { queryConfig } from '@/constants/config';
import { config } from '@/constants/config';
import {
  fetchListings,
  fetchListingById,
  fetchSimilarListings,
  fetchFeaturedListings,
  type ListingsParams,
} from '@/lib/api';
import type { FilterState } from '@/stores/filterStore';

export function useListingsInfinite(filters: Partial<FilterState>) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      fetchListings({ filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === config.pageSize ? lastPageParam + 1 : undefined,
    staleTime: queryConfig.staleTime.listings,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => fetchListingById(id),
    staleTime: queryConfig.staleTime.listingDetail,
    enabled: !!id,
  });
}

export function useSimilarListings(id: string, makeId: string, price: number) {
  return useQuery({
    queryKey: queryKeys.listings.similar(id),
    queryFn: () => fetchSimilarListings(id, makeId, price),
    staleTime: queryConfig.staleTime.similarListings,
    enabled: !!id && !!makeId,
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: [...queryKeys.listings.all, 'featured'],
    queryFn: fetchFeaturedListings,
    staleTime: queryConfig.staleTime.listings,
  });
}

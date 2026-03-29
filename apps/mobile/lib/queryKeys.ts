import type { FilterState } from '@/stores/filterStore';

export const queryKeys = {
  listings: {
    all: ['listings'] as const,
    list: (filters: Partial<FilterState>) => ['listings', 'list', filters] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    similar: (id: string) => ['listings', 'similar', id] as const,
    mine: () => ['listings', 'mine'] as const,
  },
  makes: {
    all: ['makes'] as const,
    models: (makeId: string) => ['makes', makeId, 'models'] as const,
    variants: (modelId: string) => ['models', modelId, 'variants'] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    detail: (id: string) => ['conversations', id] as const,
    messages: (id: string) => ['conversations', id, 'messages'] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
    user: (id: string) => ['profile', id] as const,
  },
  savedCars: ['saved-cars'] as const,
  savedSearches: {
    all: ['saved-searches'] as const,
  },
} as const;

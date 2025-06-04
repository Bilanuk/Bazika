import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ContentItem } from './useSources';

interface UseContentItemsQueryOptions {
  limit?: number;
  sourceId?: string;
}

async function fetchContentItems(
  options: UseContentItemsQueryOptions = {}
): Promise<ContentItem[]> {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.sourceId) params.append('sourceId', options.sourceId);

  const response = await fetch(`/api/content-items?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.contentItems || [];
}

export function useContentItemsQuery(
  options: UseContentItemsQueryOptions = {}
): UseQueryResult<ContentItem[], Error> {
  return useQuery({
    queryKey: ['content-items', options],
    queryFn: () => fetchContentItems(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Source } from './useSources';

async function fetchSources(): Promise<Source[]> {
  const response = await fetch('/api/sources');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.sources || [];
}

export function useSourcesQuery(): UseQueryResult<Source[], Error> {
  return useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

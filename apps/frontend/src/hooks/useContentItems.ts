import { useState, useEffect } from 'react';
import { ContentItem } from './useSources';

interface UseContentItemsOptions {
  limit?: number;
  sourceId?: string;
}

interface UseContentItemsReturn {
  contentItems: ContentItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContentItems(options: UseContentItemsOptions = {}): UseContentItemsReturn {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sourceId) params.append('sourceId', options.sourceId);
      
      const response = await fetch(`/api/content-items?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setContentItems(data.contentItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content items');
      console.error('Error fetching content items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentItems();
  }, [options.limit, options.sourceId]);

  return {
    contentItems,
    loading,
    error,
    refetch: fetchContentItems
  };
} 
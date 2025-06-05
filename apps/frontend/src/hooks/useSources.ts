import { useState, useEffect } from 'react';

export interface Source {
  id: string;
  name: string;
  type: string;
  url: string;
  isActive: boolean;
  lastChecked: string | null;
  createdAt: string;
  updatedAt: string;
  contentItems?: ContentItem[];
}

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  guid: string;
  publishedAt: string;
  sourceId: string;
  notificationSent: boolean;
  processingStatus: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
  source?: Source;
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED', 
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

interface UseSourcesReturn {
  sources: Source[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSources(): UseSourcesReturn {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sources');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sources');
      console.error('Error fetching sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return {
    sources,
    loading,
    error,
    refetch: fetchSources
  };
} 
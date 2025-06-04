'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table/data-table';
import { sourcesColumns } from '@/components/data-table/sources-columns';
import { contentItemsColumns } from '@/components/data-table/content-items-columns';
import { Source, ContentItem } from '@/hooks/useSources';

// Example: Using React Query with Data Tables
export function SourcesDataTableExample() {
  const { data: sources = [], isLoading, error } = useQuery({
    queryKey: ['sources'],
    queryFn: async (): Promise<Source[]> => {
      const response = await fetch('/api/sources');
      if (!response.ok) throw new Error('Failed to fetch sources');
      const data = await response.json();
      return data.sources || [];
    },
  });

  if (isLoading) return <div>Loading sources...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Sources Data Table</h2>
      <DataTable
        columns={sourcesColumns}
        data={sources}
        searchKey="name"
        searchPlaceholder="Search sources..."
      />
    </div>
  );
}

export function ContentItemsDataTableExample() {
  const { data: contentItems = [], isLoading, error } = useQuery({
    queryKey: ['content-items'],
    queryFn: async (): Promise<ContentItem[]> => {
      const response = await fetch('/api/content-items?limit=50');
      if (!response.ok) throw new Error('Failed to fetch content items');
      const data = await response.json();
      return data.contentItems || [];
    },
  });

  if (isLoading) return <div>Loading content items...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Content Items Data Table</h2>
      <DataTable
        columns={contentItemsColumns}
        data={contentItems}
        searchKey="title"
        searchPlaceholder="Search content items..."
      />
    </div>
  );
}

// Example: Basic usage without React Query
export function BasicDataTableExample() {
  const [data, setData] = React.useState<Source[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/sources')
      .then(res => res.json())
      .then(data => {
        setData(data.sources || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Basic Data Table</h2>
      <DataTable
        columns={sourcesColumns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search sources..."
      />
    </div>
  );
} 
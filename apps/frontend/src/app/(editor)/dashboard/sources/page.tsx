'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { DataTableServerSide, FilterConfig } from '@/components/data-table/data-table-server-side';
import { sourcesColumns } from '@/components/data-table/sources-columns';
import { Source } from '@/hooks/useSources';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AddSourceSheet from '@/components/AddSourceSheet';
import AdminOnly from '@/components/AdminOnly';

// Fetch function for React Query with filters
async function fetchSources(
  filters: Record<string, string[]> = {},
  search: string = '',
  offset: number = 0,
  limit: number = 100
): Promise<{ sources: Source[]; pagination: any }> {
  const params = new URLSearchParams();
  
  // Add pagination
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  // Add search
  if (search) {
    params.append('search', search);
  }
  
  // Add filters
  Object.entries(filters).forEach(([key, values]) => {
    if (values.length > 0) {
      params.append(key, values.join(','));
    }
  });

  const response = await fetch(`/api/sources?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return {
    sources: data.sources || [],
    pagination: data.pagination
  };
}

export default function SourcesPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = React.useState<Record<string, string[]>>({});
  const [search, setSearch] = React.useState('');
  const [pagination, setPagination] = React.useState({ offset: 0, limit: 100 });
  const [isInitialized, setIsInitialized] = React.useState(false);

  // React Query hook with dependencies on filters, search, and pagination
  const {
    data,
    isLoading: sourcesLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useQuery({
    queryKey: ['sources', filters, search, pagination],
    queryFn: () => fetchSources(filters, search, pagination.offset, pagination.limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isInitialized, // Only run query after component is initialized
  });

  const sources = data?.sources || [];
  const paginationData = data?.pagination;

  // Initialize the component after a short delay to allow localStorage to load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    await refetchSources();
  };

  const handleBackfillSuccess = () => {
    // Refresh the sources data after successful backfill
    handleRefresh();
  };

  const handleFiltersChange = React.useCallback((newFilters: Record<string, string[]>) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page when filters change
    setIsInitialized(true); // Mark as initialized when filters change
  }, []);

  const handleSearchChange = React.useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page when search changes
    setIsInitialized(true); // Mark as initialized when search changes
  }, []);

  const handlePaginationChange = React.useCallback((offset: number, limit: number) => {
    setPagination({ offset, limit });
  }, []);

  // Get unique types for filter options (from current data)
  const uniqueTypes = React.useMemo(() => {
    const types = sources.map(source => source.type);
    return Array.from(new Set(types)).sort();
  }, [sources]);

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'type',
      label: 'Type',
      type: 'multiselect',
      options: uniqueTypes.map(type => ({ value: type, label: type })),
    },
    {
      key: 'isActive',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  return (
    <AdminOnly>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Manage RSS feeds and other content sources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={sourcesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${sourcesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <AddSourceSheet onSourceAdded={handleRefresh} user={session?.user} />
          </div>
        </div>

        {/* Error Alert */}
        {sourcesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {sourcesError?.message || 'An error occurred while loading sources'}
            </AlertDescription>
          </Alert>
        )}

        {/* Sources Table */}
        <Card>
          <CardHeader>
            <CardTitle>Content Sources</CardTitle>
            <CardDescription>
              Manage RSS feeds and other content sources. 
              {paginationData ? ` Total: ${paginationData.total} sources` : ` Showing: ${sources.length} sources`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableServerSide
              columns={sourcesColumns}
              data={sources}
              searchKey="name"
              searchPlaceholder="Search sources..."
              filters={filterConfigs}
              storageKey="sources"
              onFiltersChange={handleFiltersChange}
              onSearchChange={handleSearchChange}
              isLoading={sourcesLoading}
              pagination={paginationData}
              onPaginationChange={handlePaginationChange}
            />
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
} 
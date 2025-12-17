'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { DataTableServerSide, FilterConfig } from '@/components/data-table/data-table-server-side';
import { contentItemsColumns } from '@/components/data-table/content-items-columns';
import { ContentItem, ProcessingStatus } from '@/hooks/useSources';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EpisodeFilter } from '@/components/data-table/episode-filter';
import { SerialFilter } from '@/components/data-table/serial-filter';
import AdminOnly from '@/components/AdminOnly';

// Fetch function for React Query with filters
async function fetchContentItems(
  filters: Record<string, string[]> = {},
  search: string = '',
  offset: number = 0,
  limit: number = 100
): Promise<{ contentItems: ContentItem[]; pagination: any }> {
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
      if (key === 'source.name') {
        params.append('sourceName', values.join(','));
      } else if (key === 'serial.title') {
        params.append('serialTitle', values.join(','));
      } else if (key === 'episode.episodeNumber') {
        params.append('episodeNumber', values.join(','));
      } else {
        params.append(key, values.join(','));
      }
    }
  });

  const response = await fetch(`/api/content-items?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return {
    contentItems: data.contentItems || [],
    pagination: data.pagination
  };
}

// Fetch filter options
async function fetchFilterOptions(): Promise<{
  serials: Array<{ id: string; title: string }>;
  episodes: Array<{ id: string; episodeNumber: number; title: string; serial: { title: string } }>;
  sources: Array<{ id: string; name: string }>;
}> {
  const response = await fetch('/api/content-items/filters');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export default function ContentItemsPage() {
  const [filters, setFilters] = React.useState<Record<string, string[]>>({});
  const [search, setSearch] = React.useState('');
  const [pagination, setPagination] = React.useState({ offset: 0, limit: 100 });
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['content-items-filters'],
    queryFn: fetchFilterOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query hook with dependencies on filters, search, and pagination
  const {
    data,
    isLoading: contentItemsLoading,
    error: contentItemsError,
    refetch: refetchContentItems,
  } = useQuery({
    queryKey: ['content-items', filters, search, pagination],
    queryFn: () => fetchContentItems(filters, search, pagination.offset, pagination.limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: isInitialized, // Only run query after component is initialized
  });

  const contentItems = data?.contentItems || [];
  const paginationData = data?.pagination;

  // Initialize the component after a short delay to allow localStorage to load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    await refetchContentItems();
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

  // Handle serial filter changes
  const handleSerialChange = React.useCallback((serialTitles: string[]) => {
    const newFilters = { ...filters };
    newFilters['serial.title'] = serialTitles;
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, [filters]);

  // Handle episode filter changes
  const handleEpisodeChange = React.useCallback((episodeNumbers: string[]) => {
    const newFilters = { ...filters };
    newFilters['episode.episodeNumber'] = episodeNumbers;
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, [filters]);

  // Get selected serial IDs for episode filter dependency
  const selectedSerialTitles = filters['serial.title'] || [];
  const selectedSerialIds = React.useMemo(() => {
    if (!filterOptions?.serials || selectedSerialTitles.length === 0) return [];
    return filterOptions.serials
      .filter(serial => selectedSerialTitles.includes(serial.title))
      .map(serial => serial.id);
  }, [filterOptions?.serials, selectedSerialTitles]);

  // Clear episode filter when no serials are selected
  React.useEffect(() => {
    if (selectedSerialIds.length === 0 && filters['episode.episodeNumber']?.length > 0) {
      const newFilters = { ...filters };
      newFilters['episode.episodeNumber'] = [];
      setFilters(newFilters);
    }
  }, [selectedSerialIds.length, filters]);

  // Filter configurations (excluding serial and episode filters as they're now custom)
  const filterConfigs: FilterConfig[] = [
    {
      key: 'quality',
      label: 'Quality',
      type: 'multiselect',
      options: [
        { value: '480p', label: '480p' },
        { value: '720p', label: '720p' },
        { value: '1080p', label: '1080p' },
        { value: '2160p', label: '2160p (4K)' },
      ],
    },
    {
      key: 'processingStatus',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: ProcessingStatus.NONE, label: 'None' },
        { value: ProcessingStatus.DOWNLOAD_QUEUED, label: 'Download Queued' },
        { value: ProcessingStatus.DOWNLOADING, label: 'Downloading' },
        { value: ProcessingStatus.DOWNLOAD_COMPLETED, label: 'Download Completed' },
        { value: ProcessingStatus.DOWNLOAD_FAILED, label: 'Download Failed' },
        { value: ProcessingStatus.PROCESSING_QUEUED, label: 'Processing Queued' },
        { value: ProcessingStatus.PROCESSING, label: 'Processing' },
        { value: ProcessingStatus.PROCESSING_COMPLETED, label: 'Processing Completed' },
        { value: ProcessingStatus.PROCESSING_FAILED, label: 'Processing Failed' },
        { value: ProcessingStatus.PROCESSING_SKIPPED, label: 'Processing Skipped' },
      ],
    },
    {
      key: 'source.name',
      label: 'Source',
      type: 'multiselect',
      options: filterOptions?.sources?.map(source => ({ value: source.name, label: source.name })) || [],
    },
    {
      key: 'notificationSent',
      label: 'Notifications',
      type: 'multiselect',
      options: [
        { value: 'true', label: 'Sent' },
        { value: 'false', label: 'Pending' },
      ],
    },
  ];

  // Custom filters component
  const customFilters = (
    <div className="flex items-center gap-2">
      <SerialFilter
        serials={filterOptions?.serials || []}
        selectedSerialTitles={selectedSerialTitles}
        onSerialChange={handleSerialChange}
      />
      <EpisodeFilter
        selectedSerialIds={selectedSerialIds}
        selectedEpisodeNumbers={filters['episode.episodeNumber'] || []}
        onEpisodeChange={handleEpisodeChange}
      />
    </div>
  );

  // Calculate statistics
  const pendingNotifications = contentItems.filter(item => !item.notificationSent).length;
  const pendingProcessing = contentItems.filter(item => item.processingStatus === ProcessingStatus.NONE).length;
  const queuedProcessing = contentItems.filter(item => 
    item.processingStatus === ProcessingStatus.DOWNLOAD_QUEUED || 
    item.processingStatus === ProcessingStatus.PROCESSING_QUEUED
  ).length;
  const processingItems = contentItems.filter(item => 
    item.processingStatus === ProcessingStatus.DOWNLOADING || 
    item.processingStatus === ProcessingStatus.PROCESSING
  ).length;
  const completedProcessing = contentItems.filter(item => 
    item.processingStatus === ProcessingStatus.PROCESSING_COMPLETED
  ).length;
  const failedProcessing = contentItems.filter(item => 
    item.processingStatus === ProcessingStatus.DOWNLOAD_FAILED || 
    item.processingStatus === ProcessingStatus.PROCESSING_FAILED
  ).length;

  return (
    <AdminOnly>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Monitor and manage content items from all sources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={contentItemsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${contentItemsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {contentItemsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {contentItemsError?.message || 'An error occurred while loading content items'}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paginationData?.total || contentItems.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingNotifications} pending notifications
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queuedProcessing + processingItems}</div>
              <p className="text-xs text-muted-foreground">
                {queuedProcessing} queued, {processingItems} processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProcessing}</div>
              <p className="text-xs text-muted-foreground">
                Successfully processed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed/Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{failedProcessing + pendingProcessing}</div>
              <p className="text-xs text-muted-foreground">
                {failedProcessing} failed, {pendingProcessing} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Content Items</CardTitle>
            <CardDescription>
              Monitor and manage content items from all sources. 
              {paginationData ? ` Total: ${paginationData.total} items` : ` Showing: ${contentItems.length} items`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableServerSide
              columns={contentItemsColumns}
              data={contentItems}
              searchKey="title"
              searchPlaceholder="Search content items..."
              filters={filterConfigs}
              customFilters={customFilters}
              storageKey="content-items"
              onFiltersChange={handleFiltersChange}
              onSearchChange={handleSearchChange}
              isLoading={contentItemsLoading}
              pagination={paginationData}
              onPaginationChange={handlePaginationChange}
            />
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
} 
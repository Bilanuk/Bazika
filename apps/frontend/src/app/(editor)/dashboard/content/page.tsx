'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { DataTableWithFilters, FilterConfig } from '@/components/data-table/data-table-with-filters';
import { contentItemsColumns } from '@/components/data-table/content-items-columns';
import { ContentItem, ProcessingStatus } from '@/hooks/useSources';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminOnly from '@/components/AdminOnly';

// Fetch function for React Query
async function fetchContentItems(): Promise<ContentItem[]> {
  const response = await fetch('/api/content-items?limit=100');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.contentItems || [];
}

export default function ContentItemsPage() {
  // React Query hook
  const {
    data: contentItems = [],
    isLoading: contentItemsLoading,
    error: contentItemsError,
    refetch: refetchContentItems,
  } = useQuery({
    queryKey: ['content-items'],
    queryFn: fetchContentItems,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleRefresh = async () => {
    await refetchContentItems();
  };

  // Get unique sources for filter options
  const uniqueSources = React.useMemo(() => {
    const sources = contentItems
      .map(item => item.source?.name)
      .filter((name): name is string => !!name);
    return Array.from(new Set(sources)).sort();
  }, [contentItems]);

  // Filter configurations
  const filters: FilterConfig[] = [
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
      options: uniqueSources.map(source => ({ value: source, label: source })),
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
              <div className="text-2xl font-bold">{contentItems.length}</div>
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
              Monitor and manage content items from all sources. Total: {contentItems.length} items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentItemsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading content items...</span>
              </div>
            ) : (
              <DataTableWithFilters
                columns={contentItemsColumns}
                data={contentItems}
                searchKey="title"
                searchPlaceholder="Search content items..."
                filters={filters}
                storageKey="content-items"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
} 
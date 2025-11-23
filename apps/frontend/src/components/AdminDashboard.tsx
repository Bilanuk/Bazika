'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, AlertCircle, ArrowRight, Database } from 'lucide-react';
import { Source, ContentItem, ProcessingStatus } from '@/hooks/useSources';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AddSourceSheet from '@/components/AddSourceSheet';
import Link from 'next/link';
import { BackfillDialog } from '@/components/BackfillDialog';

// Fetch functions for React Query
async function fetchSources(): Promise<Source[]> {
  const response = await fetch('/api/sources');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.sources || [];
}

async function fetchContentItems(): Promise<ContentItem[]> {
  const response = await fetch('/api/content-items?limit=100');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.contentItems || [];
}

// AniList sync function
async function syncAniList(limit: number = 10): Promise<void> {
  // Call backend directly instead of using proxy
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '') || 'http://localhost:4001';
  const response = await fetch(`${backendUrl}/content-monitoring/sync-anilist?limit=${limit}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}

export default function AdminDashboard() {
  const [isAniListSyncing, setIsAniListSyncing] = useState(false);
  const [aniListMessage, setAniListMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backfillDialogOpen, setBackfillDialogOpen] = useState(false);

  // React Query hooks
  const {
    data: sources = [],
    isLoading: sourcesLoading,
    error: sourcesError,
    refetch: refetchSources,
  } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    await Promise.all([refetchSources(), refetchContentItems()]);
  };

  const handleAniListSync = async (limit: number = 10) => {
    setIsAniListSyncing(true);
    setAniListMessage(null);
    try {
      await syncAniList(limit);
      setAniListMessage({
        type: 'success',
        text: `AniList sync started for up to ${limit} serials. This may take a few minutes.`,
      });
      
      // Refetch data to show updated images and information
      await handleRefresh();
      
      // Clear message after 5 seconds
      setTimeout(() => setAniListMessage(null), 5000);
    } catch (error) {
      setAniListMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsAniListSyncing(false);
    }
  };

  const handleBackfillSuccess = () => {
    // Refresh data after successful backfill
    handleRefresh();
  };

  const isLoading = sourcesLoading || contentItemsLoading;
  const hasError = sourcesError || contentItemsError;

  // Calculate statistics
  const pendingNotifications = contentItems.filter(item => !item.notificationSent).length;
  const pendingProcessing = contentItems.filter(item => item.processingStatus === ProcessingStatus.PENDING).length;
  const queuedProcessing = contentItems.filter(item => item.processingStatus === ProcessingStatus.QUEUED).length;
  const processingItems = contentItems.filter(item => item.processingStatus === ProcessingStatus.PROCESSING).length;
  const completedProcessing = contentItems.filter(item => item.processingStatus === ProcessingStatus.COMPLETED).length;
  const failedProcessing = contentItems.filter(item => item.processingStatus === ProcessingStatus.FAILED).length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Monitor your content management system performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAniListSync(10)}
            disabled={isAniListSyncing}
          >
            <Database className={`h-4 w-4 mr-2 ${isAniListSyncing ? 'animate-spin' : ''}`} />
            Sync AniList
          </Button>
          <AddSourceSheet onSourceAdded={handleRefresh} />
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {sourcesError?.message || contentItemsError?.message || 'An error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* AniList Sync Message */}
      {aniListMessage && (
        <Alert variant={aniListMessage.type === 'error' ? 'destructive' : 'default'}>
          <Database className="h-4 w-4" />
          <AlertDescription>
            {aniListMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.length}</div>
            <p className="text-xs text-muted-foreground">
              {sources.filter(s => s.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
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
            <CardTitle className="text-sm font-medium">Processing Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProcessing}</div>
            <p className="text-xs text-muted-foreground">
              {failedProcessing} failed, {pendingProcessing} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Content Sources</CardTitle>
            <CardDescription>
              Manage RSS feeds and other content sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{sources.length}</p>
                <p className="text-sm text-muted-foreground">
                  {sources.filter(s => s.isActive).length} active sources
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/sources">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Items</CardTitle>
            <CardDescription>
              Monitor and manage content items from all sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{contentItems.length}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingNotifications} pending notifications
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/content">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RSS Backfill</CardTitle>
            <CardDescription>
              Fetch historical data from RSS feeds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Historical Data</p>
                  <p className="text-xs text-muted-foreground">
                    Paginate through older RSS pages
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBackfillDialogOpen(true)}
                className="w-full"
              >
                Start Backfill
              </Button>
              <p className="text-xs text-muted-foreground">
                ⚡ Throttled requests to respect server limits
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AniList Integration</CardTitle>
            <CardDescription>
              Sync anime series with AniList for rich metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sync Options</p>
                  <p className="text-xs text-muted-foreground">
                    Enrich series with covers & descriptions
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAniListSync(5)}
                  disabled={isAniListSyncing}
                  className="flex-1"
                >
                  <Database className={`h-3 w-3 mr-1 ${isAniListSyncing ? 'animate-spin' : ''}`} />
                  Sync 5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAniListSync(20)}
                  disabled={isAniListSyncing}
                  className="flex-1"
                >
                  <Database className={`h-3 w-3 mr-1 ${isAniListSyncing ? 'animate-spin' : ''}`} />
                  Sync 20
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚡ Rate limited to 30 requests/min. Syncing is automatic and respectful.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system performance and health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">API Status: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Database: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Processing: {processingItems} active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backfill Dialog */}
      <BackfillDialog
        open={backfillDialogOpen}
        onOpenChange={setBackfillDialogOpen}
        onSuccess={handleBackfillSuccess}
      />
    </div>
  );
} 
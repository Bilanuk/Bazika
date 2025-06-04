'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { Source, ContentItem, ProcessingStatus } from '@/hooks/useSources';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

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

export default function AdminDashboard() {
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
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
      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
} 
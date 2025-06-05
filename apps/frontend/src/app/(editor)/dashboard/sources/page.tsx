'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { sourcesColumns } from '@/components/data-table/sources-columns';
import { Source } from '@/hooks/useSources';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminOnly from '@/components/AdminOnly';

// Fetch function for React Query
async function fetchSources(): Promise<Source[]> {
  const response = await fetch('/api/sources');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.sources || [];
}

export default function SourcesPage() {
  // React Query hook
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

  const handleRefresh = async () => {
    await refetchSources();
  };

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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
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
              Manage RSS feeds and other content sources. Total: {sources.length} sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading sources...</span>
              </div>
            ) : (
              <DataTable
                columns={sourcesColumns}
                data={sources}
                searchKey="name"
                searchPlaceholder="Search sources..."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
} 
'use client';

import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Source {
  id: string;
  name: string;
  type: string;
  url: string;
  isActive: boolean;
}

interface BackfillResult {
  success: boolean;
  message: string;
  data?: {
    totalItems: number;
    newItems: number;
    sources: Array<{
      sourceId: string;
      sourceName: string;
      itemsFound: number;
      newItems: number;
      error?: string;
    }>;
  };
}

interface BackfillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Fetch sources for selection
async function fetchSources(): Promise<Source[]> {
  const response = await fetch('/api/sources?limit=100');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.sources || [];
}

// Start backfill operation
async function startBackfill(params: {
  sourceIds: string[];
  startPage: number;
  endPage: number;
  throttleMs: number;
}): Promise<BackfillResult> {
  const response = await fetch('/api/sources/backfill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export function BackfillDialog({ open, onOpenChange, onSuccess }: BackfillDialogProps) {
  const [selectedSourceIds, setSelectedSourceIds] = React.useState<string[]>([]);
  const [startPage, setStartPage] = React.useState(1);
  const [endPage, setEndPage] = React.useState(10);
  const [throttleMs, setThrottleMs] = React.useState(2000);
  const [result, setResult] = React.useState<BackfillResult | null>(null);

  // Fetch sources
  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ['sources-for-backfill'],
    queryFn: fetchSources,
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Backfill mutation
  const backfillMutation = useMutation({
    mutationFn: startBackfill,
    onSuccess: (data) => {
      setResult(data);
      if (data.success && onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start backfill',
      });
    },
  });

  // Filter to only show RSS sources
  const rssSources = sources.filter(source => source.type === 'RSS');

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSourceIds(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSourceIds.length === rssSources.length) {
      setSelectedSourceIds([]);
    } else {
      setSelectedSourceIds(rssSources.map(source => source.id));
    }
  };

  const handleStartBackfill = () => {
    if (selectedSourceIds.length === 0) return;

    backfillMutation.mutate({
      sourceIds: selectedSourceIds,
      startPage,
      endPage,
      throttleMs,
    });
  };

  const handleClose = () => {
    if (!backfillMutation.isPending) {
      setResult(null);
      setSelectedSourceIds([]);
      setStartPage(1);
      setEndPage(10);
      setThrottleMs(2000);
      onOpenChange(false);
    }
  };

  const isFormValid = selectedSourceIds.length > 0 && startPage >= 1 && endPage >= startPage;
  const totalPages = endPage - startPage + 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            RSS Feed Backfill
          </DialogTitle>
          <DialogDescription>
            Fetch historical data from RSS feeds by paginating through older pages.
            This will help you get content that might have been missed during regular monitoring.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6">
            {/* Source Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select RSS Sources</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={sourcesLoading || rssSources.length === 0}
                >
                  {selectedSourceIds.length === rssSources.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {sourcesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading sources...</span>
                </div>
              ) : rssSources.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No RSS sources found. Only RSS sources support backfilling.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {rssSources.map((source) => (
                    <div key={source.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={source.id}
                        checked={selectedSourceIds.includes(source.id)}
                        onCheckedChange={() => handleSourceToggle(source.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={source.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {source.name}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={source.isActive ? 'default' : 'secondary'} className="text-xs">
                            {source.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {source.url}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSourceIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedSourceIds.length} source{selectedSourceIds.length === 1 ? '' : 's'} selected
                </div>
              )}
            </div>

            <Separator />

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPage">Start Page</Label>
                <Input
                  id="startPage"
                  type="number"
                  min="1"
                  value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endPage">End Page</Label>
                <Input
                  id="endPage"
                  type="number"
                  min="1"
                  value={endPage}
                  onChange={(e) => setEndPage(Math.max(startPage, parseInt(e.target.value) || startPage))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="throttleMs">Throttle Delay (ms)</Label>
              <Input
                id="throttleMs"
                type="number"
                min="500"
                step="500"
                value={throttleMs}
                onChange={(e) => setThrottleMs(Math.max(500, parseInt(e.target.value) || 2000))}
              />
              <p className="text-xs text-muted-foreground">
                Delay between requests to avoid overwhelming the server. Minimum 500ms recommended.
              </p>
            </div>

            {/* Summary */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will fetch {totalPages} page{totalPages === 1 ? '' : 's'} from {selectedSourceIds.length} source{selectedSourceIds.length === 1 ? '' : 's'} 
                with a {throttleMs}ms delay between requests.
                {totalPages > 10 && (
                  <span className="text-amber-600 font-medium">
                    {' '}Large page ranges may take a long time to complete.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          /* Results */
          <div className="space-y-4">
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>

            {result.success && result.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{result.data.totalItems}</div>
                    <div className="text-sm text-muted-foreground">Total Items Found</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.data.newItems}</div>
                    <div className="text-sm text-muted-foreground">New Items Added</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Source Results</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.data.sources.map((source) => (
                      <div key={source.sourceId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{source.sourceName}</div>
                          {source.error && (
                            <div className="text-sm text-red-600">{source.error}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium">{source.newItems}</span> new / {source.itemsFound} total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={backfillMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleStartBackfill}
                disabled={!isFormValid || backfillMutation.isPending}
              >
                {backfillMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Backfill...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Start Backfill
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
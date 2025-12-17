'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, RefreshCw, MoreHorizontal, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentItem {
  id: string;
  title: string;
  quality: string | null;
  processingStatus: string;
  source?: {
    name: string;
  };
}

interface EpisodeContentItemsTableProps {
  items: ContentItem[];
  episodeId: string;
  isAdmin?: boolean;
}

const QUALITY_FILTER_KEY = 'episode-content-items-quality-filter';

export function EpisodeContentItemsTable({ items, episodeId, isAdmin = false }: EpisodeContentItemsTableProps) {
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  // Load saved quality filter from localStorage
  useEffect(() => {
    const savedFilter = localStorage.getItem(QUALITY_FILTER_KEY);
    if (savedFilter) {
      setQualityFilter(savedFilter);
    }
  }, []);

  // Save quality filter to localStorage when it changes
  const handleQualityChange = (value: string) => {
    setQualityFilter(value);
    localStorage.setItem(QUALITY_FILTER_KEY, value);
  };

  // Filter items by quality
  const filteredItems = qualityFilter === 'all' 
    ? items 
    : items.filter(item => item.quality === qualityFilter);

  // Get unique qualities from items
  const availableQualities = Array.from(new Set(items.map(item => item.quality).filter(Boolean))).sort();

  const handleProcess = async (itemId: string) => {
    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch(`/api/content-items/${itemId}/process`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start processing');
      }

      toast.success('Processing started!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error processing item:', error);
      const errorMessage = error?.message || 'Failed to start processing';
      toast.error(errorMessage);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleReprocess = async (itemId: string) => {
    const confirmed = window.confirm('Are you sure you want to reprocess this item? This will delete existing processed files and start over.');
    
    if (!confirmed) {
      return;
    }

    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch(`/api/content-items/${itemId}/reprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start reprocessing');
      }

      toast.success('Reprocessing started!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error reprocessing item:', error);
      const errorMessage = error?.message || 'Failed to start reprocessing';
      toast.error(errorMessage);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleAnalyze = async (itemId: string) => {
    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await fetch(`/api/content-items/${itemId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to queue analysis');
      }

      toast.success('Analysis queued!');
    } catch (error: any) {
      console.error('Error analyzing item:', error);
      const errorMessage = error?.message || 'Failed to queue analysis';
      toast.error(errorMessage);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      NONE: { variant: 'outline', label: 'Not Processed' },
      DOWNLOAD_QUEUED: { variant: 'secondary', label: 'Queued' },
      DOWNLOADING: { variant: 'default', label: 'Downloading' },
      DOWNLOAD_COMPLETED: { variant: 'default', label: 'Downloaded' },
      DOWNLOAD_FAILED: { variant: 'destructive', label: 'Failed' },
      PROCESSING_QUEUED: { variant: 'secondary', label: 'Processing Queued' },
      PROCESSING: { variant: 'default', label: 'Processing' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      FAILED: { variant: 'destructive', label: 'Failed' },
    };

    const config = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canProcess = (status: string) => {
    return status === 'NONE';
  };

  const canReprocess = (status: string) => {
    const inProgressStatuses = ['DOWNLOAD_QUEUED', 'DOWNLOADING', 'PROCESSING_QUEUED', 'PROCESSING'];
    const notProcessedStatuses = ['NONE'];
    return !inProgressStatuses.includes(status) && !notProcessedStatuses.includes(status);
  };

  const canAnalyze = (status: string) => {
    return ['COMPLETED', 'DOWNLOAD_COMPLETED', 'PROCESSING_COMPLETED'].includes(status);
  };

  if (items.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No content items found for this episode.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Quality Filter */}
      {isAdmin && availableQualities.length > 0 && (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Quality:</span>
          <Select value={qualityFilter} onValueChange={handleQualityChange}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='All qualities' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All qualities</SelectItem>
              {availableQualities.map((quality) => (
                <SelectItem key={quality} value={quality!}>
                  {quality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-sm text-muted-foreground'>
            ({filteredItems.length} of {items.length} items)
          </span>
        </div>
      )}

      {/* Table */}
      <div className='border rounded-lg'>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className='w-[100px]'>Quality</TableHead>
            <TableHead className='w-[120px]'>Source</TableHead>
            <TableHead className='w-[150px]'>Status</TableHead>
            {isAdmin && <TableHead className='w-[50px]'></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className='text-center py-8 text-muted-foreground'>
                No content items match the selected quality filter.
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className='font-medium text-sm max-w-[400px] truncate' title={item.title}>
                {item.title}
              </TableCell>
              <TableCell>
                {item.quality ? (
                  <Badge variant='outline'>{item.quality}</Badge>
                ) : (
                  <span className='text-muted-foreground text-xs'>N/A</span>
                )}
              </TableCell>
              <TableCell>
                <span className='text-sm text-muted-foreground'>
                  {item.source?.name || 'Unknown'}
                </span>
              </TableCell>
              <TableCell>
                {getStatusBadge(item.processingStatus)}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={processingItems.has(item.id)}>
                        {processingItems.has(item.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {canProcess(item.processingStatus) && (
                        <DropdownMenuItem onClick={() => handleProcess(item.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Process (Download)
                        </DropdownMenuItem>
                      )}
                      
                      {canReprocess(item.processingStatus) && (
                        <DropdownMenuItem onClick={() => handleReprocess(item.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reprocess Full
                        </DropdownMenuItem>
                      )}

                      {canAnalyze(item.processingStatus) && (
                        <DropdownMenuItem onClick={() => handleAnalyze(item.id)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Re-analyze
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

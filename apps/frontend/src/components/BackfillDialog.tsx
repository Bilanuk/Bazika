'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface Source {
  id: string;
  name: string;
  url: string;
}

interface BackfillItem {
  title: string;
  link: string;
  pubDate?: string;
  episodeNumber?: number;
  quality?: string;
  infoHash?: string;
  description?: string;
  exists?: boolean;
}

interface BackfillDialogProps {
  serialId: string;
  serialTitle: string;
  sources: Source[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BackfillDialog({
  serialId,
  serialTitle,
  sources,
  open,
  onClose,
  onSuccess,
}: BackfillDialogProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [items, setItems] = useState<BackfillItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [totalFound, setTotalFound] = useState(0);
  
  // Filters
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [hideExisting, setHideExisting] = useState(true);

  const filteredItems = items.filter(item => {
    if (hideExisting && item.exists) return false;
    if (qualityFilter !== 'all' && item.quality !== qualityFilter) return false;
    return true;
  });

  const handleSearch = async () => {
    if (!selectedSourceId) return;

    try {
      setSearching(true);
      setItems([]);
      setSelectedItems(new Set());

      const response = await fetch('/api/sources/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialId,
          sourceId: selectedSourceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();
      setItems(data.items || []);
      setSearchQuery(data.searchQuery);
      setTotalFound(data.totalFound);
      
      // Auto-select valid non-existing items (assuming default filters)
      const validIndices = new Set<number>();
      data.items.forEach((item: any, idx: number) => {
        if (!item.exists) {
          validIndices.add(idx);
        }
      });
      setSelectedItems(validIndices);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Failed to search for items');
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async () => {
    // Filter items based on selection AND current filters
    const itemsToImport = items.filter((item, idx) => {
      if (!selectedItems.has(idx)) return false;
      
      // Apply active filters
      if (hideExisting && item.exists) return false;
      if (qualityFilter !== 'all' && item.quality !== qualityFilter) return false;
      
      return true;
    });

    if (itemsToImport.length === 0) return;

    try {
      setLoading(true);

      const response = await fetch('/api/sources/backfill/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialId,
          sourceId: selectedSourceId,
          items: itemsToImport,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to import');
      }

      const data = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        // Construct error message
        const errorDetails = data.errors.map((err: any) => 
          `- ${err.title}: ${err.error}`
        ).join('\n');
        
        toast.warning(`Imported ${data.imported} items with some errors`, {
          description: (
            <div className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-xs font-mono mt-2">
              {errorDetails}
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast.success(`Successfully imported ${data.imported} items!`);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error importing:', error);
      toast.error('Failed to import items');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const toggleAll = () => {
    const visibleIndices = items
      .map((_, idx) => idx)
      .filter(idx => {
        const item = items[idx];
        if (hideExisting && item.exists) return false;
        if (qualityFilter !== 'all' && item.quality !== qualityFilter) return false;
        return true;
      });

    const allVisibleSelected = visibleIndices.every(idx => selectedItems.has(idx));

    if (allVisibleSelected) {
      const newSelected = new Set(selectedItems);
      visibleIndices.forEach(idx => newSelected.delete(idx));
      setSelectedItems(newSelected);
    } else {
      const newSelected = new Set(selectedItems);
      visibleIndices.forEach(idx => newSelected.add(idx));
      setSelectedItems(newSelected);
    }
  };

  const getImportCount = () => {
    return items.filter((item, idx) => {
      if (!selectedItems.has(idx)) return false;
      if (hideExisting && item.exists) return false;
      if (qualityFilter !== 'all' && item.quality !== qualityFilter) return false;
      return true;
    }).length;
  };

  const importCount = getImportCount();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Backfill Episodes</DialogTitle>
          <DialogDescription>
            Search and import old episodes for <span className='font-medium'>{serialTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 flex-1 overflow-hidden flex flex-col'>
          {/* Source Selection */}
          <div className='space-y-2'>
            <Label>Select Source</Label>
            <div className='flex gap-2'>
              <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder='Choose a source...' />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={!selectedSourceId || searching}>
                {searching ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Search className='h-4 w-4' />
                )}
                <span className='ml-2'>Search</span>
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className='text-sm text-muted-foreground'>
              Searched for: <span className='font-medium'>{searchQuery}</span> • Found {totalFound} items
            </div>
          )}

          {items.length > 0 && (
            <>
              {/* Filters */}
              <div className='flex items-center gap-4 p-2 bg-secondary/20 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger className='w-[120px] h-8'>
                      <SelectValue placeholder='Quality' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Qualities</SelectItem>
                      <SelectItem value='1080p'>1080p</SelectItem>
                      <SelectItem value='720p'>720p</SelectItem>
                      <SelectItem value='480p'>480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className='flex items-center gap-2'>
                  <Checkbox 
                    id='hide-existing' 
                    checked={hideExisting}
                    onCheckedChange={(c) => setHideExisting(!!c)}
                  />
                  <Label htmlFor='hide-existing' className='text-sm cursor-pointer'>Hide existing</Label>
                </div>

                <div className='ml-auto text-xs text-muted-foreground'>
                  Showing {filteredItems.length} of {items.length}
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={filteredItems.length > 0 && filteredItems.every(item => selectedItems.has(items.indexOf(item)))}
                    onCheckedChange={toggleAll}
                  />
                  <Label className='text-sm'>
                    Select All ({selectedItems.size} selected)
                  </Label>
                </div>
              </div>

              <div className='flex-1 min-h-0 border rounded-lg overflow-y-auto'>
                <div className='space-y-2 p-4'>
                  {filteredItems.map((item) => {
                    const index = items.indexOf(item);
                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedItems.has(index) ? 'bg-accent' : ''
                        } ${item.exists ? 'opacity-60 bg-muted/50' : ''}`}
                        onClick={() => toggleItem(index)}
                      >
                        <div className='flex items-start gap-3'>
                          <Checkbox
                            checked={selectedItems.has(index)}
                            onCheckedChange={() => toggleItem(index)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                              <p className='font-medium text-sm break-words'>{item.title}</p>
                              {item.exists && (
                                <Badge variant='outline' className='text-[10px] h-5'>Existing</Badge>
                              )}
                            </div>
                            <div className='flex gap-2 mt-1'>
                              {item.episodeNumber && (
                                <Badge variant='secondary' className='text-xs'>
                                  Ep {item.episodeNumber}
                                </Badge>
                              )}
                              {item.quality && (
                                <Badge variant='outline' className='text-xs'>
                                  {item.quality}
                                </Badge>
                              )}
                              {item.pubDate && (
                                <span className='text-xs text-muted-foreground'>
                                  {new Date(item.pubDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {items.length === 0 && searchQuery && !searching && (
            <div className='text-center py-8 text-muted-foreground'>
              No new items found. All episodes might already be imported.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={importCount === 0 || loading}
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Download className='h-4 w-4 mr-2' />
            )}
            Import {importCount} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

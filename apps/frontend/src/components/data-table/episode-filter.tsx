'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  serialId: string;
  serial: {
    id: string;
    title: string;
  };
}

interface EpisodeFilterProps {
  selectedSerialIds: string[];
  selectedEpisodeNumbers: string[];
  onEpisodeChange: (episodeNumbers: string[]) => void;
}

// Fetch episodes based on selected serials and search
async function fetchEpisodes(serialIds: string[], search: string = ''): Promise<Episode[]> {
  if (serialIds.length === 0) return [];
  
  const params = new URLSearchParams();
  if (search) {
    params.append('episodeSearch', search);
  }
  
  // Fetch episodes for each selected serial
  const episodePromises = serialIds.map(async (serialId) => {
    const serialParams = new URLSearchParams(params);
    serialParams.append('serialId', serialId);
    
    const response = await fetch(`/api/content-items/filters?${serialParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.episodes || [];
  });
  
  const episodeArrays = await Promise.all(episodePromises);
  const allEpisodes = episodeArrays.flat();
  
  // Remove duplicates based on episode ID
  const uniqueEpisodes = allEpisodes.filter((episode, index, self) => 
    index === self.findIndex(e => e.id === episode.id)
  );
  
  return uniqueEpisodes;
}

export function EpisodeFilter({ selectedSerialIds, selectedEpisodeNumbers, onEpisodeChange }: EpisodeFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch episodes based on selected serials and search
  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['episodes-filter', selectedSerialIds, debouncedSearch],
    queryFn: () => fetchEpisodes(selectedSerialIds, debouncedSearch),
    enabled: selectedSerialIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleEpisodeToggle = (episodeNumber: string) => {
    const newSelection = selectedEpisodeNumbers.includes(episodeNumber)
      ? selectedEpisodeNumbers.filter(num => num !== episodeNumber)
      : [...selectedEpisodeNumbers, episodeNumber];
    onEpisodeChange(newSelection);
  };

  const handleClearAll = () => {
    onEpisodeChange([]);
  };

  const selectedCount = selectedEpisodeNumbers.length;
  const isDisabled = selectedSerialIds.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-64 justify-between"
            disabled={isDisabled}
          >
            {selectedCount === 0 ? (
              isDisabled ? "Select serial first" : "Select episodes..."
            ) : (
              `${selectedCount} episode${selectedCount === 1 ? '' : 's'} selected`
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search episodes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading episodes...</div>
              ) : episodes.length === 0 ? (
                <CommandEmpty>
                  {selectedSerialIds.length === 0 
                    ? "Select a serial first" 
                    : "No episodes found"}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {episodes.map((episode) => (
                    <CommandItem
                      key={episode.id}
                      value={episode.episodeNumber.toString()}
                      onSelect={() => handleEpisodeToggle(episode.episodeNumber.toString())}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedEpisodeNumbers.includes(episode.episodeNumber.toString())
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Ep. {episode.episodeNumber}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {episode.title}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected episodes badges */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEpisodeNumbers.slice(0, 3).map((episodeNumber) => {
            const episode = episodes.find(e => e.episodeNumber.toString() === episodeNumber);
            return (
              <Badge key={episodeNumber} variant="secondary" className="text-xs">
                Ep. {episodeNumber}
                <button
                  onClick={() => handleEpisodeToggle(episodeNumber)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedCount > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedCount - 3} more
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
} 
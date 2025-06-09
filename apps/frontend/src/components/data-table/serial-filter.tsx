'use client';

import React from 'react';
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

interface Serial {
  id: string;
  title: string;
}

interface SerialFilterProps {
  serials: Serial[];
  selectedSerialTitles: string[];
  onSerialChange: (serialTitles: string[]) => void;
}

export function SerialFilter({ serials, selectedSerialTitles, onSerialChange }: SerialFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Filter serials based on search
  const filteredSerials = React.useMemo(() => {
    if (!search) return serials;
    return serials.filter(serial =>
      serial.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [serials, search]);

  const handleSerialToggle = (serialTitle: string) => {
    const newSelection = selectedSerialTitles.includes(serialTitle)
      ? selectedSerialTitles.filter(title => title !== serialTitle)
      : [...selectedSerialTitles, serialTitle];
    onSerialChange(newSelection);
  };

  const handleClearAll = () => {
    onSerialChange([]);
  };

  const selectedCount = selectedSerialTitles.length;

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-64 justify-between"
          >
            {selectedCount === 0 ? (
              "Select serials..."
            ) : (
              `${selectedCount} serial${selectedCount === 1 ? '' : 's'} selected`
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search serials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              {filteredSerials.length === 0 ? (
                <CommandEmpty>
                  {search ? "No serials found" : "No serials available"}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {/* Add "No serial" option */}
                  <CommandItem
                    key="no-serial"
                    value="No serial"
                    onSelect={() => handleSerialToggle('No serial')}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSerialTitles.includes('No serial')
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="text-muted-foreground">No Serial</span>
                  </CommandItem>
                  
                  {filteredSerials.map((serial) => (
                    <CommandItem
                      key={serial.id}
                      value={serial.title}
                      onSelect={() => handleSerialToggle(serial.title)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSerialTitles.includes(serial.title)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="truncate">{serial.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected serials badges */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSerialTitles.slice(0, 3).map((serialTitle) => (
            <Badge key={serialTitle} variant="secondary" className="text-xs">
              {serialTitle === 'No serial' ? 'No Serial' : serialTitle}
              <button
                onClick={() => handleSerialToggle(serialTitle)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
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
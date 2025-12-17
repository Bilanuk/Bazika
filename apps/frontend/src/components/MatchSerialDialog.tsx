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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  source: {
    name: string;
  };
}

interface Serial {
  id: string;
  title: string;
  imageUrl?: string;
}

interface AniListResult {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    large: string;
  };
  description: string;
}

interface MatchSerialDialogProps {
  item: ContentItem;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatchSerialDialog({ item, open, onClose, onSuccess }: MatchSerialDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [existingSerials, setExistingSerials] = useState<Serial[]>([]);
  const [anilistResults, setAnilistResults] = useState<AniListResult[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<Serial | null>(null);
  const [selectedAnilist, setSelectedAnilist] = useState<AniListResult | null>(null);
  const [saveMapping, setSaveMapping] = useState(true);
  const [loading, setLoading] = useState(false);

  const searchExistingSerials = async () => {
    if (!searchQuery) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/serials/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setExistingSerials(data.serials || []);
    } catch (error) {
      console.error('Failed to search serials:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchAniList = async () => {
    if (!searchQuery) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/anilist/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setAnilistResults(data.results || []);
    } catch (error) {
      console.error('Failed to search AniList:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchExisting = async () => {
    if (!selectedSerial) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/content-items/${item.id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialId: selectedSerial.id,
          saveMapping,
          mappingTitle: extractSeriesName(item.title),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.autoMatchedCount > 0) {
          alert(`Successfully matched! Also auto-matched ${data.autoMatchedCount} other items with the same title.`);
        }
        onSuccess();
      } else {
        console.error('Failed to match item');
      }
    } catch (error) {
      console.error('Error matching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromAniList = async () => {
    if (!selectedAnilist) return;

    try {
      setLoading(true);
      
      // 1. Create serial from AniList
      const createResponse = await fetch('/api/serials/from-anilist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anilistId: selectedAnilist.id }),
      });

      if (!createResponse.ok) {
        console.error('Failed to create serial');
        return;
      }

      const { serial } = await createResponse.json();

      // 2. Match item to new serial
      const matchResponse = await fetch(`/api/content-items/${item.id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialId: serial.id,
          saveMapping,
          mappingTitle: extractSeriesName(item.title),
        }),
      });

      if (matchResponse.ok) {
        const data = await matchResponse.json();
        if (data.autoMatchedCount > 0) {
          alert(`Successfully matched! Also auto-matched ${data.autoMatchedCount} other items with the same title.`);
        }
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating serial:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract series name from title (basic implementation)
  const extractSeriesName = (title: string): string => {
    // Remove release group
    let clean = title.replace(/^\[([^\]]+)\]\s*/, '');
    // Remove episode number and everything after
    clean = clean.replace(/\s*-\s*\d+.*$/, '');
    return clean.trim();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Match Content Item to Serial</DialogTitle>
          <DialogDescription>
            <span className='font-medium'>{item.title}</span>
            <br />
            <span className='text-xs'>Source: {item.source.name}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='existing' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='existing'>Match Existing</TabsTrigger>
            <TabsTrigger value='create'>Create New</TabsTrigger>
          </TabsList>

          <TabsContent value='existing' className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Search existing serials...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchExistingSerials()}
              />
              <Button onClick={searchExistingSerials} disabled={loading}>
                <Search className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {existingSerials.map((serial) => (
                <div
                  key={serial.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                    selectedSerial?.id === serial.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedSerial(serial)}
                >
                  <div className='flex items-center gap-3'>
                    {serial.imageUrl && (
                      <img
                        src={serial.imageUrl}
                        alt={serial.title}
                        className='w-12 h-16 object-cover rounded'
                      />
                    )}
                    <div>
                      <p className='font-medium'>{serial.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='saveMapping'
                checked={saveMapping}
                onCheckedChange={(checked) => setSaveMapping(checked as boolean)}
              />
              <Label htmlFor='saveMapping' className='text-sm'>
                Save mapping rule for future items with similar names
              </Label>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleMatchExisting} disabled={!selectedSerial || loading}>
                Match to Serial
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value='create' className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Search AniList...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchAniList()}
              />
              <Button onClick={searchAniList} disabled={loading}>
                <Search className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {anilistResults.map((anime) => (
                <div
                  key={anime.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                    selectedAnilist?.id === anime.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedAnilist(anime)}
                >
                  <div className='flex items-center gap-3'>
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.romaji}
                      className='w-12 h-16 object-cover rounded'
                    />
                    <div>
                      <p className='font-medium'>{anime.title.english || anime.title.romaji}</p>
                      <p className='text-xs text-muted-foreground'>{anime.title.native}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='saveMappingCreate'
                checked={saveMapping}
                onCheckedChange={(checked) => setSaveMapping(checked as boolean)}
              />
              <Label htmlFor='saveMappingCreate' className='text-sm'>
                Save mapping rule for future items with similar names
              </Label>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreateFromAniList} disabled={!selectedAnilist || loading}>
                <Plus className='h-4 w-4 mr-2' />
                Create & Match
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}




'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Settings,
  RefreshCw,
  Download,
  Database,
  AlertCircle,
  CheckCircle,
  History,
  } from 'lucide-react';
import { Serial } from '@database';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRoles } from '@/types/user-roles';
import { BackfillDialog } from './BackfillDialog';

interface SerialAdminSheetProps {
  serial: Serial & { episodes?: any[] };
  user?: { role?: string } | null;
}

export default function SerialAdminSheet({ serial, user }: SerialAdminSheetProps) {
  const router = useRouter();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdatingAnilistId, setIsUpdatingAnilistId] = useState(false);
  const [torrentUrl, setTorrentUrl] = useState('');
  const [anilistId, setAnilistId] = useState(serial.anilistId?.toString() || '');
  const [currentAnilistId, setCurrentAnilistId] = useState(serial.anilistId);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showBackfillDialog, setShowBackfillDialog] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);

  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const response = await fetch('/api/sources');
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoadingSources(false);
    }
  };

  // Fetch sources when backfill dialog is opened
  useEffect(() => {
    if (showBackfillDialog && sources.length === 0) {
      fetchSources();
    }
  }, [showBackfillDialog, sources.length]);

  // Only show admin button for admin users
  if (!user || user.role !== UserRoles.ADMIN) {
    return null;
  }

  const handleRefetchAniList = async () => {
    setIsRefetching(true);
    setMessage(null);

    try {
      // TODO: Implement AniList refetch API call
      const response = await fetch(
        `/api/serials/${serial.id}/refetch-anilist`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Successfully refetched data from AniList!',
        });
        // Optionally refresh the page or update the data
        router.refresh();
      } else {
        throw new Error('Failed to refetch data');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to refetch data from AniList. Please try again.',
      });
    } finally {
      setIsRefetching(false);
    }
  };

  const handleUpdateAnilistId = async () => {
    if (!anilistId.trim() || isNaN(Number(anilistId))) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid AniList ID (numeric).',
      });
      return;
    }

    setIsUpdatingAnilistId(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/serials/${serial.id}/update-anilist-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anilistId: Number(anilistId) }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentAnilistId(Number(anilistId));
        setMessage({
          type: 'success',
          text: 'AniList ID updated successfully!',
        });
      } else {
        throw new Error('Failed to update AniList ID');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update AniList ID. Please try again.',
      });
    } finally {
      setIsUpdatingAnilistId(false);
    }
  };

  const handleTorrentDownload = async () => {
    if (!torrentUrl.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid torrent URL or magnet link.',
      });
      return;
    }

    setIsDownloading(true);
    setMessage(null);

    try {
      // TODO: Implement torrent download API call
      const response = await fetch(
        `/api/serials/${serial.id}/download-torrent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ torrentUrl }),
        }
      );

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Torrent download initiated successfully!',
        });
        setTorrentUrl('');
      } else {
        throw new Error('Failed to initiate download');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to initiate torrent download. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Settings className='h-4 w-4' />
          Admin
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Serial Administration
          </SheetTitle>
          <SheetDescription>
            Manage and control "{serial.title}" settings and data.
          </SheetDescription>
        </SheetHeader>

        <div className='grid flex-1 auto-rows-min gap-6 py-6'>
          {/* Status Message */}
          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
            >
              {message.type === 'success' ? (
                <CheckCircle className='h-4 w-4' />
              ) : (
                <AlertCircle className='h-4 w-4' />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* AniList Data Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4' />
              <Label className='text-base font-semibold'>AniList Data</Label>
            </div>
            
            {/* AniList ID Field */}
            <div className='space-y-2'>
              <Label htmlFor='anilist-id'>AniList ID</Label>
              <div className='flex gap-2'>
                <Input
                  id='anilist-id'
                  placeholder='Enter AniList ID (e.g., 21)'
                  value={anilistId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAnilistId(e.target.value)
                  }
                  className='flex-1'
                />
                <Button
                  onClick={handleUpdateAnilistId}
                  disabled={isUpdatingAnilistId || !anilistId.trim()}
                  size='sm'
                  variant='outline'
                >
                  {isUpdatingAnilistId ? 'Updating...' : 'Update'}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                Current ID: {currentAnilistId || 'Not set'}
              </p>
            </div>

            <p className='text-sm text-muted-foreground'>
              Refetch the latest information from AniList including title,
              description, images, and metadata.
            </p>
            <Button
              onClick={handleRefetchAniList}
              disabled={isRefetching || !currentAnilistId}
              className='w-full gap-2'
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
              />
              {isRefetching ? 'Refetching...' : 'Refetch from AniList'}
            </Button>
            {!currentAnilistId && (
              <p className='text-xs text-amber-600'>
                Set an AniList ID first to enable refetching
              </p>
            )}
          </div>

          {/* Backfill Episodes Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <History className='h-4 w-4' />
              <Label className='text-base font-semibold'>Backfill Episodes</Label>
            </div>
            <p className='text-sm text-muted-foreground'>
              Search and import old episodes from RSS sources that weren't in the feed.
            </p>
            <Button
              onClick={() => setShowBackfillDialog(true)}
              className='w-full gap-2'
              variant='outline'
            >
              <History className='h-4 w-4' />
              Open Backfill Tool
            </Button>
          </div>

          {/* Torrent Download Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Download className='h-4 w-4' />
              <Label className='text-base font-semibold'>Manual Download</Label>
            </div>
            <p className='text-sm text-muted-foreground'>
              Manually trigger a torrent download and processing for this
              serial.
            </p>
            <div className='space-y-2'>
              <Label htmlFor='torrent-url'>Torrent URL or Magnet Link</Label>
              <Textarea
                id='torrent-url'
                placeholder='magnet:?xt=urn:btih:... or https://example.com/torrent.torrent'
                value={torrentUrl}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setTorrentUrl(e.target.value)
                }
                rows={3}
              />
            </div>
            <Button
              onClick={handleTorrentDownload}
              disabled={isDownloading || !torrentUrl.trim()}
              className='w-full gap-2'
            >
              <Download
                className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`}
              />
              {isDownloading ? 'Initiating Download...' : 'Download & Process'}
            </Button>
          </div>

          {/* Serial Info */}
          <div className='space-y-2 border-t pt-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              Serial Information
            </Label>
            <div className='space-y-1 text-xs text-muted-foreground'>
              <p>
                <strong>ID:</strong> {serial.id}
              </p>
              <p>
                <strong>AniList ID:</strong> {currentAnilistId || 'Not set'}
              </p>
              <p>
                <strong>Episodes:</strong> {serial.episodes?.length || 0}
              </p>
              <p>
                <strong>Rating:</strong> {serial.rating}/5
              </p>
            </div>
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>

      {/* Backfill Dialog */}
      <BackfillDialog
        serialId={serial.id}
        serialTitle={serial.title}
        sources={sources}
        open={showBackfillDialog}
        onClose={() => setShowBackfillDialog(false)}
        onSuccess={() => {
          setMessage({
            type: 'success',
            text: 'Episodes imported successfully!',
          });
          router.refresh();
        }}
      />
    </Sheet>
  );
}

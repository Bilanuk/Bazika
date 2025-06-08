'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  ExternalLink,
  MoreHorizontal,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ContentItem, ProcessingStatus } from '@/hooks/useSources';

// Helper function to handle torrent download
const handleDownloadTorrent = async (contentItem: ContentItem) => {
  try {
    const response = await fetch(`/api/content-items/${contentItem.id}/download`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to queue download');
    }

    // Show success message (you can replace with proper toast notification)
    alert('Download queued successfully!');
  } catch (error) {
    console.error('Error queuing download:', error);
    // Show error message (you can replace with proper toast notification)
    alert(`Failed to queue download: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to check if URL is a torrent
const isTorrentUrl = (url: string): boolean => {
  return url.startsWith('magnet:') || url.endsWith('.torrent');
};

export const contentItemsColumns: ColumnDef<ContentItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
      const url = row.original.url;
      return (
        <div className='max-w-[300px]'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 font-medium hover:text-primary hover:underline'
          >
            <span className='truncate'>{title}</span>
            <ExternalLink className='h-3 w-3 flex-shrink-0' />
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return (
        <div className='max-w-[200px] truncate text-sm text-muted-foreground'>
          {description || 'No description'}
        </div>
      );
    },
  },
  {
    accessorKey: 'source.name',
    header: 'Source',
    cell: ({ row }) => {
      const source = row.original.source;
      return <Badge variant='outline'>{source?.name || 'Unknown'}</Badge>;
    },
  },
  {
    accessorKey: 'notificationSent',
    header: 'Notifications',
    cell: ({ row }) => {
      const notificationSent = row.getValue('notificationSent') as boolean;
      return (
        <Badge variant={notificationSent ? 'default' : 'secondary'}>
          {notificationSent ? 'Sent' : 'Pending'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'processingStatus',
    header: 'Processing',
    cell: ({ row }) => {
      const status = row.getValue('processingStatus') as ProcessingStatus;
      const getStatusVariant = (status: ProcessingStatus) => {
        switch (status) {
          case ProcessingStatus.COMPLETED:
            return 'default';
          case ProcessingStatus.PROCESSING:
            return 'secondary';
          case ProcessingStatus.QUEUED:
            return 'outline';
          case ProcessingStatus.FAILED:
            return 'destructive';
          case ProcessingStatus.SKIPPED:
            return 'secondary';
          default:
            return 'outline';
        }
      };

      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Published
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const publishedAt = row.getValue('publishedAt') as string;
      return (
        <div className='text-sm'>{new Date(publishedAt).toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Added
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      return (
        <div className='text-sm'>{new Date(createdAt).toLocaleString()}</div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const contentItem = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(contentItem.id)}
            >
              Copy item ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(contentItem.url)}
            >
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a
                href={contentItem.url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2'
              >
                Open link
                <ExternalLink className='h-3 w-3' />
              </a>
            </DropdownMenuItem>
            {isTorrentUrl(contentItem.url) && (
              <DropdownMenuItem
                onClick={() => handleDownloadTorrent(contentItem)}
                className="flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                Download Torrent
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Queue for processing</DropdownMenuItem>
            <DropdownMenuItem>Mark notification as sent</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive'>
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

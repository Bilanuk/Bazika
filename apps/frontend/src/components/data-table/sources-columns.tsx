'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Source } from '@/hooks/useSources';
import { useState } from 'react';

function AutoDownloadToggle({ source }: { source: Source }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [checked, setChecked] = useState(source.autoDownloadEnabled ?? false);

  const handleToggle = async (newValue: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/sources', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: source.id,
          autoDownloadEnabled: newValue,
        }),
      });

      if (response.ok) {
        setChecked(newValue);
      } else {
        const errorData = await response.json();
        console.error('Failed to update auto download setting:', errorData.error);
        // Revert the change on error
        setChecked(!newValue);
      }
    } catch (error) {
      console.error('Error updating auto download setting:', error);
      // Revert the change on error
      setChecked(!newValue);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <Switch
        checked={checked}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        aria-label="Auto download enabled"
      />
    </div>
  );
}

export const sourcesColumns: ColumnDef<Source>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      const cellValue = row.getValue(columnId) as string;
      return filterValue.includes(cellValue);
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'RSS' ? 'default' : 'secondary'}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
        {row.getValue('url')}
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      const cellValue = row.getValue(columnId) as boolean;
      const stringValue = cellValue.toString();
      return filterValue.includes(stringValue);
    },
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastChecked',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Checked
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastChecked = row.getValue('lastChecked') as string | null;
      return (
        <div className="text-sm">
          {lastChecked
            ? new Date(lastChecked).toLocaleString()
            : 'Never'}
        </div>
      );
    },
  },
  {
    accessorKey: 'contentItems',
    header: 'Items',
    cell: ({ row }) => {
      const contentItems = row.getValue('contentItems') as any[] | undefined;
      return (
        <div className="text-sm">
          {contentItems?.length || 0}
        </div>
      );
    },
  },
  {
    accessorKey: 'autoDownloadEnabled',
    header: 'Auto Download',
    cell: ({ row }) => {
      const source = row.original;
      return <AutoDownloadToggle source={source} />;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const source = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(source.id)}
            >
              Copy source ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit source</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete source
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 
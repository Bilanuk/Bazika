'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MatchSerialDialog } from './MatchSerialDialog';

interface ContentItem {
  id: string;
  title: string;
  publishedAt: string;
  quality: string | null;
  source: {
    name: string;
  };
}

export function PendingItemsTable() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      // Fetch items where serialId is null
      const response = await fetch('/api/content-items?limit=100');
      const data = await response.json();
      
      // Filter items without serial
      const pending = data.contentItems.filter((item: any) => !item.serialId);
      setItems(pending);
    } catch (error) {
      console.error('Failed to fetch pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSuccess = () => {
    setSelectedItem(null);
    fetchPendingItems(); // Refresh list
  };

  if (loading) {
    return <div>Loading pending items...</div>;
  }

  if (items.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No pending items found. All content is matched!</p>
      </div>
    );
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className='font-medium max-w-md truncate'>
                  {item.title}
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>{item.source.name}</Badge>
                </TableCell>
                <TableCell>
                  {item.quality ? (
                    <Badge variant='secondary'>{item.quality}</Badge>
                  ) : (
                    <span className='text-muted-foreground text-sm'>N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(item.publishedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelectedItem(item)}
                  >
                    Match Serial
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedItem && (
        <MatchSerialDialog
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={handleMatchSuccess}
        />
      )}
    </>
  );
}




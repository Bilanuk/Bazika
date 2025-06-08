'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  AlertCircle,
  CheckCircle,
  Rss,
  Globe,
  Code,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRoles } from '@/types/user-roles';

interface AddSourceSheetProps {
  onSourceAdded?: () => void;
}

enum SourceType {
  RSS = 'RSS',
  API = 'API',
  SCRAPER = 'SCRAPER',
}

export default function AddSourceSheet({ onSourceAdded }: AddSourceSheetProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: SourceType.RSS,
    url: '',
    isActive: true,
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Only show for admin users
  if (!session?.user || session.user.role !== UserRoles.ADMIN) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.url.trim()) {
      setMessage({
        type: 'error',
        text: 'Name and URL are required fields.',
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Source added successfully!',
        });
        
        // Reset form
        setFormData({
          name: '',
          type: SourceType.RSS,
          url: '',
          isActive: true,
        });
        
        // Call callback to refresh data
        onSourceAdded?.();
        
        // Close sheet after a delay
        setTimeout(() => {
          setIsOpen(false);
          setMessage(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add source');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to add source. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSourceTypeIcon = (type: SourceType) => {
    switch (type) {
      case SourceType.RSS:
        return <Rss className="h-4 w-4" />;
      case SourceType.API:
        return <Globe className="h-4 w-4" />;
      case SourceType.SCRAPER:
        return <Code className="h-4 w-4" />;
      default:
        return <Rss className="h-4 w-4" />;
    }
  };

  const getSourceTypeDescription = (type: SourceType) => {
    switch (type) {
      case SourceType.RSS:
        return 'RSS/Atom feed for automatic content monitoring';
      case SourceType.API:
        return 'API endpoint for structured data retrieval';
      case SourceType.SCRAPER:
        return 'Web scraper for custom content extraction';
      default:
        return '';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Source
          </SheetTitle>
          <SheetDescription>
            Add a new content source to monitor for anime episodes and updates.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 py-6">
          {/* Status Message */}
          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Source Name */}
          <div className="space-y-2">
            <Label htmlFor="source-name">Source Name *</Label>
            <Input
              id="source-name"
              placeholder="e.g., Nyaa.si Anime RSS"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for this content source
            </p>
          </div>

          {/* Source Type */}
          <div className="space-y-2">
            <Label htmlFor="source-type">Source Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: SourceType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SourceType).map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {getSourceTypeIcon(type)}
                      <span>{type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getSourceTypeDescription(formData.type)}
            </p>
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <Label htmlFor="source-url">Source URL *</Label>
            <Input
              id="source-url"
              type="url"
              placeholder="https://nyaa.si/?page=rss&c=1_2"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              The URL to monitor for new content
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="source-active">Active Source</Label>
              <p className="text-xs text-muted-foreground">
                Enable monitoring for this source
              </p>
            </div>
            <Switch
              id="source-active"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <SheetFooter className="gap-2">
            <SheetClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Source'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
} 
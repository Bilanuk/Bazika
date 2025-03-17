'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  className?: string;
  readonly?: boolean;
}

export function Rating({
  value,
  max = 5,
  className,
  readonly = true,
}: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(max)].map((_, index) => (
        <Star
          key={index}
          className={cn(
            'h-5 w-5',
            index < value
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-none text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

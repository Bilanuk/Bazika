'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MailWarning } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { dashboardNavbarLinks } from '@components/dashboard/types';

export function DashboardNavbar({
  isCollapsed = true,
}: {
  isCollapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <div
      data-collapsed={isCollapsed}
      className='group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2'
    >
      <nav className='grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2'>
        {dashboardNavbarLinks.map((link, index) => {
          const isActive = pathname === link.href;

          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'h-9 w-9',
                    isActive &&
                      'bg-muted text-muted-foreground dark:bg-muted dark:text-white'
                  )}
                >
                  <link.icon className='h-4 w-4' />
                  <span className='sr-only'>{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='flex items-center gap-4'>
                {link.title}
                {link.alert && (
                  <span className='ml-auto text-muted-foreground'>
                    <MailWarning className='h-4 w-4' />
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={link.href}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'justify-start',
                isActive &&
                  'bg-muted text-muted-foreground dark:bg-muted dark:text-white'
              )}
            >
              <link.icon className='mr-2 h-4 w-4' />
              {link.title}
              {link.alert && (
                <span className='ml-auto text-background dark:text-white'>
                  <MailWarning className='h-4 w-4' />
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

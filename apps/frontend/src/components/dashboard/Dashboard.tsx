'use client';

import * as React from 'react';
import {
  Upload,
  File,
  CalendarRange,
  ListVideo,
  RadioTower,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';
import { Separator } from '@components/ui/separator';
import { TooltipProvider } from '@components/ui/tooltip';
import { DashboardNav } from '@components/dashboard/DashboardNav';
import Logo from '@components/Logo';
import useBreakpoint from '@hooks/client/useBreakpoint';
import { useEffect } from 'react';

interface DashboardProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Dashboard({
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: DashboardProps) {
  const isCompact = !useBreakpoint('md');
  const [isCollapsed, setIsCollapsed] = React.useState(
    defaultCollapsed || isCompact
  );

  useEffect(() => {
    setIsCollapsed(defaultCollapsed || isCompact);
  }, [isCompact]);

  console.log('isCompact', isCompact);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction='horizontal'
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes
          )}`;
        }}
        className='max-h-[800px] min-h-screen items-stretch'
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={10}
          maxSize={15}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`;
          }}
          className={cn(
            isCollapsed && 'w-[50px] transition-all duration-300 ease-in-out'
          )}
        >
          <div
            className={cn(
              'flex h-[52px] items-center justify-center',
              isCollapsed ? 'h-[52px]' : 'px-2'
            )}
          >
            <Logo collapsed={isCollapsed} />
          </div>
          <Separator />
          <DashboardNav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Upload',
                alert: false,
                icon: Upload,
                variant: 'default',
              },
              {
                title: 'My videos',
                alert: false,
                icon: ListVideo,
                variant: 'ghost',
              },
              {
                title: 'Drafts',
                alert: true,
                icon: File,
                variant: 'ghost',
              },
              {
                title: 'Schedule',
                alert: false,
                icon: CalendarRange,
                variant: 'ghost',
              },
              {
                title: 'Connect',
                alert: false,
                icon: RadioTower,
                variant: 'ghost',
              },
            ]}
          />
          <Separator />
        </ResizablePanel>
        <ResizableHandle withHandle disabled={isCompact} />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={30}
        ></ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

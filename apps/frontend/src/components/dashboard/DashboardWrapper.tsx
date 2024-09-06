'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';
import { cn } from '@/lib/utils';
import Logo from '@components/Logo';
import { Separator } from '@components/ui/separator';
import { DashboardNavbar } from '@components/dashboard/DashboardNavbar';
import { TooltipProvider } from '@components/ui/tooltip';
import * as React from 'react';
import { useEffect } from 'react';
import useBreakpoint from '@hooks/client/useBreakpoint';

interface DashboardWrapperProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export default function DashboardWrapper({
  children,
  defaultCollapsed = true,
}: DashboardWrapperProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const isCompact = !useBreakpoint('md');

  useEffect(() => {
    setIsCollapsed(defaultCollapsed || isCompact);
  }, [defaultCollapsed, isCompact]);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction='horizontal'
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:dashboard=${JSON.stringify(
            sizes
          )}`;
        }}
        className='max-h-[800px] min-h-screen items-stretch'
      >
        <ResizablePanel
          defaultSize={4}
          collapsedSize={3}
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
          className={cn('min-w-[50px] transition-all duration-300 ease-in-out')}
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
          <DashboardNavbar isCollapsed={isCollapsed} />
          <Separator />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

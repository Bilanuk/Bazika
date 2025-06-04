'use client';

import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface DashboardWrapperProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export default function DashboardWrapper({
  children,
  title = 'Dashboard',
  breadcrumbs = [],
}: DashboardWrapperProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex flex-1 flex-col transition-all duration-300 ease-in-out'>
        {/* Header */}
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <h1 className='text-lg font-semibold'>{title}</h1>
        </header>

        {/* Main Content */}
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

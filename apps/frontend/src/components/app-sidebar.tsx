'use client';

import * as React from 'react';
import {
  BarChart3,
  Database,
  Home,
  Rss,
  Settings,
  Users,
  Video,
  Bell,
  Activity,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserRoles } from '@/types/user-roles';

// Navigation items
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    description: 'Overview and statistics',
  },
  {
    title: 'Content Sources',
    url: '/dashboard/sources',
    icon: Rss,
    description: 'Manage RSS feeds and sources',
  },
  {
    title: 'Content Items',
    url: '/dashboard/content',
    icon: Database,
    description: 'View and manage content items',
  },
  {
    title: 'Processing Queue',
    url: '/dashboard/processing',
    icon: Video,
    description: 'Monitor video processing',
  },
  {
    title: 'Notifications',
    url: '/dashboard/notifications',
    icon: Bell,
    description: 'Notification settings',
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance metrics',
  },
];

const adminItems = [
  {
    title: 'User Management',
    url: '/dashboard/users',
    icon: Users,
    description: 'Manage users and permissions',
  },
  {
    title: 'System Settings',
    url: '/dashboard/settings',
    icon: Settings,
    description: 'System configuration',
  },
  {
    title: 'System Health',
    url: '/dashboard/health',
    icon: Activity,
    description: 'Monitor system health',
  },
];

function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="h-8 w-8 rounded-full bg-sidebar-accent animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-sidebar-accent rounded animate-pulse" />
          <div className="h-2 bg-sidebar-accent rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.image || ''} alt={user.name || ''} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <div className="flex items-center gap-1">
          <p className="text-xs text-sidebar-foreground/70 truncate">
            {user.email}
          </p>
          {user.role === UserRoles.ADMIN && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              Admin
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function NavSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 6 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === UserRoles.ADMIN;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        {status === 'loading' ? (
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="h-8 w-8 rounded bg-sidebar-accent animate-pulse" />
            <div className="h-4 bg-sidebar-accent rounded flex-1 animate-pulse" />
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-2 px-2 py-4 hover:bg-sidebar-accent rounded-md transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Bazika</span>
              <span className="text-xs text-sidebar-foreground/70">
                Back to website
              </span>
            </div>
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            {status === 'loading' ? (
              <NavSkeleton />
            ) : (
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.title === 'Dashboard' || item.title === 'Content Sources' || item.title === 'Content Items' ? (
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.description}
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton 
                        tooltip={`${item.description} (Coming soon)`}
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && status !== 'loading' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      tooltip={`${item.description} (Coming soon)`}
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserInfo />
      </SidebarFooter>
    </Sidebar>
  );
} 
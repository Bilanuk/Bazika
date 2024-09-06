import {
  CalendarRange,
  File,
  LayoutDashboard,
  ListVideo,
  LucideIcon,
  RadioTower,
  Upload,
} from 'lucide-react';

export type DashboardLink = {
  title: string;
  icon: LucideIcon;
  href: string;
  alert?: boolean;
};

export const dashboardNavbarLinks: DashboardLink[] = [
  {
    title: 'Overview',
    alert: false,
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'My videos',
    alert: false,
    icon: ListVideo,
    href: '/dashboard/videos',
  },
  {
    title: 'Upload',
    alert: false,
    icon: Upload,
    href: '/dashboard/upload',
  },
  {
    title: 'Drafts',
    alert: true,
    icon: File,
    href: '/dashboard/drafts',
  },
  {
    title: 'Schedule',
    alert: false,
    icon: CalendarRange,
    href: '/dashboard/schedule',
  },
  {
    title: 'Connect',
    alert: false,
    icon: RadioTower,
    href: '/dashboard/connect',
  },
];

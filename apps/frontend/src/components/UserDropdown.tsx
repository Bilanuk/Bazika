import {
  Cloud,
  CreditCard,
  LifeBuoy,
  Settings,
  User,
  LayoutPanelLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getServerSession } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import LogOutButton from '@/actions/LogOutButton';
import { TypographyP } from '@components/ui/Typography';
import { authOptions } from '@app/api/auth/[...nextauth]/authOptions';

import Link from 'next/link';
import { useUser } from '@/hooks';
import { UserRoles } from '@app/types';

export async function UserDropdown() {
  const session = await getServerSession(authOptions);
  const user = await useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex cursor-pointer flex-row items-center space-x-2'>
          <TypographyP>{`${session?.user.name}`}</TypographyP>
          <Avatar>
            <AvatarImage src={session?.user.image} alt={session?.user.name} />
            <AvatarFallback>{session?.user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='mr-1 w-56'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.role === UserRoles.ADMIN && (
            <Link href='/dashboard'>
              <DropdownMenuItem>
                <LayoutPanelLeft className='mr-2 h-4 w-4' />
                <span>Dashboard</span>
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          )}
          <Link href='/profile'>
            <DropdownMenuItem>
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href='/billing'>
            <DropdownMenuItem>
              <CreditCard className='mr-2 h-4 w-4' />
              <span>Billing</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          <Link href='/settings'>
            <DropdownMenuItem>
              <Settings className='mr-2 h-4 w-4' />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href='/support'>
          <DropdownMenuItem>
            <LifeBuoy className='mr-2 h-4 w-4' />
            <span>Support</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem disabled>
          <Cloud className='mr-2 h-4 w-4' />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import { useUser } from '@/hooks';
import Image from 'next/image';
import { AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@/components/ui/avatar';

export const revalidate = 2;

export default async function Profile() {
  const user = await useUser();

  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4'}>
          <TypographyH2>{user.name}</TypographyH2>
          <p>Email: {user.email}</p>
          <p>Email Verified: {user.emailVerified}</p>
          <p>Role: {user.role}</p>
          <Avatar className='h-80 w-80 rounded-none'>
            <AvatarImage src={user.image || user.name} alt={user.name} />
            <AvatarFallback className='rounded-none'>{user.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </PageWrapper>
    </main>
  );
}

import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import { AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@/components/ui/avatar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';

export const revalidate = 2;

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/signin');
  }

  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4'}>
          <TypographyH2>{session.user.name}</TypographyH2>
          <p>Email: {session.user.email}</p>
          <p>Role: {session.user.role}</p>
          <Avatar className='h-80 w-80 rounded-none'>
            <AvatarImage
              src={session.user.image || session.user.name}
              alt={session.user.name}
            />
            <AvatarFallback className='rounded-none'>
              {session.user.name[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </PageWrapper>
    </main>
  );
}

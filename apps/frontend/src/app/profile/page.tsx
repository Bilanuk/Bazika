import PageWrapper from '@components/ui/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/authOptions';

export default async function Profile() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4'}>
          <TypographyH2>{session?.user.name}</TypographyH2>
        </div>
      </PageWrapper>
    </main>
  );
}

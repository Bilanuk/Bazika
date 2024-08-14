import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import { useUser } from '@/hooks';

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
          <img
            src={user.image}
            alt={user.name}
            referrerPolicy={'no-referrer'}
          />
        </div>
      </PageWrapper>
    </main>
  );
}

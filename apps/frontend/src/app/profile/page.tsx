// import PageWrapper from '@components/ui/PageWrapper';
// import { TypographyH2 } from '@components/ui/Typography';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../api/auth/[...nextauth]/authOptions';
//
// export const revalidate = 10;
//
// export default async function Profile() {
//   const session = await getServerSession(authOptions);
//
//   return (
//     <main>
//       <PageWrapper>
//         <div className={'col-span-4'}>
//           <TypographyH2>{session?.user.name}</TypographyH2>
//         </div>
//       </PageWrapper>
//     </main>
//   );
// }
import PageWrapper from '@components/ui/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';
import { getClient } from '@/lib/client';
import { GET_USER } from '@/queries/user';

export const revalidate = 2;

export default async function Profile() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_USER,
  });

  const { user } = data;

  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4'}>
          <TypographyH2>{user.name}</TypographyH2>
          <p>Email: {user.email}</p>
          <p>Email Verified: {user.emailVerified}</p>
          <img src={user.image} alt={user.name} />
        </div>
      </PageWrapper>
    </main>
  );
}

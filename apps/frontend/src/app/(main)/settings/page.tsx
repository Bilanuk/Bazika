import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';

export default function Settings() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-3'}>
          <TypographyH2>Settings</TypographyH2>
        </div>
        <div className={'col-span-1'}>
          <TypographyH2>Account</TypographyH2>
        </div>
      </PageWrapper>
    </main>
  );
}

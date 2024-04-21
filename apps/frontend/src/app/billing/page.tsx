import PageWrapper from '@components/ui/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';

export default function Billing() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-3'}>
          <TypographyH2>Billing</TypographyH2>
        </div>
        <div className={'col-span-1'}>
          <TypographyH2>Payment history</TypographyH2>
        </div>
      </PageWrapper>
    </main>
  );
}
import PageWrapper from '@components/PageWrapper';
import { TypographyH2 } from '@components/ui/Typography';

export default function Support() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-3'}>
          <TypographyH2>Support</TypographyH2>
        </div>
        <div className={'col-span-1'}>
          <TypographyH2>Help</TypographyH2>
        </div>
      </PageWrapper>
    </main>
  );
}

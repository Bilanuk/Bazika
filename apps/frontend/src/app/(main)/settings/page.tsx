import PageWrapper from '@components/PageWrapper';
import { TypographyH2, TypographyH3 } from '@components/ui/Typography';
import ThemeSelector from '@/components/ThemeSelector';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Settings() {
  return (
    <main>
      <PageWrapper>
        <div className={'col-span-4 space-y-6'}>
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </main>
  );
}

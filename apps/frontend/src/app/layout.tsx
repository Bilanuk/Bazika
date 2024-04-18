import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/Providers';
import Appbar from '@/components/AppBar';
import PageWrapper from '@/components/ui/PageWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bazika',
  description: 'Bazika',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body className={`${inter.className}`}>
        <Providers>
          <div className='bg-white text-black dark:bg-black dark:text-white'>
            <div className='min-h-screen dark:bg-black/[.9]'>
              <Appbar />
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

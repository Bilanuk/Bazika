import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/Providers';
import Script from 'next/script';
import OneTapComponent from '@components/OneTapComponent';
import AnimatedIconsBackground from '@/components/AnimatedIconsBackground';
import { Toaster } from "@/components/ui/sonner";

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
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <OneTapComponent />
          {/* <AnimatedIconsBackground /> */}
          {children}
        </Providers>
        <Toaster />
        <Script
          src='https://accounts.google.com/gsi/client'
          strategy='beforeInteractive'
        />
      </body>
    </html>
  );
}

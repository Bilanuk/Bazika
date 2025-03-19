import Appbar from '@/components/AppBar';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='bg-white text-black dark:bg-black dark:text-white'>
      <div className='min-h-screen dark:bg-black/[.9]'>
        <Appbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}

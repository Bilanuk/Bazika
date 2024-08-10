export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='bg-white text-black dark:bg-black dark:text-white'>
      <div className='min-h-screen dark:bg-black/[.9]'>{children}</div>
    </div>
  );
}

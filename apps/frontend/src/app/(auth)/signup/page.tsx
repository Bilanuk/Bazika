import RegisterForm from '@/components/RegisterForm';
import Logo from '@components/Logo';
import { TypographySmall } from '@/components/ui/Typography';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className='flex h-screen w-1/2 min-w-[250px] max-w-[350px] items-center justify-center px-0 sm:px-2 lg:px-2'>
      <div className='w-full max-w-xl space-y-10 px-4'>
        <div className='text-center'>
          <Logo />
        </div>
        <div className='space-y-8'>
          <RegisterForm />
          <TypographySmall className='text-center'>
            Already have an account?{' '}
            <Link href='/signin' className='underline hover:text-primary'>
              Sign in
            </Link>
          </TypographySmall>
        </div>
      </div>
    </div>
  );
}

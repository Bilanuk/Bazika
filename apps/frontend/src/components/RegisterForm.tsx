'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error during registration');
      }

      // If registration successful, sign in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/',
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className='w-full space-y-4'>
      <div className='space-y-4'>
        <Input
          id='name'
          name='name'
          placeholder='Name'
          type='text'
          disabled={isLoading}
          required
        />
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='Email'
          autoCapitalize='none'
          autoComplete='email'
          autoCorrect='off'
          disabled={isLoading}
          required
        />
        <Input
          id='password'
          name='password'
          placeholder='Password'
          type='password'
          autoComplete='new-password'
          disabled={isLoading}
          required
        />
        <Input
          id='confirmPassword'
          name='confirmPassword'
          placeholder='Confirm Password'
          type='password'
          autoComplete='new-password'
          disabled={isLoading}
          required
        />
      </div>
      {error && (
        <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
          {error}
        </div>
      )}
      <Button disabled={isLoading} className='w-full'>
        {isLoading && (
          <svg
            className='mr-2 h-4 w-4 animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M21 12a9 9 0 1 1-6.219-8.56' />
          </svg>
        )}
        Create account
      </Button>
    </form>
  );
}

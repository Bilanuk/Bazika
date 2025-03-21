'use client';

import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export default function ThemeContext({
  children,
  ...props
}: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}

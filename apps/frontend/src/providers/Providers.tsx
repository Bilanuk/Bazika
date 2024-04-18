'use client';

import { ReactNode } from 'react';
import AuthContext from './AuthContext';
import ThemeContext from '@/providers/ThemeContext';

type ProviderPropType = {
  children: ReactNode;
};

const Providers = ({ children }: ProviderPropType) => {
  return (
    <ThemeContext
      attribute={'class'}
      defaultTheme={'system'}
    >
      <AuthContext>{children}</AuthContext>
    </ThemeContext>
  );
};

export default Providers;

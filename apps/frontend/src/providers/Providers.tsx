'use client';

import { ReactNode } from 'react';
import AuthContext from './AuthContext';
import ThemeContext from '@/providers/ThemeContext';
import ApolloWrapper from '@/providers/ApolloWrapper';

type ProviderPropType = {
  children: ReactNode;
};

const Providers = ({ children }: ProviderPropType) => {
  return (
    <ThemeContext attribute={'class'} defaultTheme={'system'}>
      <ApolloWrapper>
        <AuthContext>{children}</AuthContext>
      </ApolloWrapper>
    </ThemeContext>
  );
};

export default Providers;

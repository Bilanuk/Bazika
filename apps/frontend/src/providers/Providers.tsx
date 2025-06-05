'use client';

import { ReactNode } from 'react';
import AuthContext from './AuthContext';
import ThemeContext from '@/providers/ThemeContext';
import ApolloWrapper from '@/providers/ApolloWrapper';
import QueryProvider from '@/providers/QueryProvider';

type ProviderPropType = {
  children: ReactNode;
};

const Providers = ({ children }: ProviderPropType) => {
  return (
    <ThemeContext attribute={'class'} defaultTheme={'system'}>
      <QueryProvider>
        <ApolloWrapper>
          <AuthContext>{children}</AuthContext>
        </ApolloWrapper>
      </QueryProvider>
    </ThemeContext>
  );
};

export default Providers;

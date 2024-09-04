import Link from 'next/link';
import { LogoTypography } from '@components/ui/Typography';
import React from 'react';

interface LogoProps {
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false }) => {
  return (
    <Link href={'/'}>
      <LogoTypography>{collapsed ? 'B' : 'Bazika'}</LogoTypography>
    </Link>
  );
};

export default Logo;

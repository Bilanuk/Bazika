import Link from 'next/link';
import { LogoTypography } from '@components/ui/Typography';
import React from 'react';

const Logo = () => {
  return (
    <Link href={'/'}>
      <LogoTypography>Bazika</LogoTypography>
    </Link>
  );
};

export default Logo;

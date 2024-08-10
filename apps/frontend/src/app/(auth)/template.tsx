'use client';

import { motion } from 'framer-motion';
import Logo from '@components/Logo';
import React from 'react';

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: 'easeInOut', duration: 0.5 }}
    >
      <div className={'mt-8 text-center'}>
        <Logo />
      </div>
      {children}
    </motion.div>
  );
}

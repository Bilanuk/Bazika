'use client';

import { motion } from 'framer-motion';
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
      className='flex h-screen w-full items-center justify-center'
    >
      {children}
    </motion.div>
  );
}

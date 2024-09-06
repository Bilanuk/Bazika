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
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ ease: 'easeOut', duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  // TODO: get value from user settings
  const isAnimated = true;


  if (!isAnimated) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: 'easeInOut', duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

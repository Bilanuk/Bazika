'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LayoutHalfPageImage() {
  const images = [
    'https://i.pinimg.com/originals/5f/b0/c6/5fb0c6f290eeb327a0ce48001901cdaa.gif',
    'https://i.pinimg.com/originals/2b/17/90/2b1790a454afdb18da1ac7c459330b05.gif',
    'https://i.pinimg.com/originals/09/ea/05/09ea0590807ecc75ec7ea39f1426ada2.gif',
  ];

  const getRandomImage = () => {
    return images[Math.floor(Math.random() * images.length)];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: 'easeInOut', duration: 0.5 }}
      className='relative h-full w-full'
    >
      <Image
        src={getRandomImage()}
        alt='Giant Background'
        layout='fill'
        objectFit='cover'
        quality={100}
      />
    </motion.div>
  );
}

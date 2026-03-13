'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface SlideTransitionProps {
  slideIndex: number;
  children: React.ReactNode;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({ slideIndex, children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slideIndex}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

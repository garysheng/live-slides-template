'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import QRCode from 'qrcode';
import { COLORS, FONTS } from '@/lib/theme';

interface QRCodeFullOverlayProps {
  url: string;
  visible: boolean;
}

export const QRCodeFullOverlay: React.FC<QRCodeFullOverlayProps> = ({ url, visible }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 800,
      margin: 2,
      color: { dark: COLORS.dark, light: '#FFFFFF' },
    }).then(setDataUrl);
  }, [url]);

  return (
    <AnimatePresence>
      {visible && dataUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: '48px 56px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                fontFamily: FONTS.heading,
                fontWeight: 700,
                fontSize: 42,
                color: COLORS.text,
              }}
            >
              Ask a Question
            </div>
            <img
              src={dataUrl}
              alt="Scan to ask questions"
              style={{ width: 400, height: 400, borderRadius: 12 }}
            />
            <div
              style={{
                fontFamily: FONTS.body,
                fontWeight: 500,
                fontSize: 24,
                color: COLORS.muted,
              }}
            >
              Scan with your phone
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

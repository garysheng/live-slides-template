'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { COLORS, FONTS } from '@/lib/theme';

interface QRCodeOverlayProps {
  url: string;
  size?: number;
}

export const QRCodeOverlay: React.FC<QRCodeOverlayProps> = ({ url, size = 220 }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: { dark: COLORS.dark, light: '#FFFFFF' },
    }).then(setDataUrl);
  }, [url, size]);

  if (!dataUrl) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 24,
        zIndex: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <img src={dataUrl} alt="Scan to ask questions" width={size} height={size} style={{ borderRadius: 8 }} />
      <div
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 18,
          color: COLORS.primary,
          textAlign: 'center',
        }}
      >
        Ask a Question
      </div>
    </div>
  );
};

import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'Live Slides',
    template: '%s | Live Slides',
  },
  description: 'Real-time presentation platform with audience Q&A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          width: '100%',
          minHeight: '100dvh',
          background: '#111',
          WebkitFontSmoothing: 'antialiased',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </body>
    </html>
  );
}

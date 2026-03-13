import { COLORS, FONTS } from '@/lib/theme';

export const ClosingSlide: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 120px',
      position: 'relative',
      zIndex: 5,
    }}
  >
    <div
      style={{
        fontFamily: FONTS.heading,
        fontWeight: 700,
        fontSize: 64,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 24,
      }}
    >
      Thank You!
    </div>
    <div
      style={{
        fontFamily: FONTS.body,
        fontWeight: 500,
        fontSize: 24,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 1.6,
      }}
    >
      Scan the QR code or visit the Q&amp;A page to ask questions
    </div>
  </div>
);

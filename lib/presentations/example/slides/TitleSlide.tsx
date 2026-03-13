import { COLORS, FONTS } from '@/lib/theme';

export const TitleSlide: React.FC = () => (
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
        fontSize: 72,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 1.2,
        marginBottom: 24,
      }}
    >
      Welcome to Live Slides
    </div>
    <div
      style={{
        fontFamily: FONTS.body,
        fontWeight: 500,
        fontSize: 28,
        color: COLORS.muted,
        textAlign: 'center',
      }}
    >
      A real-time presentation platform with audience Q&amp;A
    </div>
  </div>
);

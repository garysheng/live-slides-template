import { COLORS, FONTS } from '@/lib/theme';

export const ContentSlide: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 140px',
      position: 'relative',
      zIndex: 5,
    }}
  >
    <div
      style={{
        fontFamily: FONTS.heading,
        fontWeight: 700,
        fontSize: 52,
        color: COLORS.text,
        marginBottom: 40,
      }}
    >
      How It Works
    </div>
    {[
      'Present from any device with the presenter remote',
      'Audience follows along in real-time on their phones',
      'Questions are submitted, moderated, and upvoted live',
      'Everything syncs instantly through Firebase',
    ].map((item, i) => (
      <div
        key={i}
        style={{
          fontFamily: FONTS.body,
          fontSize: 28,
          color: COLORS.text,
          padding: '12px 0',
          paddingLeft: 24,
          borderLeft: `4px solid ${COLORS.primary}`,
          marginBottom: 16,
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

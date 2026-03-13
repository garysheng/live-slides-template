import { COLORS, FONTS } from '@/lib/theme';

const features = [
  { title: 'Presenter Remote', desc: 'Control slides from your phone with notes' },
  { title: 'Live Q&A', desc: 'Audience submits and upvotes questions' },
  { title: 'AI Moderation', desc: 'Gemini automatically filters inappropriate content' },
  { title: 'Live Polls', desc: 'Ask questions, AI clusters the responses' },
  { title: 'QR Codes', desc: 'Audience scans to join from their phones' },
  { title: 'Follow Along', desc: 'Audience sees slides synced to presenter' },
];

export const FeaturesSlide: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 100px',
      position: 'relative',
      zIndex: 5,
    }}
  >
    <div
      style={{
        fontFamily: FONTS.heading,
        fontWeight: 700,
        fontSize: 48,
        color: COLORS.text,
        marginBottom: 48,
        textAlign: 'center',
      }}
    >
      Features
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
      {features.map((f, i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: 16,
            padding: '28px 24px',
            border: `2px solid ${COLORS.primary}20`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 700,
              fontSize: 22,
              color: COLORS.text,
              marginBottom: 8,
            }}
          >
            {f.title}
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 18,
              color: COLORS.muted,
              lineHeight: 1.5,
            }}
          >
            {f.desc}
          </div>
        </div>
      ))}
    </div>
  </div>
);

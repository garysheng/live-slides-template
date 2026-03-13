'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { COLORS, FONTS } from '@/lib/theme';
import type { HighlightedQuestion } from '@/lib/usePresenterSync';

interface HighlightedQuestionOverlayProps {
  question: HighlightedQuestion | null;
}

export const HighlightedQuestionOverlay: React.FC<HighlightedQuestionOverlayProps> = ({ question }) => {
  return (
    <AnimatePresence>
      {question && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 40,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: '52px 60px',
              maxWidth: 900,
              width: '70%',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
              borderLeft: `6px solid ${COLORS.primary}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 13,
                color: COLORS.muted,
                backgroundColor: `${COLORS.muted}15`,
                padding: '4px 12px',
                borderRadius: 20,
              }}
            >
              Audience Question
            </div>

            <div
              style={{
                fontFamily: FONTS.heading,
                fontWeight: 700,
                fontSize: 38,
                color: COLORS.text,
                lineHeight: 1.3,
                marginBottom: 24,
                marginTop: 8,
              }}
            >
              &ldquo;{question.text}&rdquo;
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  color: COLORS.muted,
                }}
              >
                &mdash; {question.authorName || 'Anonymous'}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: FONTS.heading,
                  fontWeight: 700,
                  fontSize: 20,
                  color: COLORS.primary,
                }}
              >
                <span style={{ fontSize: 24 }}>&#9650;</span>
                {question.upvotes}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

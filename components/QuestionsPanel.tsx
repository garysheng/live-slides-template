'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { COLORS, FONTS } from '@/lib/theme';
import type { Question } from '@/lib/useQA';

interface QuestionsPanelProps {
  questions: Question[];
  visible: boolean;
}

export const QuestionsPanel: React.FC<QuestionsPanelProps> = ({ questions, visible }) => {
  const topQuestions = questions.slice(0, 7);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 580,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            zIndex: 30,
            padding: '40px 28px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: FONTS.body,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 700,
              fontSize: 34,
              color: COLORS.primary,
              marginBottom: 8,
            }}
          >
            Audience Questions
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 24,
            }}
          >
            {questions.length} question{questions.length !== 1 ? 's' : ''} · sorted by upvotes
          </div>

          {topQuestions.length === 0 ? (
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              No questions yet. Audience can scan the QR code to ask.
            </div>
          ) : (
            topQuestions.map((q, i) => (
              <div
                key={q.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '16px 0',
                  borderBottom: i < topQuestions.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.heading,
                    fontWeight: 700,
                    fontSize: 30,
                    color: COLORS.primary,
                    minWidth: 44,
                    textAlign: 'center',
                    lineHeight: 1,
                    paddingTop: 2,
                  }}
                >
                  {q.upvotes}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, color: '#fff', lineHeight: 1.4 }}>
                    {q.text}
                  </div>
                  <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                    {q.authorName || 'Anonymous'}
                    {q.targetSpeakers.length > 0 && ` · For: ${q.targetSpeakers.join(', ')}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

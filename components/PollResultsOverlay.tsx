'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { COLORS, FONTS } from '@/lib/theme';
import type { PollData } from '@/lib/usePoll';

interface PollResultsOverlayProps {
  poll: PollData | null;
  visible: boolean;
}

export const PollResultsOverlay: React.FC<PollResultsOverlayProps> = ({ poll, visible }) => {
  const clusters = poll?.clusteredResults?.clusters ?? [];
  const summary = poll?.clusteredResults?.summary ?? '';
  const maxCount = Math.max(...clusters.map((c) => c.count), 1);

  return (
    <AnimatePresence>
      {visible && poll && poll.clusteredResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 45,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: '48px 56px',
              maxWidth: 1100,
              width: '75%',
              maxHeight: '85%',
              overflow: 'auto',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                fontFamily: FONTS.heading,
                fontWeight: 700,
                fontSize: 32,
                color: COLORS.text,
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {poll.question}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              style={{
                fontFamily: FONTS.body,
                fontSize: 16,
                color: COLORS.muted,
                marginBottom: 36,
              }}
            >
              {clusters.reduce((sum, c) => sum + c.count, 0)} responses
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {clusters.map((cluster, i) => (
                <motion.div
                  key={cluster.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontWeight: 600,
                      fontSize: 18,
                      color: COLORS.text,
                      minWidth: 180,
                      textAlign: 'right',
                    }}
                  >
                    {cluster.label}
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: 40 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cluster.count / maxCount) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        backgroundColor: cluster.color,
                        borderRadius: 8,
                        minWidth: 8,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.heading,
                      fontWeight: 700,
                      fontSize: 22,
                      color: cluster.color,
                      minWidth: 40,
                    }}
                  >
                    {cluster.count}
                  </div>
                </motion.div>
              ))}
            </div>

            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + clusters.length * 0.08, duration: 0.4 }}
                style={{
                  marginTop: 36,
                  padding: '20px 24px',
                  backgroundColor: `${COLORS.primary}10`,
                  borderRadius: 14,
                  borderLeft: `4px solid ${COLORS.primary}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 18,
                    color: COLORS.text,
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  {summary}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

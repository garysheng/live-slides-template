'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS, FONTS } from '@/lib/theme';
import type { PresentationConfig } from '@/lib/presentations/types';

interface PresentationListProps {
  presentations: PresentationConfig[];
  isAdmin?: boolean;
}

function getHref(p: PresentationConfig, isAdmin: boolean, isMobile: boolean) {
  if (isAdmin && isMobile) return `/presenter/${p.slug}`;
  if (isAdmin) return `/${p.slug}`;
  return `/follow/${p.slug}`;
}

function PresentationCard({ p, index, isAdmin, isMobile }: { p: PresentationConfig; index: number; isAdmin: boolean; isMobile: boolean }) {
  return (
    <Link
      href={getHref(p, isAdmin, isMobile)}
      style={{ textDecoration: 'none', width: '100%', maxWidth: 380, minWidth: 0, display: 'flex' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
        style={{
          padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3vw, 32px)',
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          border: `2px solid ${COLORS.primary}30`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flex: 1,
        }}
        whileHover={{
          scale: 1.03,
          boxShadow: `0 8px 30px ${COLORS.primary}20`,
          borderColor: COLORS.primary,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 'clamp(20px, 4vw, 26px)', color: COLORS.text }}>
            {p.title}
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 11,
              color: COLORS.primary,
              backgroundColor: `${COLORS.primary}15`,
              padding: '3px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            {p.slides.length} slides
          </div>
        </div>
        {p.subtitle && (
          <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 'clamp(14px, 2.5vw, 16px)', color: COLORS.muted, marginBottom: 12 }}>
            {p.subtitle}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export const PresentationList: React.FC<PresentationListProps> = ({ presentations, isAdmin }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const visiblePresentations = (isAdmin ? presentations : presentations.filter((p) => !p.adminOnly)).filter((p) => !p.password);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        zIndex: 5,
        padding: '40px 20px',
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 'clamp(28px, 6vw, 48px)',
          color: COLORS.text,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        Presentations
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 'clamp(16px, 3vw, 22px)',
          color: COLORS.muted,
          marginBottom: 'clamp(24px, 5vw, 50px)',
          textAlign: 'center',
        }}
      >
        {isAdmin ? 'Select a deck to present' : 'Select a deck to follow along'}
      </motion.div>

      <div
        style={{
          maxWidth: 900,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {visiblePresentations.map((p, i) => (
          <PresentationCard key={p.slug} p={p} index={i} isAdmin={!!isAdmin} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
};

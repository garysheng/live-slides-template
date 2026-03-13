'use client';

import { useEffect, useRef } from 'react';
import { COLORS } from '@/lib/theme';

interface BackgroundProps {
  slideIndex: number;
  totalSlides: number;
}

const FloatingOrb: React.FC = () => {
  const orbRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const angleRef = useRef(0);

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      angleRef.current += (dt / 1000) * 0.3;
      if (orbRef.current) {
        const x = Math.sin(angleRef.current) * 20;
        const y = Math.cos(angleRef.current * 0.7) * 15;
        orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={orbRef}
      style={{
        position: 'absolute',
        top: -80,
        right: -60,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.primary}20 0%, ${COLORS.secondary}10 40%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
    />
  );
};

export const Background: React.FC<BackgroundProps> = ({ slideIndex, totalSlides }) => {
  const t = totalSlides > 1 ? slideIndex / (totalSlides - 1) : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Base gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${COLORS.background} 0%, #E2E8F0 50%, ${COLORS.background} 100%)`,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.primary}08 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translateX(${-t * 30}px)`,
          transition: 'transform 0.8s ease-out',
        }}
      />

      {/* Floating orb */}
      <FloatingOrb />

      {/* Bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.primary})`,
          opacity: 0.6,
        }}
      />
    </div>
  );
};

'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { presentations } from '@/lib/presentations';
import { useSlideIndex, useShowQuestions, useHighlightedQuestion, useShowQROverlay } from '@/lib/usePresenterSync';
import { useQuestions } from '@/lib/useQA';
import { Background } from '@/components/Background';
import { SlideTransition } from '@/components/SlideTransition';
import { QuestionsPanel } from '@/components/QuestionsPanel';
import { HighlightedQuestionOverlay } from '@/components/HighlightedQuestionOverlay';
import { QRCodeFullOverlay } from '@/components/QRCodeFullOverlay';
import { useQaUrl } from '@/lib/useQaUrl';
import { COLORS, FONTS } from '@/lib/theme';
import { ADMIN_EMAIL } from '@/lib/config';

const DESIGN_W = 1920;
const DESIGN_H = 1080;

export default function FollowAlongPage() {
  const params = useParams();
  const slug = params.slug as string;
  const presentation = presentations.find((p) => p.slug === slug);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!presentation?.adminOnly) {
      setAuthChecked(true);
      return;
    }
    import('@/lib/firebase').then(({ auth }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        const unsub = onAuthStateChanged(auth, (u) => {
          setIsAdmin(u?.email === ADMIN_EMAIL);
          setAuthChecked(true);
        });
        return () => unsub();
      });
    });
  }, [presentation?.adminOnly]);

  if (!presentation) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, fontFamily: FONTS.body, color: '#c00' }}>
        Presentation not found
      </div>
    );
  }

  if (presentation.adminOnly && !authChecked) return null;

  if (presentation.adminOnly && !isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: COLORS.background, fontFamily: FONTS.body, gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: FONTS.heading }}>Access Denied</div>
        <div style={{ fontSize: 16, color: COLORS.muted }}>This presentation is only available to admins.</div>
      </div>
    );
  }

  return <SlidesFollowAlong slug={slug} />;
}

function SlidesFollowAlong({ slug }: { slug: string }) {
  const presentation = presentations.find((p) => p.slug === slug);
  const remoteSlideIndex = useSlideIndex(slug, !!presentation?.presented);
  const [slideIndex, setSlideIndex] = useState(0);
  const [followPresenter, setFollowPresenter] = useState(!presentation?.presented);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const showQuestions = useShowQuestions(slug);
  const highlightedQuestion = useHighlightedQuestion(slug);
  const showQROverlay = useShowQROverlay(slug);
  const allQuestions = useQuestions(slug);
  const questions = allQuestions.filter((q) => !q.archived);
  const qaUrl = useQaUrl(slug);

  useEffect(() => {
    if (followPresenter) setSlideIndex(remoteSlideIndex);
  }, [remoteSlideIndex, followPresenter]);

  useEffect(() => {
    const computeScale = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setScale(Math.min(rect.width / DESIGN_W, rect.height / DESIGN_H));
      } else {
        const vw = window.innerWidth;
        const vh = window.innerHeight * 0.75;
        setScale(Math.min(vw / DESIGN_W, vh / DESIGN_H));
      }
    };
    requestAnimationFrame(computeScale);
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  if (!presentation || presentation.type !== 'slides') return null;

  const totalSlides = presentation.slides.length;
  const CurrentSlide = presentation.slides[slideIndex];

  const goNext = () => setSlideIndex((i) => Math.min(i + 1, totalSlides - 1));
  const goPrev = () => setSlideIndex((i) => Math.max(i - 1, 0));

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (followPresenter) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) goNext();
    else if (dx > 50) goPrev();
  };

  return (
    <div style={{ height: '100dvh', backgroundColor: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        ref={wrapperRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', minHeight: 0 }}
      >
        <div
          ref={containerRef}
          onClick={(e) => {
            if (followPresenter) return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            if (x > rect.width / 2) goNext();
            else goPrev();
          }}
          style={{ position: 'relative', width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})`, transformOrigin: 'center center', overflow: 'hidden', flexShrink: 0 }}
        >
          <Background slideIndex={slideIndex} totalSlides={totalSlides} />
          <div style={{ position: 'absolute', inset: 0 }}>
            <SlideTransition slideIndex={slideIndex}>
              <CurrentSlide />
            </SlideTransition>
          </div>
          <QuestionsPanel questions={questions} visible={followPresenter && showQuestions} />
          <HighlightedQuestionOverlay question={followPresenter ? highlightedQuestion : null} />
          {followPresenter && qaUrl && <QRCodeFullOverlay url={qaUrl} visible={showQROverlay} />}
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ flex: '0 0 auto', backgroundColor: COLORS.background, padding: '10px 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 16, color: COLORS.text }}>{presentation.title}</div>
          <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 13, color: COLORS.muted }}>{slideIndex + 1} / {totalSlides}</div>
        </div>
        {!followPresenter && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={goPrev} disabled={slideIndex === 0} style={{ flex: 1, padding: '10px', fontSize: 16, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: slideIndex === 0 ? '#ccc' : COLORS.muted, color: '#fff', border: 'none', borderRadius: 10, cursor: slideIndex === 0 ? 'default' : 'pointer' }}>← Prev</button>
            <button onClick={goNext} disabled={slideIndex === totalSlides - 1} style={{ flex: 1, padding: '10px', fontSize: 16, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: slideIndex === totalSlides - 1 ? '#ccc' : COLORS.muted, color: '#fff', border: 'none', borderRadius: 10, cursor: slideIndex === totalSlides - 1 ? 'default' : 'pointer' }}>Next →</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { const next = !followPresenter; setFollowPresenter(next); if (next) setSlideIndex(remoteSlideIndex); }}
            style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: followPresenter ? COLORS.muted : '#2563EB', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
          >
            {followPresenter ? 'Following Presenter' : 'Browse Freely'}
          </button>
          <button
            onClick={() => window.open(`/qa/${slug}`, '_blank')}
            style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
          >
            Ask or Upvote Questions
          </button>
        </div>
      </div>
    </div>
  );
}

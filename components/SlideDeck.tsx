'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Background } from '@/components/Background';
import { SlideTransition } from '@/components/SlideTransition';
import { COLORS, FONTS } from '@/lib/theme';
import { useSlideIndex, useShowQuestions, useHighlightedQuestion, useShowQROverlay, useResumeLoop, clearResumeLoop, writeSlideIndex } from '@/lib/usePresenterSync';
import { useQuestions } from '@/lib/useQA';
import { useActivePollId, usePoll, useShowPollResults } from '@/lib/usePoll';
import { QRCodeOverlay } from '@/components/QRCodeOverlay';
import { QuestionsPanel } from '@/components/QuestionsPanel';
import { HighlightedQuestionOverlay } from '@/components/HighlightedQuestionOverlay';
import { QRCodeFullOverlay } from '@/components/QRCodeFullOverlay';
import { PollResultsOverlay } from '@/components/PollResultsOverlay';
import type { SlidesConfig } from '@/lib/presentations/types';
import { useQaUrl } from '@/lib/useQaUrl';

const DESIGN_W = 1920;
const DESIGN_H = 1080;

interface SlideDeckProps {
  presentation: SlidesConfig;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({ presentation }) => {
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);
  const remoteSlideIndex = useSlideIndex(presentation.slug, !!presentation.presented);
  const showQuestions = useShowQuestions(presentation.slug);
  const highlightedQuestion = useHighlightedQuestion(presentation.slug);
  const showQROverlay = useShowQROverlay(presentation.slug);
  const allQuestions = useQuestions(presentation.slug);
  const questions = allQuestions.filter((q) => !q.archived);
  const qaUrl = useQaUrl(presentation.slug);
  const activePollId = useActivePollId(presentation.slug);
  const activePoll = usePoll(presentation.slug, activePollId);
  const showPollResults = useShowPollResults(presentation.slug);
  const slides = presentation.slides;
  const totalSlides = slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const autoLoop = presentation.autoLoop;
  const [loopPaused, setLoopPaused] = useState(false);
  const resumeLoopSignal = useResumeLoop(presentation.slug);

  useEffect(() => {
    if (!presentation.presented) {
      setSlideIndex(remoteSlideIndex);
      if (autoLoop) {
        const isInRange = remoteSlideIndex >= autoLoop.startSlide && remoteSlideIndex <= autoLoop.endSlide;
        if (!isInRange) {
          setLoopPaused(true);
        }
      }
    }
  }, [remoteSlideIndex, presentation.presented, autoLoop]);

  useEffect(() => {
    if (!autoLoop || loopPaused) return;
    const currentInterval = autoLoop.overrides?.[slideIndex] ?? autoLoop.intervalMs;
    const isInRange = slideIndex >= autoLoop.startSlide && slideIndex <= autoLoop.endSlide;
    if (!isInRange) {
      setLoopPaused(true);
      return;
    }
    const timer = setTimeout(() => {
      const nextIndex = slideIndex >= autoLoop.endSlide ? autoLoop.startSlide : slideIndex + 1;
      writeSlideIndex(presentation.slug, nextIndex);
    }, currentInterval);
    return () => clearTimeout(timer);
  }, [slideIndex, autoLoop, loopPaused, presentation.slug]);

  useEffect(() => {
    if (resumeLoopSignal && autoLoop) {
      setLoopPaused(false);
      clearResumeLoop(presentation.slug);
    }
  }, [resumeLoopSignal, autoLoop, presentation.slug]);

  useEffect(() => {
    const computeScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setScale(Math.min(vw / DESIGN_W, vh / DESIGN_H));
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(i + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goBack = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      } else if ((e.key === 'l' || e.key === 'L') && autoLoop) {
        e.preventDefault();
        writeSlideIndex(presentation.slug, autoLoop.startSlide);
        setLoopPaused(false);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, goBack]);

  const handleClick = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      goNext();
    } else {
      goPrev();
    }
  };

  const CurrentSlide = slides[slideIndex];

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#111',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        onClick={handleClick}
        style={{
          position: 'relative',
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Background slideIndex={slideIndex} totalSlides={totalSlides} />

        <div style={{ position: 'absolute', inset: 0 }}>
          <SlideTransition slideIndex={slideIndex}>
            <CurrentSlide />
          </SlideTransition>
        </div>

        {/* Section breadcrumbs */}
        {presentation.sections && presentation.sections.length > 0 && (() => {
          const sections = presentation.sections;
          let activeIdx = 0;
          for (let i = sections.length - 1; i >= 0; i--) {
            if (slideIndex >= sections[i].startSlide) {
              activeIdx = i;
              break;
            }
          }
          return (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 20,
                padding: '8px 20px',
              }}
            >
              {sections.map((section, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && (
                    <div style={{ width: 16, height: 1, backgroundColor: 'rgba(255,255,255,0.25)', margin: '0 2px' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: i === activeIdx ? COLORS.primary : 'rgba(255,255,255,0.35)',
                      transition: 'background-color 0.3s ease',
                    }} />
                    <span style={{
                      fontFamily: FONTS.body,
                      fontWeight: i === activeIdx ? 600 : 400,
                      fontSize: 14,
                      color: i === activeIdx ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                    }}>
                      {section.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Back button */}
        <div
          onClick={(e) => { e.stopPropagation(); goBack(); }}
          style={{
            position: 'absolute',
            top: 20,
            left: 24,
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 14,
            color: `${COLORS.text}60`,
            cursor: 'pointer',
            zIndex: 10,
            padding: '6px 12px',
            borderRadius: 8,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.text;
            e.currentTarget.style.backgroundColor = `${COLORS.text}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = `${COLORS.text}60`;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ← Back
        </div>

        {/* Dot indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 10,
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
              style={{
                width: i === slideIndex ? 24 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i === slideIndex ? COLORS.primary : `${COLORS.text}40`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* QR Code for audience Q&A */}
        {!presentation.hideQA && qaUrl && <QRCodeOverlay url={qaUrl} />}

        {/* Overlays */}
        {!presentation.hideQA && <QuestionsPanel questions={questions} visible={showQuestions} />}
        {!presentation.hideQA && <HighlightedQuestionOverlay question={highlightedQuestion} />}
        {!presentation.hideQA && qaUrl && <QRCodeFullOverlay url={qaUrl} visible={showQROverlay} />}
        {!presentation.hideQA && <PollResultsOverlay poll={activePoll} visible={showPollResults} />}
      </div>
    </div>
  );
};

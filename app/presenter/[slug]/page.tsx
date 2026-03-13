'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { signInWithPopup, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
  useSlideIndex,
  writeSlideIndex,
  useShowQuestions,
  useHighlightedQuestion,
  useShowQROverlay,
  writeShowQuestions,
  writeHighlightedQuestion,
  writeShowQROverlay,
  writeResumeLoop,
} from '@/lib/usePresenterSync';
import type { SlidesConfig } from '@/lib/presentations/types';
import { useQuestions, archiveQuestion } from '@/lib/useQA';
import {
  useActivePollId,
  usePoll,
  usePollResponses,
  createPoll,
  writePollStatus,
  writePollResults,
  writeShowPollResults,
  useShowPollResults,
  clearActivePoll,
} from '@/lib/usePoll';
import { presentations } from '@/lib/presentations';
import { COLORS, FONTS } from '@/lib/theme';
import { ADMIN_EMAIL } from '@/lib/config';

export default function PresenterPage() {
  const params = useParams();
  const slug = params.slug as string;
  const presentation = presentations.find((p) => p.slug === slug);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const remoteSlideIndex = useSlideIndex(slug);
  const showQuestions = useShowQuestions(slug);
  const highlightedQuestion = useHighlightedQuestion(slug);
  const showQROverlay = useShowQROverlay(slug);
  const allQuestions = useQuestions(slug);
  const [showArchived, setShowArchived] = useState(false);
  const questions = showArchived ? allQuestions : allQuestions.filter((q) => !q.archived);
  const archivedCount = allQuestions.filter((q) => q.archived).length;
  const [localIndex, setLocalIndex] = useState(0);

  const activePollId = useActivePollId(slug);
  const activePoll = usePoll(slug, activePollId);
  const pollResponses = usePollResponses(slug, activePollId);
  const showPollResults = useShowPollResults(slug);
  const [pollQuestion, setPollQuestion] = useState('');
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [analyzingPoll, setAnalyzingPoll] = useState(false);

  useEffect(() => {
    setLocalIndex(remoteSlideIndex);
  }, [remoteSlideIndex]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u && u.email !== ADMIN_EMAIL) {
        setAuthError(`Access denied for ${u.email}. Only ${ADMIN_EMAIL} can use presenter mode.`);
      } else {
        setAuthError('');
      }
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err?.code || 'Sign-in failed. Please try again.');
    }
  };

  const totalSlides = presentation?.type === 'slides' ? presentation.slides.length : 0;

  const goNext = useCallback(() => {
    setLocalIndex((prev) => {
      const next = Math.min(prev + 1, totalSlides - 1);
      writeSlideIndex(slug, next);
      return next;
    });
  }, [slug, totalSlides]);

  const goPrev = useCallback(() => {
    setLocalIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      writeSlideIndex(slug, next);
      return next;
    });
  }, [slug]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (authLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 28, color: COLORS.text, marginBottom: 24 }}>
          Presenter Mode
        </div>
        <button onClick={handleSignIn} style={signInButtonStyle}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (authError || user.email !== ADMIN_EMAIL) {
    return (
      <div style={containerStyle}>
        <div style={{ fontFamily: FONTS.body, fontSize: 18, color: '#c00', textAlign: 'center', padding: '0 20px' }}>
          {authError || 'Access denied.'}
        </div>
        <button onClick={() => auth.signOut()} style={{ ...signInButtonStyle, marginTop: 20, backgroundColor: COLORS.muted }}>
          Sign out
        </button>
      </div>
    );
  }

  if (!presentation || presentation.type !== 'slides') {
    return (
      <div style={containerStyle}>
        <div style={{ color: '#c00', fontFamily: FONTS.body }}>Presentation not found</div>
      </div>
    );
  }

  const notes = presentation.notes?.[localIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, padding: '20px 16px', fontFamily: FONTS.body, boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 20, color: COLORS.text }}>{presentation.title}</div>
        <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Presenter Mode</div>
      </div>

      {/* Notes */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '20px 16px', marginBottom: 24, minHeight: 120, border: `1px solid ${COLORS.muted}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Notes</div>
          <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 14, color: COLORS.primary }}>{localIndex + 1} / {totalSlides}</div>
        </div>
        <div style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notes || 'No notes for this slide.'}</div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={goPrev} disabled={localIndex === 0} style={{ ...navButtonStyle, backgroundColor: localIndex === 0 ? '#ccc' : COLORS.muted }}>← Prev</button>
        <button onClick={goNext} disabled={localIndex === totalSlides - 1} style={{ ...navButtonStyle, backgroundColor: localIndex === totalSlides - 1 ? '#ccc' : COLORS.primary }}>Next →</button>
      </div>

      {/* Resume Loop */}
      {(() => {
        const autoLoop = presentation.autoLoop;
        if (!autoLoop) return null;
        const isOutsideLoop = localIndex < autoLoop.startSlide || localIndex > autoLoop.endSlide;
        if (!isOutsideLoop) return null;
        return (
          <button
            onClick={() => writeResumeLoop(slug, autoLoop.startSlide)}
            style={{ width: '100%', padding: '16px', marginTop: 12, fontSize: 18, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: COLORS.muted, color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer' }}
          >
            Resume Loop
          </button>
        );
      })()}

      {/* Display Toggles */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          onClick={() => writeShowQuestions(slug, !showQuestions)}
          style={{ flex: 1, padding: '16px 8px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: showQuestions ? COLORS.muted : COLORS.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
        >
          {showQuestions ? 'Hide Questions' : 'Show Questions'}
        </button>
        <button
          onClick={() => writeShowQROverlay(slug, !showQROverlay)}
          style={{ flex: 1, padding: '16px 8px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: showQROverlay ? '#c00' : '#2563EB', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}
        >
          {showQROverlay ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>

      {/* Poll Controls */}
      <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 12, padding: '16px', border: `2px solid ${COLORS.primary}30` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Live Poll</div>
        {!activePoll ? (
          <>
            <input
              type="text"
              placeholder="Enter poll question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', fontSize: 16, fontFamily: FONTS.body, border: `1.5px solid ${COLORS.muted}40`, borderRadius: 10, marginBottom: 12, boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none' }}
            />
            <button
              disabled={creatingPoll || !pollQuestion.trim()}
              onClick={async () => {
                if (!pollQuestion.trim()) return;
                setCreatingPoll(true);
                try { await createPoll(slug, pollQuestion.trim()); setPollQuestion(''); }
                finally { setCreatingPoll(false); }
              }}
              style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: !pollQuestion.trim() ? '#ccc' : COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: pollQuestion.trim() ? 'pointer' : 'default' }}
            >
              {creatingPoll ? 'Starting...' : 'Start Poll'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 16, color: COLORS.text, marginBottom: 8 }}>{activePoll.question}</div>
            <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 12 }}>Status: {activePoll.status} · {pollResponses.length} responses</div>
            {pollResponses.length > 0 && activePoll.status === 'collecting' && (
              <div style={{ marginBottom: 12, maxHeight: 120, overflow: 'auto', fontSize: 13, color: COLORS.text }}>
                {pollResponses.slice(0, 5).map((r) => (
                  <div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${COLORS.muted}10` }}>
                    <span style={{ fontWeight: 600 }}>{r.authorName}:</span> {r.text}
                  </div>
                ))}
                {pollResponses.length > 5 && <div style={{ padding: '4px 0', color: COLORS.muted, fontStyle: 'italic' }}>+{pollResponses.length - 5} more...</div>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activePoll.status === 'collecting' && (
                <button
                  disabled={analyzingPoll || pollResponses.length === 0}
                  onClick={async () => {
                    setAnalyzingPoll(true);
                    try {
                      await writePollStatus(slug, activePoll.id, 'analyzing');
                      const res = await fetch('/api/cluster-poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: activePoll.question, responses: pollResponses.map((r) => r.text) }) });
                      const data = await res.json();
                      if (data.clusters) { await writePollResults(slug, activePoll.id, data); }
                      else { await writePollStatus(slug, activePoll.id, 'collecting'); }
                    } catch { await writePollStatus(slug, activePoll.id, 'collecting'); }
                    finally { setAnalyzingPoll(false); }
                  }}
                  style={{ flex: 1, padding: '14px 8px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: pollResponses.length === 0 ? '#ccc' : '#2563EB', color: '#fff', border: 'none', borderRadius: 10, cursor: pollResponses.length > 0 ? 'pointer' : 'default' }}
                >
                  {analyzingPoll ? 'Analyzing...' : 'Analyze Responses'}
                </button>
              )}
              {activePoll.status === 'results' && (
                <button
                  onClick={() => writeShowPollResults(slug, !showPollResults)}
                  style={{ flex: 1, padding: '14px 8px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: showPollResults ? '#c00' : COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                >
                  {showPollResults ? 'Hide Results' : 'Show Results'}
                </button>
              )}
              <button
                onClick={() => clearActivePoll(slug)}
                style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, backgroundColor: COLORS.muted, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
              >
                Clear Poll
              </button>
            </div>
          </>
        )}
      </div>

      {/* Audience Questions */}
      <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 12, padding: '16px', border: `1px solid ${COLORS.muted}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Audience Questions ({questions.length})</div>
          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{ fontSize: 11, fontWeight: 600, fontFamily: FONTS.body, color: COLORS.muted, background: 'none', border: `1px solid ${COLORS.muted}40`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
            >
              {showArchived ? 'Hide' : 'Show'} Archived ({archivedCount})
            </button>
          )}
        </div>
        {highlightedQuestion && (
          <button
            onClick={() => writeHighlightedQuestion(slug, null)}
            style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: '#c00', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 12 }}
          >
            Clear Highlighted Question
          </button>
        )}
        {questions.length === 0 ? (
          <div style={{ fontSize: 14, color: COLORS.muted }}>No questions yet.</div>
        ) : (
          questions.slice(0, 10).map((q) => (
            <div key={q.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.muted}10`, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 16, color: COLORS.primary, minWidth: 30, textAlign: 'center' }}>{q.upvotes}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.4 }}>{q.text}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                  {q.authorName || 'Anonymous'}
                  {q.targetSpeakers.length > 0 && ` · For: ${q.targetSpeakers.join(', ')}`}
                </div>
              </div>
              <button
                onClick={() => {
                  if (highlightedQuestion?.id === q.id) { writeHighlightedQuestion(slug, null); }
                  else { writeHighlightedQuestion(slug, { id: q.id, text: q.text, authorName: q.authorName, upvotes: q.upvotes }); }
                }}
                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: highlightedQuestion?.id === q.id ? '#c00' : COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {highlightedQuestion?.id === q.id ? 'Clear' : 'Highlight'}
              </button>
              {!q.archived && (
                <button
                  onClick={() => archiveQuestion(slug, q.id)}
                  style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: COLORS.muted, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Archive
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sign out */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={() => auth.signOut()}
          style={{ background: 'none', border: 'none', color: COLORS.muted, fontFamily: FONTS.body, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign out ({user.email})
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F8FAFC',
};

const signInButtonStyle: React.CSSProperties = {
  padding: '14px 32px',
  fontSize: 18,
  fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
  backgroundColor: '#6366F1',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
};

const navButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px 0',
  fontSize: 20,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
};

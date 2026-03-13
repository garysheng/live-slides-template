'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { presentations } from '@/lib/presentations';
import { useQuestions, submitQuestion, upvoteQuestion, removeUpvote, getSessionIdForVoting, moderateQuestion } from '@/lib/useQA';
import { useActivePollId, usePoll, submitPollResponse, hasSubmittedPoll, markPollSubmitted } from '@/lib/usePoll';
import { COLORS, FONTS } from '@/lib/theme';

export default function QAPage() {
  const params = useParams();
  const slug = params.slug as string;
  const presentation = presentations.find((p) => p.slug === slug);
  const allQuestions = useQuestions(slug);
  const questions = allQuestions.filter((q) => !q.archived);

  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState('');

  const activePollId = useActivePollId(slug);
  const activePoll = usePoll(slug, activePollId);
  const [pollAnswer, setPollAnswer] = useState('');
  const [pollName, setPollName] = useState('');
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [pollSubmitted, setPollSubmitted] = useState(false);

  if (!presentation) {
    return (
      <div style={containerStyle}>
        <div style={{ color: '#c00', fontFamily: FONTS.body }}>Presentation not found</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setModerationError('');
    try {
      const modResult = await moderateQuestion(text.trim());
      if (!modResult.approved) {
        setModerationError(modResult.reason || 'Your question was flagged as inappropriate. Please rephrase and try again.');
        return;
      }
      await submitQuestion(slug, text.trim(), authorName.trim() || 'Anonymous', selectedSpeakers);
      setText('');
      setSelectedSpeakers([]);
    } finally {
      setSubmitting(false);
    }
  };

  const sessionId = typeof window !== 'undefined' ? getSessionIdForVoting() : '';

  const handleVoteToggle = async (questionId: string, upvotedBy: string[]) => {
    if (upvotedBy.includes(sessionId)) {
      await removeUpvote(slug, questionId);
    } else {
      await upvoteQuestion(slug, questionId);
    }
  };

  const toggleSpeaker = (name: string) => {
    setSelectedSpeakers((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.background, fontFamily: FONTS.body, boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${COLORS.muted}20`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 22, color: COLORS.text }}>{presentation.title}</div>
        <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Ask a Question</div>
        <a
          href={`/follow/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: 10, fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, color: '#fff', backgroundColor: COLORS.primary, padding: '6px 16px', borderRadius: 8, textDecoration: 'none' }}
        >
          Follow Along with Slides →
        </a>
      </div>

      {/* Active Poll */}
      {activePoll && activePoll.status === 'collecting' && (
        <div style={{ padding: '16px', borderBottom: `2px solid ${COLORS.primary}30` }}>
          <div style={{ backgroundColor: `${COLORS.primary}10`, borderRadius: 14, padding: '20px 16px', border: `2px solid ${COLORS.primary}30` }}>
            <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 12, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Live Poll</div>
            <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 20, color: COLORS.text, marginBottom: 16, lineHeight: 1.4 }}>{activePoll.question}</div>
            {pollSubmitted || (activePollId && hasSubmittedPoll(activePollId)) ? (
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: `${COLORS.muted}10`, borderRadius: 10, fontFamily: FONTS.body, fontWeight: 600, fontSize: 15, color: COLORS.muted }}>
                Thanks for your response!
              </div>
            ) : (
              <>
                <input type="text" placeholder="Your name (optional)" value={pollName} onChange={(e) => setPollName(e.target.value)} style={inputStyle} />
                <textarea placeholder="Type your answer..." value={pollAnswer} onChange={(e) => setPollAnswer(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
                <button
                  disabled={pollSubmitting || !pollAnswer.trim()}
                  onClick={async () => {
                    if (!pollAnswer.trim() || !activePollId) return;
                    setPollSubmitting(true);
                    try { await submitPollResponse(slug, activePollId, pollAnswer.trim(), pollName.trim() || 'Anonymous'); markPollSubmitted(activePollId); setPollSubmitted(true); setPollAnswer(''); }
                    finally { setPollSubmitting(false); }
                  }}
                  style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: !pollAnswer.trim() ? '#ccc' : COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: pollAnswer.trim() ? 'pointer' : 'default' }}
                >
                  {pollSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Question form */}
      <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
        <input type="text" placeholder="Your name (optional)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} style={inputStyle} />
        <textarea placeholder="Type your question..." value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
        {presentation.speakers.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 6 }}>For (optional):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {presentation.speakers.map((speaker) => (
                <button
                  key={speaker.name}
                  type="button"
                  onClick={() => toggleSpeaker(speaker.name)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1.5px solid ${selectedSpeakers.includes(speaker.name) ? COLORS.primary : COLORS.muted + '40'}`,
                    backgroundColor: selectedSpeakers.includes(speaker.name) ? COLORS.primary + '15' : '#fff',
                    color: selectedSpeakers.includes(speaker.name) ? COLORS.primary : COLORS.text,
                    fontFamily: FONTS.body,
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {speaker.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {moderationError && (
          <div style={{ padding: '10px 14px', marginBottom: 12, backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, color: '#B91C1C', fontSize: 14, lineHeight: 1.4 }}>
            {moderationError}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, fontFamily: FONTS.body, backgroundColor: !text.trim() ? '#ccc' : COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: text.trim() ? 'pointer' : 'default' }}
        >
          {submitting ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>

      {/* Questions list */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Questions ({questions.length})
        </div>
        {questions.length === 0 && (
          <div style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', padding: 20 }}>No questions yet. Be the first to ask!</div>
        )}
        {questions.map((q) => {
          const hasVoted = q.upvotedBy.includes(sessionId);
          return (
            <div key={q.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${COLORS.muted}15` }}>
              <button
                onClick={() => handleVoteToggle(q.id, q.upvotedBy)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 40 }}
              >
                <div style={{ fontSize: 20, color: hasVoted ? COLORS.primary : COLORS.muted }}>▲</div>
                <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 16, color: hasVoted ? COLORS.primary : COLORS.text }}>{q.upvotes}</div>
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.5 }}>{q.text}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
                  {q.authorName}
                  {q.targetSpeakers.length > 0 && <span> · For: {q.targetSpeakers.join(', ')}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F8FAFC',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 16,
  fontFamily: "'DM Sans', sans-serif",
  border: '1.5px solid #64748B40',
  borderRadius: 10,
  marginBottom: 12,
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  outline: 'none',
};

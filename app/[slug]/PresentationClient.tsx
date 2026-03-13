'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SlideDeck } from '@/components/SlideDeck';
import { presentations } from '@/lib/presentations';
import { COLORS, FONTS } from '@/lib/theme';
import { ADMIN_EMAIL } from '@/lib/config';

export default function PresentationClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const presentation = presentations.find((p) => p.slug === slug);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordAuthed, setPasswordAuthed] = useState(false);

  useEffect(() => {
    if (presentation?.password) {
      const p = searchParams.get('p');
      if (p === presentation.password) {
        setPasswordAuthed(true);
      }
    }
  }, [presentation?.password, searchParams]);

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
      <div style={{ color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Presentation not found
      </div>
    );
  }

  if (presentation.password && !passwordAuthed) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: COLORS.background,
          fontFamily: FONTS.body,
          gap: 20,
        }}
      >
        <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 28, color: COLORS.text }}>
          This presentation is password-protected
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === presentation.password) {
              setPasswordAuthed(true);
              setPasswordError(false);
              const url = new URL(window.location.href);
              url.searchParams.set('p', passwordInput);
              window.history.replaceState({}, '', url.toString());
            } else {
              setPasswordError(true);
            }
          }}
          style={{ display: 'flex', gap: 10, alignItems: 'center' }}
        >
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            placeholder="Enter password"
            autoFocus
            style={{
              fontFamily: FONTS.body,
              fontSize: 18,
              padding: '10px 16px',
              borderRadius: 10,
              border: `2px solid ${passwordError ? '#e74c3c' : COLORS.primary}40`,
              outline: 'none',
              width: 260,
            }}
          />
          <button
            type="submit"
            style={{
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 16,
              color: '#fff',
              backgroundColor: COLORS.primary,
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            Enter
          </button>
        </form>
        {passwordError && (
          <div style={{ fontFamily: FONTS.body, fontSize: 15, color: '#e74c3c' }}>Incorrect password</div>
        )}
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

  return <SlideDeck presentation={presentation} />;
}

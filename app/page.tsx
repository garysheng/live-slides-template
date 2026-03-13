'use client';

import { useEffect, useState } from 'react';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Background } from '@/components/Background';
import { PresentationList } from '@/components/PresentationList';
import { presentations } from '@/lib/presentations';
import { COLORS, FONTS } from '@/lib/theme';
import { ADMIN_EMAIL } from '@/lib/config';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [signInError, setSignInError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleSignIn = async () => {
    setSignInError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setSignInError(err?.code || err?.message || 'Sign-in failed');
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100dvh',
        backgroundColor: '#111',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
      }}
    >
      <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', overflow: 'hidden' }}>
        <Background slideIndex={0} totalSlides={1} />

        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'rgba(255,255,255,0.85)',
                padding: '6px 14px',
                borderRadius: 10,
                border: `1px solid ${COLORS.primary}40`,
              }}
            >
              {isAdmin && (
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 12,
                    color: COLORS.primary,
                    backgroundColor: `${COLORS.primary}15`,
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  Admin
                </div>
              )}
              <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 13, color: COLORS.text }}>
                {user.displayName || user.email}
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#fff',
                  backgroundColor: COLORS.muted,
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 12px',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 13,
                color: '#fff',
                backgroundColor: COLORS.primary,
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Admin Login
            </button>
          )}
          {signInError && (
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 11,
                color: '#c00',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              {signInError}
            </div>
          )}
        </div>

        <PresentationList presentations={presentations} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface HighlightedQuestion {
  id: string;
  text: string;
  authorName: string;
  upvotes: number;
}

export function useSlideIndex(slug: string, skip = false) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (skip) return;
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.slideIndex === 'number') {
            setSlideIndex(data.slideIndex);
          }
        }
      },
      (error) => {
        console.error('[PresenterSync] onSnapshot error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug, skip]);

  return slideIndex;
}

export function useShowQuestions(slug: string) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setShow(snapshot.data().showQuestions ?? false);
        }
      },
      (error) => {
        console.error('[PresenterSync] useShowQuestions error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug]);

  return show;
}

export function useHighlightedQuestion(slug: string) {
  const [question, setQuestion] = useState<HighlightedQuestion | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setQuestion(snapshot.data().highlightedQuestion ?? null);
        }
      },
      (error) => {
        console.error('[PresenterSync] useHighlightedQuestion error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug]);

  return question;
}

export async function writeSlideIndex(slug: string, index: number) {
  try {
    const docRef = doc(db, 'sessions', slug);
    await setDoc(docRef, {
      slideIndex: index,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('[PresenterSync] writeSlideIndex error:', error);
  }
}

export async function writeShowQuestions(slug: string, show: boolean) {
  try {
    const docRef = doc(db, 'sessions', slug);
    await setDoc(docRef, {
      showQuestions: show,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('[PresenterSync] writeShowQuestions error:', error);
  }
}

export function useShowQROverlay(slug: string) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setShow(snapshot.data().showQROverlay ?? false);
        }
      },
      (error) => {
        console.error('[PresenterSync] useShowQROverlay error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug]);

  return show;
}

export async function writeShowQROverlay(slug: string, show: boolean) {
  try {
    const docRef = doc(db, 'sessions', slug);
    await setDoc(docRef, {
      showQROverlay: show,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('[PresenterSync] writeShowQROverlay error:', error);
  }
}

export async function writeHighlightedQuestion(slug: string, question: HighlightedQuestion | null) {
  try {
    const docRef = doc(db, 'sessions', slug);
    await setDoc(docRef, {
      highlightedQuestion: question,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('[PresenterSync] writeHighlightedQuestion error:', error);
  }
}

export function useResumeLoop(slug: string) {
  const [resumeLoop, setResumeLoop] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.resumeLoop === true) {
            setResumeLoop(true);
          }
        }
      },
      (error) => {
        console.error('[PresenterSync] useResumeLoop error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug]);

  return resumeLoop;
}

export async function writeResumeLoop(slug: string, startSlide: number) {
  try {
    const docRef = doc(db, 'sessions', slug);
    await setDoc(docRef, {
      resumeLoop: true,
      slideIndex: startSlide,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('[PresenterSync] writeResumeLoop error:', error);
  }
}

export async function clearResumeLoop(slug: string) {
  try {
    const docRef = doc(db, 'sessions', slug);
    await setDoc(docRef, { resumeLoop: false }, { merge: true });
  } catch (error) {
    console.error('[PresenterSync] clearResumeLoop error:', error);
  }
}

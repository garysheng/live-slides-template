'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Question {
  id: string;
  text: string;
  authorName: string;
  targetSpeakers: string[];
  upvotes: number;
  upvotedBy: string[];
  createdAt: Date | null;
  archived: boolean;
}

function getSessionId(): string {
  const key = 'qa-session-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useQuestions(slug: string) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'sessions', slug, 'questions'),
      orderBy('upvotes', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs: Question[] = snapshot.docs.map((d) => ({
        id: d.id,
        text: d.data().text ?? '',
        authorName: d.data().authorName ?? '',
        targetSpeakers: d.data().targetSpeakers ?? [],
        upvotes: d.data().upvotes ?? 0,
        upvotedBy: d.data().upvotedBy ?? [],
        createdAt: d.data().createdAt?.toDate() ?? null,
        archived: d.data().archived ?? false,
      }));
      setQuestions(qs);
    });
    return unsubscribe;
  }, [slug]);

  return questions;
}

export async function moderateQuestion(text: string): Promise<{ approved: boolean; reason?: string }> {
  try {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return await res.json();
  } catch {
    // On network error, allow through
    return { approved: true };
  }
}

export async function submitQuestion(
  slug: string,
  text: string,
  authorName: string,
  targetSpeakers: string[]
) {
  const sessionId = getSessionId();
  await addDoc(collection(db, 'sessions', slug, 'questions'), {
    text,
    authorName,
    targetSpeakers,
    upvotes: 1,
    upvotedBy: [sessionId],
    createdAt: serverTimestamp(),
  });
}

export async function upvoteQuestion(slug: string, questionId: string) {
  const sessionId = getSessionId();
  const docRef = doc(db, 'sessions', slug, 'questions', questionId);
  await updateDoc(docRef, {
    upvotes: increment(1),
    upvotedBy: arrayUnion(sessionId),
  });
}

export async function removeUpvote(slug: string, questionId: string) {
  const sessionId = getSessionId();
  const docRef = doc(db, 'sessions', slug, 'questions', questionId);
  await updateDoc(docRef, {
    upvotes: increment(-1),
    upvotedBy: arrayRemove(sessionId),
  });
}

export async function archiveQuestion(slug: string, questionId: string) {
  const docRef = doc(db, 'sessions', slug, 'questions', questionId);
  await updateDoc(docRef, { archived: true });
}

export async function deleteQuestion(slug: string, questionId: string) {
  const docRef = doc(db, 'sessions', slug, 'questions', questionId);
  await deleteDoc(docRef);
}

export function getSessionIdForVoting() {
  return getSessionId();
}

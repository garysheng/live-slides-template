'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PollResponse {
  id: string;
  text: string;
  authorName: string;
  sessionId: string;
  createdAt: Date | null;
}

export interface PollCluster {
  label: string;
  count: number;
  responses: string[];
  color: string;
}

export interface PollData {
  id: string;
  question: string;
  status: 'collecting' | 'analyzing' | 'results';
  createdAt: Date | null;
  clusteredResults: {
    clusters: PollCluster[];
    summary: string;
  } | null;
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

// Listen to the active poll ID for a session
export function useActivePollId(slug: string) {
  const [activePollId, setActivePollId] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setActivePollId(snapshot.data().activePollId ?? null);
        }
      },
      (error) => {
        console.error('[Poll] useActivePollId error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug]);

  return activePollId;
}

// Listen to showPollResults toggle
export function useShowPollResults(slug: string) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'sessions', slug);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setShow(snapshot.data().showPollResults ?? false);
        }
      },
      (error) => {
        console.error('[Poll] useShowPollResults error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug]);

  return show;
}

// Listen to a specific poll document
export function usePoll(slug: string, pollId: string | null) {
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    if (!pollId) {
      setPoll(null);
      return;
    }
    const docRef = doc(db, 'sessions', slug, 'polls', pollId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPoll({
            id: snapshot.id,
            question: data.question ?? '',
            status: data.status ?? 'collecting',
            createdAt: data.createdAt?.toDate() ?? null,
            clusteredResults: data.clusteredResults ?? null,
          });
        } else {
          setPoll(null);
        }
      },
      (error) => {
        console.error('[Poll] usePoll error:', error.message);
      }
    );
    return unsubscribe;
  }, [slug, pollId]);

  return poll;
}

// Listen to poll responses
export function usePollResponses(slug: string, pollId: string | null) {
  const [responses, setResponses] = useState<PollResponse[]>([]);

  useEffect(() => {
    if (!pollId) {
      setResponses([]);
      return;
    }
    const q = query(
      collection(db, 'sessions', slug, 'polls', pollId, 'responses'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rs: PollResponse[] = snapshot.docs.map((d) => ({
        id: d.id,
        text: d.data().text ?? '',
        authorName: d.data().authorName ?? '',
        sessionId: d.data().sessionId ?? '',
        createdAt: d.data().createdAt?.toDate() ?? null,
      }));
      setResponses(rs);
    });
    return unsubscribe;
  }, [slug, pollId]);

  return responses;
}

// Create a new poll and set it as active
export async function createPoll(slug: string, question: string): Promise<string> {
  const pollRef = await addDoc(collection(db, 'sessions', slug, 'polls'), {
    question,
    status: 'collecting',
    createdAt: serverTimestamp(),
    clusteredResults: null,
  });

  await setDoc(doc(db, 'sessions', slug), {
    activePollId: pollRef.id,
    showPollResults: false,
  }, { merge: true });

  return pollRef.id;
}

// Submit a response to the active poll
export async function submitPollResponse(
  slug: string,
  pollId: string,
  text: string,
  authorName: string
) {
  const sessionId = getSessionId();
  await addDoc(collection(db, 'sessions', slug, 'polls', pollId, 'responses'), {
    text,
    authorName,
    sessionId,
    createdAt: serverTimestamp(),
  });
}

// Check if current session already submitted
export function hasSubmittedPoll(pollId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`poll-submitted-${pollId}`) === 'true';
}

export function markPollSubmitted(pollId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`poll-submitted-${pollId}`, 'true');
  }
}

// Write poll status
export async function writePollStatus(slug: string, pollId: string, status: 'collecting' | 'analyzing' | 'results') {
  const docRef = doc(db, 'sessions', slug, 'polls', pollId);
  await setDoc(docRef, { status }, { merge: true });
}

// Write clustered results
export async function writePollResults(
  slug: string,
  pollId: string,
  clusteredResults: { clusters: PollCluster[]; summary: string }
) {
  const docRef = doc(db, 'sessions', slug, 'polls', pollId);
  await setDoc(docRef, {
    status: 'results',
    clusteredResults,
  }, { merge: true });
}

// Toggle showing poll results on the presentation screen
export async function writeShowPollResults(slug: string, show: boolean) {
  const docRef = doc(db, 'sessions', slug);
  await setDoc(docRef, { showPollResults: show }, { merge: true });
}

// Clear the active poll
export async function clearActivePoll(slug: string) {
  const docRef = doc(db, 'sessions', slug);
  await setDoc(docRef, {
    activePollId: null,
    showPollResults: false,
  }, { merge: true });
}

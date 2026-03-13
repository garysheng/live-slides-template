# Live Slides Template

A real-time presentation platform built with Next.js, Firebase, and Gemini AI. Present slides from any device while your audience follows along, asks questions, and participates in live polls.

## What It Does

**Presenter** controls slides from their phone. **Audience** follows along in real-time on their devices. Questions are submitted, AI-moderated, and upvoted live. Polls collect free-text responses and AI clusters them into themes.

### Routes

| Route | Who | Purpose |
|---|---|---|
| `/` | Everyone | Home page with presentation list and admin login |
| `/example` | Presenter | Main projector display (1920x1080, scaled to fit) |
| `/presenter/example` | Presenter (phone) | Mobile remote with notes, navigation, Q&A, polls |
| `/qa/example` | Audience | Submit and upvote questions, respond to polls |
| `/follow/example` | Audience | Follow slides in sync or browse freely |

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url> my-slides
cd my-slides
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Firestore Database** (start in test mode for development)
3. Enable **Authentication** and add **Google** as a sign-in provider
4. Go to Project Settings > General > Your apps > Add a web app
5. Copy the config values

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase config and admin email:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX

NEXT_PUBLIC_ADMIN_EMAIL=you@gmail.com
```

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the admin email to access presenter mode.

### 5. (Optional) Enable AI features

Get a free Gemini API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) and add it to `.env.local`:

```
GEMINI_API_KEY=your-key-here
```

This enables:
- **Q&A moderation**: Automatically filters inappropriate questions
- **Poll clustering**: Groups free-text poll responses into themes with a summary

Without the key, all questions are approved and poll clustering is disabled.

## How to Create a Presentation

### 1. Create a folder

```
lib/presentations/my-talk/
  slides/
    TitleSlide.tsx
    ContentSlide.tsx
    index.ts
  index.ts
```

### 2. Create slide components

Each slide is a React component rendered at 1920x1080. Use the theme for consistent styling:

```tsx
// lib/presentations/my-talk/slides/TitleSlide.tsx
import { COLORS, FONTS } from '@/lib/theme';

export const TitleSlide: React.FC = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 120px',
      position: 'relative',
      zIndex: 5,
    }}
  >
    <div style={{
      fontFamily: FONTS.heading,
      fontWeight: 700,
      fontSize: 72,
      color: COLORS.text,
      textAlign: 'center',
    }}>
      My Talk Title
    </div>
    <div style={{
      fontFamily: FONTS.body,
      fontSize: 28,
      color: COLORS.muted,
      marginTop: 24,
    }}>
      Subtitle or date
    </div>
  </div>
);
```

### 3. Export slides

```tsx
// lib/presentations/my-talk/slides/index.ts
export { TitleSlide } from './TitleSlide';
export { ContentSlide } from './ContentSlide';
```

### 4. Create presentation config

```tsx
// lib/presentations/my-talk/index.ts
import type { SlidesConfig } from '../types';
import { TitleSlide, ContentSlide } from './slides';

export const presentation: SlidesConfig = {
  type: 'slides',
  title: 'My Talk',
  subtitle: 'Optional subtitle shown on home page',
  slug: 'my-talk',           // URL path: /my-talk, /presenter/my-talk, etc.
  speakers: [
    { name: 'Jane Doe', email: 'jane@example.com' },
  ],
  slides: [TitleSlide, ContentSlide],
  notes: [
    'Welcome everyone to the talk.',
    'Explain the main content here.',
  ],
};
```

### 5. Register it

```tsx
// lib/presentations/index.ts
import { presentation as myTalk } from './my-talk';
import type { PresentationConfig } from './types';

export const presentations: PresentationConfig[] = [myTalk];
```

That's it. Visit `/my-talk` to see it, or `/presenter/my-talk` from your phone.

## Presentation Config Options

```typescript
{
  type: 'slides',
  title: string,              // Display name
  subtitle?: string,          // Shown on home page
  slug: string,               // URL path segment
  speakers: Speaker[],        // { name, email } - shown in Q&A targeting
  slides: React.FC[],         // Array of slide components
  notes?: string[],           // Presenter notes per slide (shown on phone)
  hideQA?: boolean,           // Hide Q&A panel and QR codes
  adminOnly?: boolean,        // Require admin auth to view
  password?: string,          // Password-protect the deck
  presented?: boolean,        // Disable sync (audience browses freely from slide 1)
  sections?: SlideSection[],  // Breadcrumb sections: { label, startSlide }
  autoLoop?: {                // Auto-advance slides in a range
    startSlide: number,
    endSlide: number,
    intervalMs: number,
    overrides?: Record<number, number>,  // Per-slide timing
  },
  event?: {                   // Group presentations by event on home page
    name: string,
    location: string,
    date: string,
  },
}
```

## Customization

### Theme

Edit `lib/theme.ts` to change colors and fonts:

```typescript
export const COLORS = {
  primary: '#6366F1',     // Main accent (buttons, highlights, dots)
  secondary: '#F59E0B',   // Secondary accent
  background: '#F8FAFC',  // Page background
  surface: '#FFFFFF',     // Card/panel background
  text: '#1E293B',        // Primary text
  muted: '#64748B',       // Secondary text
  dark: '#0F172A',        // Dark backgrounds
};
```

### Background

Edit `components/Background.tsx` to change the slide background. The default is a subtle gradient with a grid pattern and floating orb. You can replace it with anything: images, gradients, or solid colors.

### Keyboard Shortcuts (projector view)

| Key | Action |
|---|---|
| Arrow Right / Space | Next slide |
| Arrow Left | Previous slide |
| Escape | Back to home |
| F | Toggle fullscreen |
| L | Resume auto-loop |

## Architecture

```
Firebase Firestore (real-time sync)
  └── sessions/{slug}
        ├── slideIndex, showQuestions, showQROverlay, highlightedQuestion
        ├── activePollId, showPollResults
        ├── questions/ (subcollection)
        │     └── {id}: text, authorName, targetSpeakers, upvotes, upvotedBy, archived
        └── polls/ (subcollection)
              ├── {id}: question, status, clusteredResults
              └── responses/ (sub-subcollection)
                    └── {id}: text, authorName, sessionId
```

**Data flow**: Presenter writes state (slide index, toggles) to Firestore. All other screens read via `onSnapshot` real-time listeners. Questions and poll responses are written directly by audience browsers.

### Firestore Security Rules

For production, replace the test-mode rules with something like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{slug} {
      allow read: if true;
      allow write: if request.auth != null;

      match /questions/{questionId} {
        allow read: if true;
        allow create: if true;
        allow update: if true;
        allow delete: if request.auth != null;
      }

      match /polls/{pollId} {
        allow read: if true;
        allow write: if request.auth != null;

        match /responses/{responseId} {
          allow read: if true;
          allow create: if true;
        }
      }
    }
  }
}
```

## Deployment

Works with any Next.js hosting. For Vercel:

```bash
npm install -g vercel
vercel
```

Set your environment variables in the Vercel dashboard (Settings > Environment Variables).

For the `local-ip` API route (used for QR codes on localhost), this only matters during local development. In production, QR codes use your deployed URL automatically.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Firebase** (Firestore for real-time sync, Auth for admin access)
- **Framer Motion** (slide transitions and overlays)
- **Gemini AI** (optional: Q&A moderation and poll clustering)
- **qrcode** (QR code generation for audience access)

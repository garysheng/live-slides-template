# Set Up Live Slides as Your Presentation Platform

You are configuring this Next.js template as a working real-time presentation platform. Live Slides syncs slide navigation, audience Q&A, and live polls through Firebase in real-time. When you're done, the presenter controls slides from their phone while the audience follows along, submits questions, and responds to polls on their devices.

## What You're Building

A deployed presentation platform with Firebase real-time sync, Google authentication for presenter access, and optionally Gemini-powered Q&A moderation and poll clustering. The presenter navigates slides from a mobile remote. The audience follows along, asks AI-moderated questions, and upvotes them. The presenter can highlight questions on the projector and run live polls that AI clusters into themes.

## Read the Codebase First

Read this codebase. Find:

- `lib/theme.ts` for brand colors and fonts (you will customize these)
- `lib/config.ts` for admin email configuration
- `lib/presentations/` for how presentations are registered
- `lib/presentations/example/` for the example presentation structure
- `components/Background.tsx` for the slide background (customizable)
- `.env.example` for all required environment variables

Understand the presentation config shape in `lib/presentations/types.ts` before creating any slides.

## Concept Map

| This template calls it | What it means |
|---|---|
| Presentation | A deck of React components rendered at 1920x1080 |
| Slug | URL path segment identifying a presentation (e.g., `my-talk`) |
| Session | A Firestore document at `sessions/{slug}` holding live state |
| Presenter remote | Mobile-optimized page at `/presenter/{slug}` with notes and controls |
| Follow-along | Audience page at `/follow/{slug}` synced to presenter's slide |
| Q&A page | Audience page at `/qa/{slug}` for submitting and upvoting questions |

## Integration Steps

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Firestore Database** in the Build section. Start in test mode for development.
3. Enable **Authentication** in the Build section. Add **Google** as a sign-in provider.
4. Go to Project Settings > General > Your apps > click the web icon (`</>`) to add a web app.
5. Copy the `firebaseConfig` object values.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all `NEXT_PUBLIC_FIREBASE_*` values from the Firebase config object. Set `NEXT_PUBLIC_ADMIN_EMAIL` to the Google account that should have presenter access.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase console > Project settings > General > Web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same location, `authDomain` field |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same location, `projectId` field |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same location, `storageBucket` field |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same location, `messagingSenderId` field |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same location, `appId` field |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Same location, `measurementId` field (optional) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Your Google account email |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (optional) |

### 3. Customize the theme

Edit `lib/theme.ts`. Replace the default colors and fonts with your brand:

```typescript
export const COLORS = {
  primary: '#YOUR_ACCENT',    // Buttons, highlights, active indicators
  secondary: '#YOUR_SECONDARY', // Secondary accent
  background: '#YOUR_BG',     // Page backgrounds (presenter, Q&A, follow)
  surface: '#FFFFFF',         // Card/panel backgrounds
  text: '#YOUR_TEXT',         // Primary text color
  muted: '#YOUR_MUTED',      // Secondary text, disabled states
  dark: '#YOUR_DARK',        // Dark backgrounds (slide viewer shell)
};
```

Colors are referenced throughout all components. Changing them here updates the entire UI.

### 4. Customize the background

Edit `components/Background.tsx`. The default is a gradient with a subtle grid pattern and floating orb. Replace it with your own design: images, gradients, illustrations, or solid colors. The component receives `slideIndex` and `totalSlides` props for parallax or progress-based effects.

### 5. Create a presentation

Create a folder under `lib/presentations/`:

```
lib/presentations/my-talk/
  slides/
    TitleSlide.tsx
    ContentSlide.tsx
    slides/index.ts
  index.ts
```

Each slide is a React component. The canvas is 1920x1080 pixels, scaled to fit the viewport. Use `position: relative; zIndex: 5` on your content to layer above the background.

```tsx
// lib/presentations/my-talk/slides/TitleSlide.tsx
import { COLORS, FONTS } from '@/lib/theme';

export const TitleSlide: React.FC = () => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    padding: '0 120px', position: 'relative', zIndex: 5,
  }}>
    <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 72, color: COLORS.text }}>
      Talk Title
    </div>
  </div>
);
```

Export slides from a barrel file and register the presentation:

```tsx
// lib/presentations/my-talk/index.ts
import type { SlidesConfig } from '../types';
import { TitleSlide, ContentSlide } from './slides';

export const presentation: SlidesConfig = {
  type: 'slides',
  title: 'My Talk',
  slug: 'my-talk',
  speakers: [{ name: 'Speaker Name', email: 'speaker@example.com' }],
  slides: [TitleSlide, ContentSlide],
  notes: ['Welcome note', 'Content note'],
};
```

Add it to `lib/presentations/index.ts`:

```typescript
import { presentation as myTalk } from './my-talk';
export const presentations: PresentationConfig[] = [myTalk];
```

### 6. Set Firestore security rules

In the Firebase Console, go to Firestore > Rules and replace with:

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

### 7. Deploy

Deploy to any Next.js host. For Vercel:

```bash
npx vercel
```

Set all environment variables from `.env.local` in the hosting dashboard.

## Presentation Config Reference

| Field | Type | Required | Purpose |
|---|---|---|---|
| `type` | `'slides'` | Yes | Presentation type |
| `title` | `string` | Yes | Display name on home page and presenter |
| `slug` | `string` | Yes | URL segment: `/{slug}`, `/presenter/{slug}`, `/qa/{slug}` |
| `speakers` | `Speaker[]` | Yes | Names shown in Q&A speaker targeting |
| `slides` | `React.FC[]` | Yes | Array of slide components (1920x1080 canvas) |
| `subtitle` | `string` | No | Shown on home page card |
| `notes` | `string[]` | No | Presenter notes per slide (shown on phone) |
| `sections` | `SlideSection[]` | No | Breadcrumb sections: `{ label, startSlide }` |
| `autoLoop` | `AutoLoopConfig` | No | Auto-advance slides in a range |
| `hideQA` | `boolean` | No | Hide Q&A panel and QR codes |
| `adminOnly` | `boolean` | No | Require admin auth to view |
| `password` | `string` | No | Password-protect the deck |
| `presented` | `boolean` | No | Disable sync, audience browses freely |
| `event` | `{ name, location, date }` | No | Group presentations by event on home page |

## Firestore Data Shape

```
sessions/{slug}
  slideIndex: number
  showQuestions: boolean
  showQROverlay: boolean
  highlightedQuestion: { id, text, authorName, upvotes } | null
  activePollId: string | null
  showPollResults: boolean
  questions/ (subcollection)
    {id}: { text, authorName, targetSpeakers[], upvotes, upvotedBy[], archived, createdAt }
  polls/ (subcollection)
    {id}: { question, status, clusteredResults, createdAt }
    responses/ (sub-subcollection)
      {id}: { text, authorName, sessionId, createdAt }
```

## Quick Test

```bash
npm run dev
```

1. Open `http://localhost:3000`. Sign in with the admin email.
2. Click into the example presentation. Slides render at 1920x1080 scaled to your viewport.
3. Open `http://localhost:3000/presenter/example` on your phone. Navigate slides. The projector view follows.
4. Open `http://localhost:3000/qa/example` in another tab. Submit a question. It appears in the presenter's question list.
5. From the presenter remote, tap "Highlight" on a question. It displays as a full-screen overlay on the projector.

## Links

- [INTEGRATE.md Spec](https://docs.appliedaisociety.org/docs/standards/integrate-md)
- [Firebase Console](https://console.firebase.google.com)
- [Gemini API Keys](https://aistudio.google.com/apikey)

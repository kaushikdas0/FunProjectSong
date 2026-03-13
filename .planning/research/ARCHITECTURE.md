# Architecture Research

**Domain:** AI-powered compliment card generator (React + Firebase + Gemini Flash)
**Researched:** 2026-03-14 (updated for v2.0 milestone)
**Confidence:** HIGH (Firebase AI Logic official docs, html-to-image GitHub, multiple verified sources)

---

## Milestone Context

This document covers how five new features integrate with the existing v1.0 architecture:

1. Genkit / Firebase AI Logic — name → AI compliment
2. Screen routing — home → generating → result (UI states, not URL routes)
3. html-to-image — capturing `ComplimentCard` as PNG
4. Animated icon background layer — pixelarticons with CSS animation
5. API key handling and overall data flow

**Existing foundation (do not change):**
- `src/App.tsx` — BrowserRouter, `/` → MainScreen, `/kitchen-sink` → KitchenSinkScreen (dev only)
- `src/screens/MainScreen.tsx` — placeholder, will be replaced with full feature composition
- `src/components/Card/ComplimentCard.tsx` — accepts `name` + `compliment` props, pure renderer
- `src/components/Icon/Icon.tsx` — wraps pixelarticons, size must be multiples of 24
- `src/dls/index.css` — Tailwind v4 + CSS @theme block (tokens, typography)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     MainScreen                            │   │
│  │  (owns UI state machine: idle → generating → result)      │   │
│  │                                                            │   │
│  │  ┌────────────────────┐   ┌──────────────────────────┐   │   │
│  │  │   NameInputForm    │   │     ResultView           │   │   │
│  │  │  (name input +     │   │  (ComplimentCard +       │   │   │
│  │  │   generate button) │   │   download button +      │   │   │
│  │  └────────────────────┘   │   regenerate button)     │   │   │
│  │                           └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 AnimatedIconBackground                     │   │
│  │  (fixed layer, z-index behind card, CSS keyframe anim)    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               useCompliment hook                          │   │
│  │  state: { phase, name, compliment, error }                │   │
│  │  action: generate(name) → Firebase AI Logic → text        │   │
│  └──────────────────────────────┬───────────────────────────┘   │
│                                  │                               │
│  ┌───────────────────────────────▼───────────────────────────┐  │
│  │               Firebase AI Logic SDK (firebase/ai)          │  │
│  │   API key NEVER in client bundle — Firebase proxy handles  │  │
│  └───────────────────────────────┬───────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ HTTPS through Firebase proxy
┌──────────────────────────────────▼──────────────────────────────┐
│              Firebase AI Logic Proxy → Gemini Flash API          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Integration Analysis

### 1. Genkit vs Firebase AI Logic — Use Firebase AI Logic

**Decision: Use Firebase AI Logic client SDK (`firebase/ai`), not Genkit.**

Genkit runs on Node.js only. It cannot execute in the browser. Using it would require deploying a Cloud Function or Express server — which contradicts the project constraint "no Cloud Functions needed."

Firebase AI Logic is the correct path: it is a client SDK that calls Gemini directly from the browser through Firebase's proxy, which keeps the API key server-side without any custom backend code.

**Confidence:** HIGH — confirmed by Firebase official docs.

**Integration with existing codebase:**
- New file: `src/firebase/ai.ts` — Firebase app init + model instance (singleton)
- New hook: `src/hooks/useCompliment.ts` — calls the model, manages loading/error state
- `MainScreen.tsx` imports and calls `useCompliment`
- No changes to App.tsx, DLS, Icon, or ComplimentCard

**API key handling:**
The Firebase project config (`firebaseConfig` object) contains a `apiKey` field that identifies your Firebase project. This is safe to include in client code — it identifies the project, not your Gemini API key. The actual Gemini API key lives only in Firebase's infrastructure. Use Vite environment variables (`import.meta.env.VITE_FIREBASE_API_KEY` etc.) to keep the config out of source control.

```typescript
// src/firebase/ai.ts
import { initializeApp } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};

const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });
export const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });
```

---

### 2. Screen Routing — UI State Machine, Not URL Routes

**Decision: A `phase` state variable in `MainScreen`, not new React Router routes.**

The transitions (idle → generating → result → idle) are app state, not navigable URLs. Users should not be able to deep-link to `/generating` or `/result`. Browser back button should go back to idle from the previous URL, not between app phases. Adding URL routes for these states would require React Router state restoration on refresh, which adds complexity for zero benefit.

**Integration with existing codebase:**
- `MainScreen.tsx` is already the `/` route — it expands from placeholder to a stateful component
- `App.tsx` is unchanged — no new routes
- The state machine lives entirely inside `MainScreen` (or in `useCompliment` hook)

**State shape:**
```typescript
type Phase = 'idle' | 'generating' | 'result' | 'error';

// In useCompliment hook
const [phase, setPhase] = useState<Phase>('idle');
const [compliment, setCompliment] = useState('');
const [error, setError] = useState<string | null>(null);
```

**Phase transitions:**
```
idle       — user sees name input + generate button
    ↓ generate(name)
generating — loading spinner, generate button disabled
    ↓ success
result     — ComplimentCard visible, download + regenerate buttons
    ↓ regenerate()
generating — (loops back)
    ↓ error at any point
error      — friendly message + retry button → returns to idle
```

The `AnimatedIconBackground` renders in ALL phases — it is always visible behind the card area.

---

### 3. html-to-image — Card PNG Download

**Decision: `html-to-image` library, `toPng()` function, with `forwardRef` on ComplimentCard.**

**Integration with existing codebase:**
- `ComplimentCard.tsx` needs modification: add `forwardRef` to expose its root `div` ref
- New utility: `src/utils/downloadCard.ts` — calls `toPng()` and triggers download
- Download button in `ResultView` calls `downloadCard(cardRef, name)`

**Font capture requirement (self-hosted Caveat):**
This is the most fragile part of the download flow. `html-to-image` discovers fonts via `@font-face` rules in `<style>` tags. Since Caveat is loaded via `@fontsource/caveat` (which injects a `<style>` tag via CSS import), it should be discoverable. However, there is a known issue where the first call to `toPng()` sometimes renders without fonts because the library's internal fetch of the font file hasn't completed.

**Proven workaround — call `toPng()` twice:**
The first call warms the font cache; the second call uses the cached font. This is an established workaround in the html-to-image community (confirmed in issue discussions). Alternatively, use `getFontEmbedCSS()` once upfront and pass the result to `toPng()`:

```typescript
// src/utils/downloadCard.ts
import { toPng, getFontEmbedCSS } from 'html-to-image';

export async function downloadCard(
  node: HTMLDivElement,
  name: string
): Promise<void> {
  // Await fonts before capture
  await document.fonts.ready;

  // Warm the font embed cache — prevents blank-font first render
  const fontEmbedCSS = await getFontEmbedCSS(node);

  const dataUrl = await toPng(node, {
    pixelRatio: 2,   // Retina output
    fontEmbedCSS,    // Pre-resolved — no second fetch
  });

  const link = document.createElement('a');
  link.download = `compliment-for-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
  link.href = dataUrl;
  link.click();
}
```

**ComplimentCard modification:**
```typescript
// src/components/Card/ComplimentCard.tsx
import { forwardRef } from 'react';

export const ComplimentCard = forwardRef<HTMLDivElement, ComplimentCardProps>(
  ({ name, compliment }, ref) => (
    <div ref={ref} className="bg-cream-50 rounded-card ...">
      {/* existing markup unchanged */}
    </div>
  )
);
```

This is a minimal change — the component still accepts the same props. The only addition is `forwardRef` wrapping and the `ref` forwarded to the root div.

---

### 4. Animated Icon Background

**Decision: Fixed-position CSS-animated layer, z-index below card, pure CSS keyframes, no JS animation.**

**Integration with existing codebase:**
- New component: `src/components/AnimatedIconBackground/AnimatedIconBackground.tsx`
- Uses existing `Icon` component (already imports pixelarticons)
- CSS keyframe animation defined in a new CSS file or inline `<style>` block
- Placed inside `MainScreen.tsx` as a sibling to the card content, positioned to fill the viewport

**Z-index strategy:**
```
z-index: 0  — page background (cream color)
z-index: 1  — AnimatedIconBackground (icons layer)
z-index: 2  — card + form content (always on top)
```

The `MainScreen` wrapper uses `position: relative` so z-index values are contained to the screen stacking context.

**Icon placement approach:**
Scatter 8-12 icon instances across the background using absolute or fixed positioning with percentage-based coordinates. Each icon gets:
- A random-ish position (predefined constants, not runtime random — avoids re-render flicker)
- An opacity between 0.08–0.15 (subtle, not distracting)
- A colored fill using DLS token colors (text-blue-200, text-coral-200, etc.)
- A CSS `@keyframes` animation for a gentle pulse (scale 1 → 1.05 → 1 + subtle opacity shift)
- Staggered `animation-delay` values so they pulse out of sync

**Performance considerations:**
- Use `transform` and `opacity` in keyframes only — these are GPU-composited properties and do not trigger layout recalculation
- Avoid animating `width`, `height`, `top`, `left` — these cause expensive repaints
- `will-change: transform` on each icon div signals the browser to promote to compositor layer
- 8-12 elements is well within safe range for smooth animation on mobile

**Example structure:**
```typescript
// src/components/AnimatedIconBackground/AnimatedIconBackground.tsx
const ICONS = [
  { name: 'brand',      x: '8%',  y: '12%', color: 'text-blue-200',  delay: '0s'    },
  { name: 'decorative', x: '85%', y: '8%',  color: 'text-coral-200', delay: '0.8s'  },
  { name: 'generate',   x: '15%', y: '75%', color: 'text-blue-300',  delay: '1.6s'  },
  // ... more entries
] as const;

export function AnimatedIconBackground() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {ICONS.map((icon, i) => (
        <div
          key={i}
          className="absolute animate-icon-pulse"
          style={{ left: icon.x, top: icon.y, animationDelay: icon.delay }}
        >
          <Icon name={icon.name} size={48} className={`${icon.color} opacity-10`} />
        </div>
      ))}
    </div>
  );
}
```

CSS animation defined in the DLS or a component-scoped stylesheet:
```css
@keyframes icon-pulse {
  0%, 100% { transform: scale(1);    opacity: 0.10; }
  50%       { transform: scale(1.06); opacity: 0.15; }
}
.animate-icon-pulse {
  animation: icon-pulse 4s ease-in-out infinite;
  will-change: transform;
}
```

Note: Tailwind v4 supports arbitrary `animation` values and custom keyframes via the CSS `@theme` block. Define `animate-icon-pulse` there rather than a separate file to keep DLS consolidated.

**The animated background is EXCLUDED from card download.** The card ref points only to the `ComplimentCard` div, not the full screen. `html-to-image` captures only what's inside the ref'd node. The background icons are siblings in the DOM, not children of the card.

---

### 5. API Key — Where It Lives

| Key | Where | How |
|-----|-------|-----|
| Firebase project config (`VITE_FIREBASE_*`) | `.env` file, Vite env vars | Safe in client — identifies project, not Gemini billing key |
| Gemini API key | Firebase infrastructure (never client) | Firebase AI Logic proxy holds it; SDK never exposes it |

Create a `.env` file at project root (add to `.gitignore`). Vite automatically loads it:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...
```

---

## Recommended File Structure (New + Modified)

```
src/
├── dls/                         # EXISTING — unchanged
│   ├── tokens.css
│   ├── typography.css
│   └── index.css                # Add @keyframes for icon-pulse animation here
│
├── components/
│   ├── Card/
│   │   └── ComplimentCard.tsx   # MODIFY — add forwardRef
│   ├── Icon/
│   │   └── Icon.tsx             # EXISTING — unchanged
│   └── AnimatedIconBackground/
│       └── AnimatedIconBackground.tsx  # NEW
│
├── firebase/
│   └── ai.ts                    # NEW — Firebase app init + model singleton
│
├── hooks/
│   └── useCompliment.ts         # NEW — phase state machine + AI call
│
├── utils/
│   └── downloadCard.ts          # NEW — html-to-image capture + download trigger
│
├── screens/
│   ├── MainScreen.tsx           # REPLACE — expand from placeholder to full feature
│   └── KitchenSinkScreen.tsx    # EXISTING — add AnimatedIconBackground preview
│
├── App.tsx                      # EXISTING — unchanged
└── main.tsx                     # EXISTING — unchanged
```

**Change summary:**
- 5 new files: `firebase/ai.ts`, `hooks/useCompliment.ts`, `utils/downloadCard.ts`, `components/AnimatedIconBackground/AnimatedIconBackground.tsx`
- 2 modified files: `ComplimentCard.tsx` (add forwardRef), `MainScreen.tsx` (replace placeholder)
- 0 changed: App.tsx, main.tsx, all DLS files (except adding keyframe CSS), Icon.tsx

---

## Data Flow: Name Input to Card Download

```
1. User types name in NameInputForm
       ↓
2. Clicks "Generate" → useCompliment.generate(name) called
       ↓
3. phase → 'generating', loading UI shown
       ↓
4. firebase/ai.ts model.generateContent(prompt) called
       ↓
5. Firebase AI Logic SDK → Firebase proxy → Gemini Flash API
       ↓
6. Response text returned → phase → 'result', compliment stored in state
       ↓
7. ComplimentCard renders with name + compliment
   TypewriterText component animates compliment text character by character
       ↓
8. User clicks "Download"
       ↓
9. await document.fonts.ready (ensure Caveat loaded)
   getFontEmbedCSS(cardRef.current) called (warm font cache)
   toPng(cardRef.current, { pixelRatio: 2, fontEmbedCSS }) called
       ↓
10. PNG data URL → anchor element .click() → browser file download
```

---

## Typewriter Animation

**Decision: Custom `useTypewriter` hook using `useState` + `useEffect`, no library needed.**

The animation is simple — append one character every N milliseconds. A custom hook is 15 lines of code and has zero dependencies. Libraries like `react-type-animation` add 20KB+ for equivalent functionality.

The typewriter text renders inside `ComplimentCard` — but the downloaded PNG should show the COMPLETE text (not mid-animation). Two options:

- **Option A (recommended):** The `ComplimentCard` component always renders the full `compliment` prop. A separate `TypewriterText` overlay or wrapper outside the card handles the animation for the on-screen preview. Download captures the card which has the full text.
- **Option B:** Pass a `displayText` prop to the card (the partially-typed string) and update it as animation progresses. When the animation completes, `displayText === compliment`. Download is only enabled after animation completes.

Option A is cleaner because `ComplimentCard` stays a pure renderer with no animation logic. The card ref always captures complete text regardless of animation state.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture sufficient — Firebase AI Logic proxy auto-scales |
| 1k-100k users | Add Firebase App Check (reCAPTCHA) to prevent API key abuse; monitor Gemini quota |
| 100k+ users | Rate limiting via Cloud Functions wrapper; switch to Vertex AI backend for higher quotas |

---

## Anti-Patterns

### Anti-Pattern 1: Using Genkit Instead of Firebase AI Logic

**What people do:** Follow Genkit tutorials, set up a Cloud Function to run Genkit flows, call the function from the client.

**Why it's wrong:** Adds cold-start latency, a separate deployment step, and Cloud Function billing — for no benefit on a simple one-prompt app. Genkit runs Node.js only; it cannot run in the browser.

**Do this instead:** Firebase AI Logic SDK calls Gemini directly from the browser through a Firebase-managed proxy. No Cloud Function needed.

### Anti-Pattern 2: New React Router Routes for Loading/Result States

**What people do:** Create `/generating` and `/result` routes to show different screens during generation.

**Why it's wrong:** Users can refresh `/generating` and see a broken state. The browser back button navigates to `/generating` instead of the home page. Deep links to intermediate states don't make sense.

**Do this instead:** A `phase` state variable in `MainScreen` (or `useCompliment` hook). React conditionally renders the right UI. The URL stays `/` throughout.

### Anti-Pattern 3: Animating Icon Background with JavaScript

**What people do:** Use `requestAnimationFrame` or `setInterval` to update icon positions/opacity in React state.

**Why it's wrong:** Every state update re-renders the component tree. 12 icons animating at 60fps = thousands of re-renders per second. Kills performance, especially on mobile.

**Do this instead:** CSS `@keyframes` with `animation` property. The browser compositor handles animation entirely off the React render cycle. GPU-composited `transform` and `opacity` animate without triggering layout.

### Anti-Pattern 4: Capturing Full Screen Instead of Card Ref

**What people do:** Point `html-to-image` at `document.body` or a full-page wrapper.

**Why it's wrong:** Download captures the background, navigation, animated icons, and browser chrome artifacts.

**Do this instead:** Forward a `ref` to the `ComplimentCard` root div only. `toPng(cardRef.current)` captures exactly the card with its white/cream background — clean, portable, shareable.

### Anti-Pattern 5: Skipping `document.fonts.ready` Before PNG Export

**What people do:** Call `toPng()` immediately on button click.

**Why it's wrong:** If Caveat font hasn't finished loading (rare but possible on slow connections), the card renders with system fallback fonts in the PNG.

**Do this instead:** `await document.fonts.ready` before calling `toPng()`. Additionally, use `getFontEmbedCSS(node)` to pre-embed the font in the capture rather than relying on the library's internal CSS fetch.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Gemini Flash via Firebase AI Logic | `firebase/ai` SDK, singleton model instance | API key never in client; Firebase proxy handles auth |
| Firebase Hosting | `firebase deploy` static SPA | Requires `firebase.json` with SPA rewrite to `index.html` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `useCompliment` → Firebase model | Import singleton from `firebase/ai.ts` | One init, reused across hook calls |
| `useCompliment` → `MainScreen` | Hook return values (phase, compliment, name, error, actions) | MainScreen is the only consumer |
| `MainScreen` → `ComplimentCard` | Props (name, compliment) | Card is a pure renderer, no state |
| `MainScreen` → `downloadCard` | Passes `cardRef.current` + `name` | DOM capture decoupled from component |
| `ComplimentCard` → `Icon` | Props (name, size, className) | Icon is a pure renderer |
| `AnimatedIconBackground` → `Icon` | Props (name, size, className, color via className) | Background imports same Icon component |
| DLS tokens → all components | CSS custom properties via Tailwind v4 classes | Tokens survive `html-to-image` capture |

---

## Build Order (Dependency-Aware)

Dependencies flow downward. Build from the bottom up.

```
Level 1 (no dependencies):
  firebase/ai.ts          — Firebase init, model export
  utils/downloadCard.ts   — html-to-image utility, no React deps

Level 2 (depends on Level 1 or existing components):
  ComplimentCard.tsx      — MODIFY: add forwardRef (depends on Icon, DLS)
  AnimatedIconBackground  — NEW: depends on Icon, DLS tokens
  hooks/useCompliment.ts  — NEW: depends on firebase/ai.ts

Level 3 (depends on Level 2):
  MainScreen.tsx          — REPLACE: depends on all Level 2 items

Level 4 (validation):
  KitchenSinkScreen.tsx   — ADD: AnimatedIconBackground preview panel
```

**Practical build sequence:**

1. Firebase project setup + `firebase/ai.ts` — verify Gemini responds before any UI work
2. `useCompliment` hook — test generation in isolation (console.log the response)
3. `forwardRef` on `ComplimentCard` + `downloadCard.ts` — test font capture before full UI
4. `AnimatedIconBackground` — purely visual, no blockers, build in parallel with step 3
5. `MainScreen.tsx` — wire everything together; test all phases
6. Add `AnimatedIconBackground` to `KitchenSinkScreen` for visual validation

---

## Sources

- [Firebase AI Logic official docs](https://firebase.google.com/docs/ai-logic) — HIGH confidence. Client SDK architecture for browser-side Gemini calls.
- [Firebase AI Logic get started](https://firebase.google.com/docs/ai-logic/get-started) — HIGH confidence. Setup steps, package install, initialization code.
- [Firebase AI Logic products page](https://firebase.google.com/products/firebase-ai-logic) — HIGH confidence. Security proxy pattern (API key never in client).
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) — HIGH confidence. toPng API, getFontEmbedCSS option, forwardRef pattern.
- [html-to-image issue #213: Load fonts from document.fonts](https://github.com/bubkoo/html-to-image/issues/213) — HIGH confidence. Font loading workaround, getFontEmbedCSS as solution.
- [html-to-image issue #412: embedFontCss with localhost](https://github.com/bubkoo/html-to-image/issues/412) — MEDIUM confidence. Confirms self-hosted font edge cases.
- Genkit overview (genkit.dev) — HIGH confidence. Confirms Node.js-only runtime; cannot run in browser.

---
*Architecture research for: EgoBoost 3000 — v2.0 milestone integration*
*Researched: 2026-03-14*

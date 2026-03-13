# Architecture Research

**Domain:** AI-powered compliment card generator (React + Firebase + Gemini Flash)
**Researched:** 2026-03-13
**Confidence:** HIGH (Firebase AI Logic official docs, multiple verified sources)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  DLS Layer  │  │  App Shell   │  │   Card Preview     │  │
│  │  (tokens,   │  │  (name input,│  │   (styled card     │  │
│  │   fonts,    │  │   generate   │  │    + download      │  │
│  │   theme)    │  │   button)    │  │    trigger)        │  │
│  └─────────────┘  └──────┬───────┘  └────────┬───────────┘  │
│                          │                   │              │
│              ┌───────────▼───────────────────▼──────────┐   │
│              │           React State Layer               │   │
│              │  (compliment text, loading, error state)  │   │
│              └───────────────────┬───────────────────────┘   │
│                                  │                           │
│              ┌───────────────────▼───────────────────────┐   │
│              │         Firebase AI Logic SDK              │   │
│              │   (proxy layer — API key never in client)  │   │
│              └───────────────────┬───────────────────────┘   │
└──────────────────────────────────┼───────────────────────────┘
                                   │ HTTPS (through Firebase proxy)
┌──────────────────────────────────▼───────────────────────────┐
│                    Firebase Infrastructure                     │
├────────────────────┬─────────────────────────────────────────┤
│  Firebase Hosting  │  Firebase AI Logic Proxy (API key mgmt)  │
│  (static React SPA)│  └──→ Gemini Flash API (Google Cloud)    │
└────────────────────┴─────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| DLS Layer | Design tokens, typography scale, color palette, spacing constants | CSS custom properties or JS theme object; loaded globally |
| App Shell | Name input form, generate trigger, loading/error state orchestration | Single React component with local useState |
| Firebase AI Logic SDK | Proxy calls to Gemini Flash; keeps API key server-side | `@firebase/ai` package initialized at app root |
| Card Preview | Renders styled compliment card for display AND image capture | A `div` with `ref`; styled to match downloadable output |
| Image Export | Captures Card Preview DOM node, converts to PNG, triggers download | `html-to-image` library + blob/anchor download |
| Kitchen Sink Screen | Isolated DLS validation — all tokens, fonts, colors in one view | Dev-only route; confirms visual consistency before feature build |

## Recommended Project Structure

```
src/
├── dls/                    # Design Language System — built first
│   ├── tokens.css          # CSS custom properties (colors, spacing, radii)
│   ├── typography.css      # Font imports, type scale definitions
│   ├── theme.ts            # JS-side token references for dynamic use
│   └── index.ts            # Re-exports for clean imports
│
├── components/             # Shared DLS primitive components
│   ├── Button/
│   ├── TextInput/
│   └── Card/               # Base card shell (not the compliment card)
│
├── features/
│   └── compliment/         # All compliment-generation logic lives here
│       ├── ComplimentForm.tsx      # Name input + generate button
│       ├── ComplimentCard.tsx      # The styled output card (ref-forwarded)
│       ├── useCompliment.ts        # Hook: calls Firebase AI Logic, manages state
│       └── downloadCard.ts        # html-to-image capture + download trigger
│
├── screens/
│   ├── MainScreen.tsx      # Composes ComplimentForm + ComplimentCard
│   └── KitchenSinkScreen.tsx  # DLS validation — dev only
│
├── firebase/
│   └── ai.ts               # Firebase app init + AI Logic SDK instance
│
├── App.tsx                 # Router (main + kitchensink routes)
└── main.tsx                # Entry point
```

### Structure Rationale

- **dls/:** Isolated first — everything else depends on it. CSS custom properties ensure tokens work inside `html-to-image` capture (unlike JS-in-CSS solutions that don't serialize).
- **features/compliment/:** Single feature, so one feature folder. `useCompliment` hook owns the AI call and state; components are dumb renderers.
- **firebase/ai.ts:** One initialization point. Firebase AI Logic SDK instance is a singleton created here and imported where needed.
- **screens/:** Thin composition layer — screens import features, features import components, components import DLS. One-way dependency flow.

## Architectural Patterns

### Pattern 1: Firebase AI Logic Client SDK (not Cloud Functions)

**What:** Call Gemini directly from the React client via Firebase AI Logic's proxy SDK. No custom Cloud Function required for this use case.

**When to use:** Simple request/response AI calls with no server-side business logic. The project generates one compliment per name — no orchestration needed.

**Trade-offs:** Simpler (no Cloud Function to write/deploy/maintain). Firebase handles API key security via their proxy. The downside is less control over prompt manipulation server-side, but for this project that is not needed.

**Example:**
```typescript
// firebase/ai.ts
import { initializeApp } from 'firebase/app';
import { getAI, getGenerativeModel } from 'firebase/ai';

const app = initializeApp(firebaseConfig);
const ai = getAI(app);
export const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' });

// features/compliment/useCompliment.ts
import { model } from '../../firebase/ai';

export function useCompliment() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate(name: string) {
    setLoading(true);
    const prompt = `Write an absurdly dramatic, over-the-top compliment for someone named ${name}...`;
    const result = await model.generateContent(prompt);
    setText(result.response.text());
    setLoading(false);
  }

  return { text, loading, generate };
}
```

### Pattern 2: Ref-Forwarded Card for DOM Capture

**What:** The visible compliment card component forwards a `ref` to its root DOM node. The download function receives that ref and passes it to `html-to-image`.

**When to use:** Any time you need pixel-accurate capture of a styled React component as a PNG. The card must look identical on screen and in the downloaded image.

**Trade-offs:** Works well with CSS custom properties (tokens serialize correctly). Fails with cross-origin images or certain CSS effects (box-shadow on some browsers). Keep card styles to standard CSS — no filters or blend modes that `html-to-image` can't replicate.

**Example:**
```typescript
// features/compliment/ComplimentCard.tsx
export const ComplimentCard = forwardRef<HTMLDivElement, Props>(
  ({ name, compliment }, ref) => (
    <div ref={ref} className="compliment-card">
      <p className="card-compliment">{compliment}</p>
      <p className="card-name">— for {name}</p>
    </div>
  )
);

// features/compliment/downloadCard.ts
import { toPng } from 'html-to-image';

export async function downloadCard(ref: RefObject<HTMLDivElement>, name: string) {
  if (!ref.current) return;
  const dataUrl = await toPng(ref.current, { pixelRatio: 2 }); // 2x for retina
  const link = document.createElement('a');
  link.download = `compliment-for-${name}.png`;
  link.href = dataUrl;
  link.click();
}
```

### Pattern 3: DLS-First with Kitchen Sink Screen

**What:** Build the full design token system and primitive components before any feature work. Validate it on a `/kitchen-sink` route that renders every token, font, and component variant.

**When to use:** Any project with a strong visual identity where consistency across components matters. Especially important when the card download must match the on-screen card.

**Trade-offs:** Adds 1 phase of front-loaded work but eliminates visual drift later. The kitchen sink screen also serves as a permanent visual regression reference — if it looks right there, it will look right everywhere.

## Data Flow

### Request Flow (Compliment Generation)

```
User types name → submits form
    ↓
ComplimentForm calls generate(name) from useCompliment hook
    ↓
useCompliment sets loading=true → calls model.generateContent(prompt)
    ↓
Firebase AI Logic SDK → Firebase Proxy → Gemini Flash API
    ↓
Response streams back → useCompliment sets text, loading=false
    ↓
ComplimentCard renders with new text
    ↓
User sees card → clicks Download
    ↓
downloadCard(ref, name) → html-to-image captures DOM node → PNG blob
    ↓
Anchor click triggers browser file download
```

### State Management

This app is intentionally stateless and has minimal state. No global store needed.

```
Local useState in useCompliment hook:
  - name: string         (controlled input)
  - compliment: string   (AI response)
  - loading: boolean     (spinner state)
  - error: string | null (error display)

No Firestore, no user sessions, no persistence.
```

### Key Data Flows

1. **Generation flow:** Name string → Gemini prompt → compliment text string. All client-side via Firebase AI Logic SDK. Synchronous from UI perspective (async behind hook).
2. **Download flow:** DOM ref → html-to-image → PNG data URL → anchor download. Entirely browser-side, no server involved.
3. **DLS flow:** CSS tokens defined in `dls/tokens.css` → consumed by component stylesheets → serialized into PNG by html-to-image at download time. CSS custom properties survive DOM capture correctly.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is sufficient — Firebase AI Logic proxy scales automatically |
| 1k-100k users | Add Firebase App Check to prevent API key abuse by bots; monitor Gemini API quota |
| 100k+ users | Rate limiting via Cloud Functions wrapper; Firestore for request logging; potentially move to Genkit for server-side orchestration |

### Scaling Priorities

1. **First bottleneck:** Gemini API quota. Firebase AI Logic uses Google AI backend by default; Vertex AI backend has higher quotas. Switch the AI backend if quota limits hit — same SDK, different initialization.
2. **Second bottleneck:** Bot abuse of the generation endpoint. Firebase App Check (reCAPTCHA) prevents unauthorized callers. Add this before any public launch.

## Anti-Patterns

### Anti-Pattern 1: Cloud Function Middleman for Simple AI Calls

**What people do:** Write a Cloud Function that receives the name, calls Gemini, returns the compliment.

**Why it's wrong:** Adds cold-start latency (200-2000ms per call), extra deployment complexity, and a billing surface — for no security benefit. Firebase AI Logic already proxies the API key without a custom function.

**Do this instead:** Use Firebase AI Logic SDK directly from the React client. Reserve Cloud Functions for cases where server-side logic is genuinely needed (rate limiting, auth-gated actions, multi-step pipelines).

### Anti-Pattern 2: Rendering the Card Differently for Download

**What people do:** Build the on-screen card in React JSX and a separate canvas-based version for download.

**Why it's wrong:** Two rendering paths immediately diverge. Fonts, spacing, and colors drift. Double the work to maintain.

**Do this instead:** One `ComplimentCard` component with a forwarded ref. `html-to-image` captures exactly what the user sees. The DLS tokens (CSS custom properties) serialize correctly into the captured image.

### Anti-Pattern 3: Embedding API Key in Client Code

**What people do:** Call Gemini directly via `fetch` with an API key in the JavaScript bundle.

**Why it's wrong:** The key is publicly visible in the browser. Anyone can extract it and run up your bill.

**Do this instead:** Firebase AI Logic SDK — the API key lives in Firebase's proxy layer, never in your client bundle.

### Anti-Pattern 4: Skipping the Kitchen Sink Phase

**What people do:** Build the feature first, style it later, "refactor to DLS after."

**Why it's wrong:** The card download output is the core deliverable. If the DLS isn't established first, the card will be styled ad-hoc and will look inconsistent in the downloaded image (where you can't fix it with browser dev tools).

**Do this instead:** Build and validate the DLS (tokens, fonts, primitives) on the kitchen sink screen before touching the compliment feature. The feature should assemble DLS pieces, not invent new styles.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Gemini Flash API | Firebase AI Logic client SDK (`@firebase/ai`) | Never direct REST calls — use the SDK for API key security |
| Firebase Hosting | Static SPA deployment via `firebase deploy` | Single-page app with `rewrites` to `index.html` in `firebase.json` |
| Google Fonts (or self-hosted) | CSS `@import` in `typography.css` | Self-host fonts for offline card capture reliability; Google Fonts CDN can fail inside `html-to-image` capture |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| DLS -> Components | CSS custom properties + import of theme.ts | Components never define raw color/spacing values |
| Components -> Features | Props only — components are stateless | No hook calls inside DLS primitives |
| Features -> Firebase | Import singleton from `firebase/ai.ts` | One initialization, imported where needed |
| Feature -> Download | Ref passed from feature to download utility function | Keeps DOM capture logic out of the component |
| Screens -> Features | Composition — screens import and arrange features | Screens own no logic, only layout |

## Build Order Implications

The dependencies between components dictate this build order:

1. **DLS layer first** — everything downstream depends on it. Tokens, fonts, primitive components. Validate on Kitchen Sink screen.
2. **Firebase initialization** — `firebase/ai.ts` setup; test that Gemini responds to a raw prompt before any UI.
3. **`useCompliment` hook** — AI logic isolated, testable without UI.
4. **`ComplimentCard` component** — pure rendering, no AI logic. Build with mock compliment text.
5. **`downloadCard` utility** — integrate `html-to-image`; confirm fonts and tokens capture correctly.
6. **`ComplimentForm` + `MainScreen`** — wire everything together.
7. **Firebase Hosting deployment** — deploy and smoke-test end-to-end.

## Sources

- [Firebase AI Logic official docs](https://firebase.google.com/docs/ai-logic) — HIGH confidence. Architecture for client-side Gemini calls.
- [Firebase AI Logic products page](https://firebase.google.com/products/firebase-ai-logic) — HIGH confidence. Security proxy pattern and App Check integration.
- [Firebase blog: Building AI-powered apps with Firebase AI Logic](https://firebase.blog/posts/2025/05/building-ai-apps/) — HIGH confidence. Architecture patterns, SDK guidance.
- [Streaming Cloud Functions with Genkit](https://firebase.blog/posts/2025/03/streaming-cloud-functions-genkit/) — MEDIUM confidence. Confirms when Cloud Functions ARE needed vs client SDK.
- [html-to-image vs html2canvas comparison](https://betterprogramming.pub/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf) — MEDIUM confidence. Recommends html-to-image for modern React, better CSS fidelity.
- [npm-compare: html2canvas vs html-to-image vs dom-to-image](https://npm-compare.com/dom-to-image,html-to-image,html2canvas) — MEDIUM confidence. Download/maintenance stats.
- [React folder structure 2025 — Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/) — HIGH confidence. Feature-based folder structure recommendation.
- [Building a Scalable DLS in React Native](https://medium.com/@shubhamdhage930/building-a-scalable-design-language-system-dls-in-react-native-using-nativewind-f93815d32999) — MEDIUM confidence. DLS token/primitive organization patterns.

---
*Architecture research for: EgoBoost 3000 — React + Firebase + Gemini Flash compliment card generator*
*Researched: 2026-03-13*

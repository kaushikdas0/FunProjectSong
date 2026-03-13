# Stack Research

**Domain:** AI-powered compliment card generator (React + Firebase web app)
**Researched:** 2026-03-13
**Confidence:** HIGH (core stack), MEDIUM (card image generation specifics)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | Constrained choice; React 19 adds concurrent features and improved hooks — no reason to pin to 18 |
| Vite | 8.0.0 | Build tool + dev server | Standard pairing with React in 2025; fast HMR, first-class static deploy support, official Firebase + Vite guides exist |
| TypeScript | 5.x (bundled via Vite) | Type safety | Prevents class of bugs in AI response handling; Vite scaffolds it by default with React template |
| Firebase JS SDK | 12.10.0 | Auth, Hosting, App Check, AI Logic gateway | The single `firebase` npm package includes all services including the AI Logic SDK (`firebase/ai`) |
| Firebase AI Logic (`firebase/ai`) | included in firebase@12 | Gemini Flash access via Firebase proxy | Keeps the Gemini API key server-side through Firebase's proxy; enables App Check protection; avoids exposing credentials in client bundle |
| Tailwind CSS | 4.2.1 | Styling | v4 setup is a single `@import "tailwindcss"` line — zero config file needed; Vite plugin replaces PostCSS setup; strong fit for utility-based card layout |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| html-to-image | 1.11.13 | Render DOM node to PNG for download | The card download feature — converts the styled React card component to a PNG blob and triggers browser download |
| lucide-react | 0.577.0 | Icon set | Provides the "slightly retro techy" icon feel without a heavy icon font; tree-shakeable, React-first |
| react-hook-form | 7.71.2 | Form state for name input | Overkill for a single input, but handles validation (empty name, whitespace) without re-render thrash; use if validation UX matters |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Firebase CLI | Local emulation, deploy to Firebase Hosting | `npm install -g firebase-tools`; use `firebase emulators:start` to test AI Logic calls locally without hitting production |
| Vite preview | Local production build preview | `vite preview` before deploying; catches CSS purge issues with the card component |
| Firebase App Check (reCAPTCHA v3) | Protect the Gemini API key from abuse | Not required for dev; required before any public URL goes live — prevents API key theft via client-side bundle inspection |

## Installation

```bash
# Scaffold
npm create vite@latest egoboost-3000 -- --template react-ts
cd egoboost-3000

# Core
npm install firebase

# Tailwind v4 (Vite plugin — no tailwind.config.js needed)
npm install tailwindcss @tailwindcss/vite

# Supporting
npm install html-to-image lucide-react

# Optional: form validation
npm install react-hook-form

# Dev tools
npm install -D firebase-tools
```

**Tailwind v4 vite.config.ts change:**
```ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [react(), tailwindcss()] }
```

**Tailwind v4 CSS entry (src/index.css):**
```css
@import "tailwindcss";
```

**Firebase AI Logic initialization:**
```ts
import { initializeApp } from 'firebase/app'
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai'

const app = initializeApp(firebaseConfig)
const ai = getAI(app, { backend: new GoogleAIBackend() })
const model = getGenerativeModel(ai, { model: 'gemini-2.0-flash' })
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Firebase AI Logic (`firebase/ai`) | `@google/generative-ai` direct SDK | Only if you drop Firebase entirely — direct SDK exposes the API key in the client bundle unless you add your own proxy/backend |
| Firebase AI Logic | Genkit + Cloud Functions | Use Genkit if you need server-side orchestration, RAG, or multi-step agentic flows — overkill for a single-prompt generator |
| `html-to-image` | `html2canvas` | Use html2canvas when you need pixel-perfect fidelity for complex layouts with heavy CSS (e.g., gradients, filters); for a simple styled card, html-to-image is faster and has better font handling |
| Firebase Hosting (static) | Firebase App Hosting | App Hosting is for SSR/dynamic backends and requires a billing account to start; a Vite-built SPA deploys perfectly to static Hosting on the free tier |
| Tailwind CSS v4 | CSS Modules or styled-components | Use styled-components if the team strongly prefers CSS-in-JS and dynamic theming via props; Tailwind wins for cozy card layouts because utility classes map directly to the DLS tokens |
| React 19 | Next.js 15 | Use Next.js if you need SSR, SEO landing pages, or API routes; this app is fully client-side and a SPA is simpler |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@google/generative-ai` (direct, client-side) | Embeds the Gemini API key in the browser bundle — any user can extract it and drain your quota | `firebase/ai` via Firebase AI Logic proxy, which keeps the key server-side |
| Genkit (for this project) | Adds significant server-side complexity (Cloud Functions, deployment pipeline) for a use case that needs one prompt call | `firebase/ai` client SDK directly |
| html2canvas | Has known issues with custom font rendering — handwritten fonts like Caveat will often render incorrectly, which breaks the card aesthetic | `html-to-image` which handles embedded fonts more reliably via SVG foreignObject |
| Redux / Zustand | State management overhead for an app with a single piece of mutable state (the generated compliment string) | React `useState` + `useReducer` — all state lives in one parent component |
| Firebase App Hosting | Requires billing account, designed for SSR; adds cost and complexity with no benefit for a static SPA | Firebase Hosting (classic), which has a generous free tier and deploys Vite builds in one command |
| Tailwind CSS v3 | v4 is the current release with a fundamentally different (simpler) setup — starting a new project on v3 means a migration cost later | Tailwind CSS v4 via `@tailwindcss/vite` |

## Stack Patterns by Variant

**For card image generation with custom fonts:**
- Load the font via a `<link>` in `index.html` (Google Fonts), not only via Tailwind `@font-face`
- `html-to-image` needs the font loaded on the document to capture it in the SVG foreignObject
- Add `cacheBust: true` to `toPng()` options to avoid stale renders on regenerate

**For Firebase AI Logic + App Check in production:**
- Register reCAPTCHA v3 site key in Firebase Console
- Initialize App Check before calling `getAI()`
- In dev, use `firebase.appCheck().setTokenAutoRefreshEnabled(false)` + debug token to bypass

**For Google Fonts handwritten typography:**
- Caveat (Google Fonts) — best for card body text, retains readability at small sizes while feeling handwritten
- Pacifico (Google Fonts) — best for display/headline use on the card, the 1950s surf script feel pairs well with "dramatic compliment" tone
- Load both via Google Fonts `<link>` in `index.html`; reference in Tailwind v4 via CSS custom properties

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| firebase@12.10.0 | React 19 | No known conflicts; Firebase JS SDK is framework-agnostic |
| tailwindcss@4.2.1 | Vite@8 | Requires `@tailwindcss/vite` plugin — do NOT use PostCSS-only config |
| html-to-image@1.11.13 | React 19 | Uses DOM refs directly; works with any React version |
| react-hook-form@7.71.2 | React 19 | v7 officially supports React 18+; React 19 compatible per community reports |
| lucide-react@0.577.0 | React 19 | Ships as ESM; tree-shakeable; no peer dep conflicts |

## Sources

- Firebase official docs (firebase.google.com/docs/ai-logic/get-started) — verified `firebase/ai` import path, `getAI()` + `getGenerativeModel()` API, App Check integration
- npm registry (cli) — verified firebase@12.10.0, react@19.2.4, vite@8.0.0, tailwindcss@4.2.1, html-to-image@1.11.13, lucide-react@0.577.0, react-hook-form@7.71.2 (HIGH confidence)
- Tailwind CSS official blog (tailwindcss.com/blog/tailwindcss-v4) — verified v4 Vite plugin setup, zero-config approach (HIGH confidence)
- Better Programming / npm-compare.com — html-to-image vs html2canvas comparison, font rendering advantage (MEDIUM confidence — community sources, but consistent)
- Firebase blog (firebase.blog/posts/2025/05/building-ai-apps) — Firebase AI Logic vs Genkit use case boundary (MEDIUM confidence)
- Firebase Hosting docs — static SPA vs App Hosting recommendation (HIGH confidence — direct from official comparison page)

---
*Stack research for: EgoBoost 3000 — React + Firebase AI-powered compliment card generator*
*Researched: 2026-03-13*

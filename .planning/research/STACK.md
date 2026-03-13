# Stack Research

**Domain:** AI-powered compliment card generator (React + Firebase web app)
**Researched:** 2026-03-14 (updated for v2.0 milestone)
**Confidence:** HIGH (Genkit + html-to-image), HIGH (CSS animations)

---

## What This File Covers (v2.0 additions only)

The existing stack (Vite 8, React 19, TypeScript, Tailwind v4, Caveat font, pixelarticons) is
validated and does not need re-research. This file documents only what is being ADDED or CHANGED
for the v2.0 milestone.

---

## New Dependencies

### Core — AI Generation via Genkit

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `genkit` | 1.30.1 | Genkit runtime core | Required peer for all Genkit plugins; provides `ai.generate()`, `ai.defineFlow()`, schema validation via Zod |
| `@genkit-ai/google-genai` | 1.30.1 | Gemini Flash access | Official Google AI plugin for Genkit; replaces deprecated `@genkit-ai/googleai`; provides `googleAI()` plugin and `googleAI.model()` selector |
| `@genkit-ai/express` | 1.30.1 | HTTP flow server | Wraps flows as Express endpoints via `startFlowServer()`; default port 3400; the "no Cloud Functions" approach — runs as a local Node.js process |

**Architecture note:** Genkit cannot run in the browser. "No Cloud Functions" means running a
lightweight Express server (`startFlowServer`) as a local process alongside Vite. In dev, Vite
proxies `/api/*` requests to `localhost:3400`. In production, this same Node.js server deploys
anywhere that runs Node 20+ (Cloud Run, Firebase App Hosting, a plain VPS) — no Cloud Functions
configuration required.

### Supporting — Card Download

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `html-to-image` | 1.11.13 | Render DOM node to PNG blob | The card download feature — `toPng(ref.current)` captures the styled ComplimentCard as a downloadable PNG |

**Already in existing STACK.md as a recommendation — confirm it is installed.**

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `tsx` | 4.21.0 | Run TypeScript directly (no compile step) | Used to start the Genkit server in dev: `tsx --watch src/server/index.ts` |
| `concurrently` | 9.2.1 | Run Vite + Genkit server in parallel | One `npm run dev` starts both processes; no separate terminal needed |
| `genkit-cli` | 1.30.1 | Genkit developer UI + flow inspector | Optional; `genkit start` opens flow inspector at localhost:4000 for testing prompts without the UI |

---

## Installation

```bash
# Genkit AI server
npm install genkit @genkit-ai/google-genai @genkit-ai/express

# Card download (may already be installed — check package.json)
npm install html-to-image

# Dev tooling
npm install -D tsx concurrently

# Optional: Genkit CLI (global)
npm install -g genkit-cli
```

---

## Integration Patterns with Existing Stack

### Pattern 1: Genkit server alongside Vite dev server

**File structure:**
```
src/
  server/
    index.ts        ← Genkit server (startFlowServer)
    flows/
      compliment.ts ← defineFlow for compliment generation
  client/
    App.tsx         ← existing React app
```

**`src/server/index.ts`:**
```typescript
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { startFlowServer } from '@genkit-ai/express';

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.0-flash'),
});

export const complimentFlow = ai.defineFlow(
  {
    name: 'complimentFlow',
    inputSchema: z.object({ name: z.string() }),
    outputSchema: z.object({ compliment: z.string() }),
  },
  async ({ name }) => {
    const { text } = await ai.generate(
      `Write a single ridiculously dramatic, over-the-top compliment for ${name}. Make it absurdly theatrical. One paragraph.`
    );
    return { compliment: text };
  }
);

startFlowServer({ flows: [complimentFlow], port: 3400 });
```

**`vite.config.ts` — proxy to Genkit server:**
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3400',
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

**`package.json` dev script:**
```json
"dev": "concurrently \"vite\" \"tsx --watch src/server/index.ts\""
```

**React client call (using `genkit/beta/client`):**
```typescript
import { runFlow } from 'genkit/beta/client';

const result = await runFlow({
  url: '/api/complimentFlow',
  input: { name },
});
// result.compliment — the generated text
```

**Env var required:**
```bash
# .env.local (never commit)
GEMINI_API_KEY=your_key_here
```

### Pattern 2: html-to-image card download with self-hosted font

Self-hosted Caveat font (already installed via `@fontsource/caveat`) avoids Google Fonts CORS
canvas-tainting. The key is waiting for fonts to be ready before capture.

```typescript
import { toPng } from 'html-to-image';

async function downloadCard(cardRef: React.RefObject<HTMLDivElement>) {
  // Wait for fonts to be fully loaded before capture
  await document.fonts.ready;

  const dataUrl = await toPng(cardRef.current!, {
    cacheBust: true,               // prevents stale renders on regenerate
    preferredFontFormat: 'woff2',  // embed only woff2, discard other formats
    pixelRatio: 2,                 // 2x resolution for sharp cards on retina
  });

  const link = document.createElement('a');
  link.download = 'my-compliment.png';
  link.href = dataUrl;
  link.click();
}
```

**Known issue:** html-to-image's font auto-embedding from localhost can fail (open GitHub issue
#412). The workaround is `document.fonts.ready` + `preferredFontFormat: 'woff2'`, which causes
the library to re-embed from the already-loaded font rather than re-fetching. If fonts still fail
to render in the export, the fallback is to read the woff2 file as base64 and inject it as a
`fontEmbedCSS` option — but try the simple path first.

### Pattern 3: CSS animations for background icon pulse (no new library needed)

Tailwind v4's `@theme` block supports custom keyframes and `--animate-*` tokens. No animation
library is needed — extend the existing CSS theme file.

**Add to existing `src/index.css` (inside `@theme` block):**
```css
@theme {
  /* existing tokens... */

  --animate-icon-pulse: icon-pulse 3s ease-in-out infinite;

  @keyframes icon-pulse {
    0%, 100% {
      opacity: 0.15;
      transform: scale(1);
    }
    50% {
      opacity: 0.35;
      transform: scale(1.08);
    }
  }
}
```

**Usage in JSX:**
```tsx
<span className="animate-icon-pulse" style={{ animationDelay: '0.4s' }}>
  <Icon name="star" size={32} />
</span>
```

**Performance:** `opacity` + `transform` are the two GPU-composited properties — they do not
trigger layout or paint. This is safe for 10-15 background icons simultaneously on mobile.

Each icon gets a different `animationDelay` to stagger the pulse and avoid lockstep animation.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Genkit + `startFlowServer` | Firebase AI Logic `firebase/ai` client SDK | If you want zero backend process and are willing to expose the API key in the client bundle (prototyping only) |
| Genkit + `startFlowServer` | Cloud Functions for Firebase | Same Genkit code, different deployment target — use Cloud Functions when you need auto-scaling and pay-per-call billing in production |
| Genkit + `startFlowServer` | Direct `@google/genai` SDK on server | Works, but loses Genkit's flow observability, schema validation, and dev UI; use if Genkit feels like over-engineering |
| `html-to-image` | `html2canvas` | Use html2canvas if the card has complex CSS filters or SVG elements that html-to-image fails to capture correctly |
| Tailwind custom `@keyframes` | Framer Motion | Use Framer Motion if you need gesture-driven or physics-based animations, or complex sequence choreography; overkill for a simple opacity+scale pulse |
| `concurrently` | `npm-run-all` | Either works — `concurrently` shows color-coded output per process which is easier to read when debugging server vs client logs |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@google/generative-ai` (client-side) | Exposes the Gemini API key in the browser bundle | Genkit server with `startFlowServer` — key stays server-side |
| Firebase AI Logic `firebase/ai` | Contradicts the project decision to use Genkit; the team specifically chose Genkit for this milestone | Genkit with `@genkit-ai/google-genai` |
| `framer-motion` | 43 kB gzip for animations that are achievable with 6 lines of CSS keyframes | Tailwind `@theme` custom `@keyframes` |
| `react-spring` | Same problem as Framer Motion — animation library overhead for what is a static, non-interactive background decoration | CSS `@keyframes` via Tailwind |
| `dom-to-image` | Unmaintained since 2019; html-to-image is the maintained fork | `html-to-image` |
| `canvas-confetti` or other celebration libs | Out of scope for v2.0; the card IS the celebration | Not needed |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `genkit@1.30.1` | Node.js 20+ | Requires Node 20 minimum; check `.nvmrc` or `engines` field |
| `genkit@1.30.1` | React 19 (client-only) | Client calls use `genkit/beta/client` which is browser-safe; never import main `genkit` package in React components |
| `@genkit-ai/express@1.30.1` | `genkit@1.30.1` | Must match — all `@genkit-ai/*` packages version-lock to `genkit` core |
| `@genkit-ai/google-genai@1.30.1` | `genkit@1.30.1` | Must match — same version-lock rule |
| `html-to-image@1.11.13` | React 19 | Uses DOM refs; React version agnostic |
| `tsx@4.21.0` | TypeScript 5.9 | Transpiles TS in-process; no tsconfig changes needed for the server file |
| `concurrently@9.2.1` | any npm | Dev-only; no runtime conflicts |

---

## Environment Variables

```bash
# .env.local — required for Genkit server
GEMINI_API_KEY=your_gemini_api_key_here

# PORT is optional — Genkit defaults to 3400
# PORT=3400
```

The `GEMINI_API_KEY` is read by `@genkit-ai/google-genai` automatically from the environment.
It stays on the server — never in the React bundle.

---

## Sources

- npm registry (cli) — `genkit@1.30.1`, `@genkit-ai/google-genai@1.30.1`, `@genkit-ai/express@1.30.1`, `html-to-image@1.11.13`, `tsx@4.21.0`, `concurrently@9.2.1` — HIGH confidence (verified via `npm show`)
- genkit.dev/docs/js/get-started/ — Genkit minimal setup, package requirements, flow definition pattern — HIGH confidence (official docs)
- genkit.dev/docs/deployment/any-platform/ — `startFlowServer` API, default port 3400, CORS options — HIGH confidence (official docs)
- genkit.dev/docs/integrations/google-genai/ — `googleAI()` plugin setup, `gemini-2.0-flash` model selector — HIGH confidence (official docs)
- tailwindcss.com/docs/animation — Tailwind v4 `@theme` custom `@keyframes` and `--animate-*` variable syntax — HIGH confidence (official docs)
- github.com/bubkoo/html-to-image/issues/213 — `document.fonts.ready` + font embedding status — MEDIUM confidence (open issue, workaround community-verified)
- github.com/bubkoo/html-to-image/issues/412 — localhost font embedding failure and `preferredFontFormat` workaround — MEDIUM confidence (open issue, confirmed working by multiple reporters)
- genkit.dev deploy docs + WebSearch cross-reference — "no Cloud Functions" architecture interpretation (startFlowServer as local Node process) — HIGH confidence

---
*Stack research for: EgoBoost 3000 — v2.0 new capability additions*
*Researched: 2026-03-14*

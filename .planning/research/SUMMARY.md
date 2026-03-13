# Project Research Summary

**Project:** EgoBoost 3000
**Domain:** AI-powered compliment card generator (React + Firebase + Gemini Flash web app)
**Researched:** 2026-03-14 (v2.0 milestone update)
**Confidence:** HIGH

## Executive Summary

EgoBoost 3000 v2.0 is a stateless, browser-based app that takes a name, generates a single absurdly dramatic compliment via Gemini Flash, and delivers the result as a styled downloadable card. The existing v1.0 foundation (Vite 8, React 19, TypeScript, Tailwind v4, Caveat font, pixelarticons, ComplimentCard component, DLS) is solid and validated. The v2.0 work is additive: wire AI generation, card download, typewriter animation, and an animated background — all without adding significant new dependencies or new routes. Only 4 new files and 2 modified files are required across the entire codebase.

The recommended architecture uses the Firebase AI Logic client SDK (`firebase/ai`) to call Gemini Flash directly from the browser through a Firebase-managed proxy. This eliminates the need for any custom backend server or Cloud Functions. The Gemini API key never enters the browser bundle; Firebase infrastructure holds it. This is the cleanest path to working AI generation: no CORS configuration, no local Node.js process to run alongside Vite, no deployment complexity. Phase state transitions (`idle → generating → result → error`) live in a `useCompliment` hook as a local state machine — not URL routes — because intermediate states are not navigable and should not be deep-linkable.

The biggest risks are concentrated in two areas. First, the card download pipeline: font rendering failures in exported PNGs are silent and invisible in development but broken in production, and Retina displays will receive blurry cards if pixel ratio is not explicitly set. Second, AI integration foundations: hardcoding the model name causes a production outage on June 1, 2026 (11 weeks away), and prompt injection via the name field is the top-ranked LLM vulnerability. Both categories are straightforward to prevent when addressed at the start of implementation — all critical pitfalls map to Phase 1 or Phase 2.

---

## Key Findings

### Recommended Stack

The existing stack requires no changes. Five targeted additions are needed for v2.0:

**New dependencies:**
- `firebase` (firebase/ai SDK) — client-side Gemini access via Firebase proxy; no custom server required; API key never in browser bundle
- `html-to-image@1.11.13` — DOM-to-PNG capture for card download; maintained fork of html2canvas with better font/CSS support
- Firebase Remote Config — remote model name management; prevents production outage when Google deprecates a model
- Tailwind v4 `@theme` custom `@keyframes` — background icon animation using GPU-composited properties; zero new library overhead

**Important architecture note — Genkit vs Firebase AI Logic:** The STACK.md researcher documented Genkit with a local Express server as the AI approach. The ARCHITECTURE.md researcher independently reached a different conclusion after reading official Firebase docs: use Firebase AI Logic (`firebase/ai`) instead. The ARCHITECTURE.md conclusion is correct and takes precedence. Firebase AI Logic is a browser-safe SDK; Genkit requires a Node.js backend process that contradicts the project's "no Cloud Functions" constraint. The `tsx` and `concurrently` devDependencies documented in STACK.md are not needed.

### Expected Features

**Must have — v2.0 launch (P1):**
- AI generation via Firebase AI Logic + Gemini Flash — the entire product depends on this
- Streaming typewriter display — reduces perceived latency; signals generation progress; comes free when using `generateContentStream` without a separate animation library
- Error states with friendly messages — especially 429 quota errors (tightened December 2025); never show raw API errors
- Regenerate button — single-shot generation is too limiting; users need to explore results
- Download card as PNG — the core product differentiator; no competitor offers a designed downloadable card
- Mobile-responsive single-column layout — fun/casual web traffic skews heavily mobile

**Should have — v2.0 if time allows (P2):**
- Animated background icons (pixelarticons with CSS float/pulse) — reinforces app personality; CSS-only, no new library, low effort

**Defer to v2.x:**
- Copy compliment text to clipboard — dilutes card-first identity; add only if analytics demand it
- Subtle card entrance animation on result reveal — low effort, high delight
- `prefers-reduced-motion` support for background animations — accessibility improvement, two-line addition

**Defer to v3+:**
- Multiple compliment styles/voices — single dramatic voice IS the brand identity; picker adds friction before the payoff
- User history/saved compliments — requires auth and storage, massively expands scope; stateless design is a feature
- Shareable card URLs — requires storage and URL-based rendering infrastructure

**Confirmed anti-features (do not build):**
- Style/vibe picker — adds decision friction before the payoff
- Social sharing buttons — platform API churn; downloaded image is universally shareable already
- User accounts — stateless design is intentional

### Architecture Approach

The app uses a flat, single-screen architecture. `MainScreen` owns a `phase` state machine (`idle → generating → result → error`) — not React Router routes. The URL stays `/` throughout; intermediate states are not navigable or deep-linkable. A `useCompliment` custom hook encapsulates all AI logic and phase transitions. `ComplimentCard` remains a pure renderer with one modification: `forwardRef` added so `html-to-image` can capture its root div. `AnimatedIconBackground` is a new fixed-position component using the existing `Icon` primitive, positioned behind the card with `pointer-events: none` and excluded from card capture.

**Major components:**
1. `firebase/ai.ts` — Firebase app init and singleton model instance; one initialization point for the entire app
2. `useCompliment` hook — phase state machine, Firebase AI Logic call, streaming iteration, error handling
3. `MainScreen` (replaced) — composes all UI; the only stateful screen component; unchanged routing
4. `ComplimentCard` (modified) — pure renderer with `forwardRef` for PNG capture; same props, minimal change
5. `utils/downloadCard.ts` — isolated `html-to-image` capture logic with full font safety pipeline
6. `AnimatedIconBackground` (new) — CSS-animated decorative layer using existing Icon component

**New files:** `firebase/ai.ts`, `hooks/useCompliment.ts`, `utils/downloadCard.ts`, `components/AnimatedIconBackground/AnimatedIconBackground.tsx`
**Modified files:** `ComplimentCard.tsx` (add forwardRef), `MainScreen.tsx` (replace placeholder)
**Unchanged:** `App.tsx`, `main.tsx`, DLS, Icon component, all existing routes

### Critical Pitfalls

1. **Hardcoded Gemini model name causes production outage** — `gemini-2.0-flash` retires June 1, 2026 (11 weeks from today). Store the model name in Firebase Remote Config with a real-time listener from day one. Never use a string literal in source code. Recovery requires a code change + deploy cycle while the app is broken.

2. **Canvas silently falls back to system font on card download** — html-to-image captures a DOM clone; if the custom font has not finished loading, the canvas renders system sans-serif with no error. Fix: always `await document.fonts.ready` before calling `toPng()`, and pass `getFontEmbedCSS(node)` result to `toPng()` options to pre-embed the font. Invisible in development; broken on production.

3. **API key exposed in browser bundle** — if `VITE_GEMINI_API_KEY` is used in a `.env` file, the key lands in the compiled bundle. Firebase AI Logic solves this architecturally: the Firebase project config (safe in client) is not the Gemini API key (never in client). February 2026 security research found ~3,000 previously "harmless" keys now expose Gemini endpoints.

4. **Blurry card on Retina/HiDPI displays** — `html-to-image` defaults to 1x pixel ratio. Pass `pixelRatio: Math.max(window.devicePixelRatio, 2)` to `toPng()`. One-line fix; discovering it post-launch means re-testing all download flows and re-deploying.

5. **Animation jank on mobile** — animating `box-shadow`, `border-width`, or `background-color` in `@keyframes` triggers paint on every frame. Animate only `transform` and `opacity` (GPU-composited, no layout/paint). Wrap all background animations in `@media (prefers-reduced-motion: no-preference)`. Test on a real mid-range Android device, not Chrome DevTools emulation.

6. **Prompt injection via name field** — raw user input interpolated directly into a prompt string is OWASP LLM01:2025, present in 73% of audited production AI deployments. Wrap user input in XML delimiters (`<user_name>Alex</user_name>`); add a system instruction treating the content as a name only; validate to alphanumeric + limited punctuation, 50-char max.

---

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md, features must be built bottom-up. Firebase AI Logic setup is a hard prerequisite for everything else. Card download and typewriter animation can be developed in parallel once the card renders with real AI data. Background animation is fully independent of AI logic.

### Phase 1: AI Foundation

**Rationale:** Nothing else works without a functioning Gemini integration. All architecture decisions made in this phase are load-bearing and difficult to retrofit: which SDK to use, where the API key lives, how the prompt is structured, how errors are handled. Four of the six critical pitfalls (model deprecation, API key exposure, prompt injection, 429 handling) must be addressed here before any UI work begins.

**Delivers:** Working Firebase project setup, Remote Config wired for model name, `useCompliment` hook returning real Gemini completions with streaming, full phase state machine (`idle → generating → result → error`), input validation, prompt injection protection, friendly 429 and network error messages, generate button debounce.

**Addresses features:** AI generation (P1), streaming output pipeline (P1), error states with specific messages (P1), regenerate button (P1)

**Avoids pitfalls:** Hardcoded model name (Remote Config from day one), API key exposure (Firebase AI Logic architecture — no `VITE_` prefix), prompt injection (XML-delimited prompt structure from first implementation), 429 errors (explicit catch with friendly message), CORS issues (Firebase AI Logic proxy eliminates cross-origin entirely)

**Research flag:** Standard patterns — Firebase AI Logic has official get-started docs (HIGH confidence). Remote Config integration is documented with code samples. No research phase needed.

### Phase 2: Card Generation and Download

**Rationale:** Card download is the core product differentiator — no competitor offers it. It depends on ComplimentCard rendering with real AI content, so Phase 1 must complete first. The font pipeline is the most technically fragile element in the entire app and must be treated as a success criterion for this phase, not a polish item. Font correctness must be verified on a deployed staging URL, not just localhost (CORS behavior differs).

**Delivers:** Fully functional card experience — streaming typewriter display on ComplimentCard, download as 2x Retina-quality PNG with correct Caveat font, `forwardRef` on ComplimentCard, `downloadCard` utility with full font safety pipeline, typewriter accessibility (aria-hidden + sr-only).

**Addresses features:** Typewriter display (P1), download card as PNG (P1)

**Implements:** `forwardRef` on ComplimentCard, `utils/downloadCard.ts`, `TypewriterText` display wrapper

**Avoids pitfalls:** Font fallback on export (`document.fonts.ready` + `getFontEmbedCSS`), blurry Retina card (`pixelRatio: 2`), canvas CORS taint (staging deployment test as phase exit criterion), typewriter accessibility (aria-hidden + sr-only pattern — two lines, no logic change)

**Research flag:** The font pipeline has well-documented workarounds confirmed in multiple GitHub issue threads. Standard patterns — follow FEATURES.md and ARCHITECTURE.md exactly. No research phase needed, but the "Looks Done But Isn't" checklist from PITFALLS.md should be used verbatim as the phase exit checklist.

### Phase 3: Animated Background and Mobile Layout

**Rationale:** `AnimatedIconBackground` has zero dependencies on AI logic or card download — it only requires the existing `Icon` component and DLS tokens (both v1.0 complete). This makes it the most self-contained work in v2.0. Mobile layout correctness with real device keyboard testing also belongs here, since the background's positioning behavior is the most likely source of mobile layout bugs.

**Delivers:** Polished visual experience — floating pixelarticons with CSS pulse animation, responsive single-column layout verified on real mobile devices, `prefers-reduced-motion` support, `pointer-events: none` on background layer.

**Addresses features:** Animated background icons (P2), mobile-responsive layout (P1)

**Avoids pitfalls:** Animation jank (`transform`/`opacity` only, staggered `animation-delay`, `will-change` sparingly), mobile fixed position + keyboard (`position: absolute` in `100dvh` container, test on real iPhone), missing `prefers-reduced-motion` media query (wrap all background animations)

**Research flag:** Standard patterns. CSS `@keyframes` with Tailwind v4 `@theme` is well-documented. No research phase needed. Requires real device testing (not DevTools emulation) as a phase exit criterion.

### Phase Ordering Rationale

- **AI integration is the hard dependency:** The typewriter display, download button, and regenerate button all require a real compliment from the AI. Phases 2 and 3 cannot start until Phase 1 delivers working generation.
- **Card and download belong together in Phase 2:** They share the same `forwardRef` DOM node. Building them in separate phases creates two rendering paths and risks visual drift between the screen card and the exported card.
- **Background is genuinely decoupled:** `AnimatedIconBackground` could theoretically be built first, but it is lower priority (P2) and its mobile positioning behavior is best validated after the core flow is working on a real device.
- **Font pipeline spans Phases 1-2:** Self-hosted Caveat font is already in place (v1.0). Phase 1 ensures Firebase is configured. Phase 2 validates font embedding in the PNG — this requires real AI content on the card to test correctly.
- **Security before UI:** Remote Config, prompt injection guards, and 429 handling go into Phase 1. The UI layers in Phase 2 sit on top of a secured foundation.

### Research Flags

Phases likely needing deeper research during planning:
- None identified — all three phases have well-documented patterns with HIGH confidence sources from official documentation.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Firebase AI Logic official docs are comprehensive with working code samples. Remote Config for model name is documented with a real-time listener pattern. 429 error handling is standard async/await error branching.
- **Phase 2:** html-to-image font pipeline is thoroughly documented via confirmed workarounds in the project's GitHub issues. Typewriter accessibility is a two-line addition with definitive WCAG guidance.
- **Phase 3:** CSS `@keyframes` + Tailwind v4 `@theme` follows official documentation. Animation performance guidance from MDN is definitive.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified via npm; Firebase AI Logic from official firebase.google.com docs; animation approach from official Tailwind v4 docs; html-to-image confirmed via maintainer repo |
| Features | HIGH | Core feature set and dependency graph are well-reasoned from official docs and confirmed UX patterns; competitor analysis is surface-level but consistent across multiple observations |
| Architecture | HIGH | Firebase AI Logic architecture confirmed against official docs (not inferred); build order derived directly from explicit dependency graph; file structure is additive on validated v1.0 foundation |
| Pitfalls | HIGH | All critical pitfalls sourced from official docs (deprecation schedule, quota changes December 2025), confirmed security research (Truffle Security February 2026), and long-standing tracked library issues with confirmed workarounds |

**Overall confidence:** HIGH

### Gaps to Address

- **Firebase AI Logic streaming API surface:** FEATURES.md flags MEDIUM confidence on streaming with Firebase AI Logic specifically (`generateContentStream` vs Genkit's `streamFlow`). The general approach is confirmed; the exact API surface should be verified against Firebase AI Logic docs during Phase 1 implementation before the typewriter display in Phase 2 is built on top of it.

- **Self-hosted font on localhost in html-to-image (GitHub issue #412):** There are reports of self-hosted fonts served from localhost not embedding correctly in html-to-image even with the `getFontEmbedCSS` workaround. This may not affect production (where fonts are served from the same origin with correct headers). Verify card download on a deployed staging URL early in Phase 2 — do not rely on localhost testing alone. If staging fails, the fallback is reading the woff2 file as base64 and injecting via `fontEmbedCSS` option directly.

- **Firebase project prerequisite:** The entire Phase 1 assumes a Firebase project exists with AI Logic enabled in the Firebase console. If this is not yet configured, it is the first prerequisite step before any code is written.

---

## Sources

### Primary (HIGH confidence)
- Firebase AI Logic official docs (firebase.google.com/docs/ai-logic) — client SDK architecture, security proxy, API key handling, supported models and deprecation schedule
- Firebase AI Logic get started (firebase.google.com/docs/ai-logic/get-started) — setup steps, initialization pattern, `getGenerativeModel` API
- Firebase Remote Config for model name (firebase.google.com/docs/ai-logic/change-model-name-remotely) — real-time listener pattern
- Firebase AI Logic quotas (firebase.google.com/docs/ai-logic/quotas) — 429 behavior, December 2025 quota changes
- Genkit overview (genkit.dev) — confirms Node.js-only runtime; cannot run in browser; "do not use non-type imports from genkit in browser apps"
- Tailwind CSS animation docs (tailwindcss.com/docs/animation) — `@theme` custom `@keyframes` + `--animate-*` token syntax
- html-to-image issue #213 (github.com/bubkoo/html-to-image/issues/213) — `document.fonts.ready` + `getFontEmbedCSS` workaround, confirmed by multiple reporters
- OWASP LLM01:2025 (genai.owasp.org) — prompt injection risk classification, XML delimiter mitigation
- CSS Font Loading API (MDN) — `document.fonts.ready` usage
- WCAG 2.1 SC 2.3.3 — animation from interactions, `prefers-reduced-motion` requirement
- npm registry — all package versions verified via `npm show`

### Secondary (MEDIUM confidence)
- html-to-image issue #412 (github.com/bubkoo/html-to-image/issues/412) — localhost font embedding bug; may not affect production; confirmed by multiple reporters
- Genkit startFlowServer CORS bug issue #3434 — documented CORS issue with Genkit's own CORS option; moot if using Firebase AI Logic
- Truffle Security research (February 2026) — ~3,000 public Google API keys now expose Gemini endpoints
- LogRocket typewriter animation patterns — confirms streaming-native approach is cleanest React implementation
- Web Animation Performance Tier List (Motion.dev) — GPU-composited vs paint-triggering property classification
- On fixed elements and backgrounds (Chen Hui Jing) — iOS Safari `position: fixed` behavior with virtual keyboard
- Accessible typewriter animations (cyishere.dev) — `aria-hidden` + `sr-only` pattern confirmed
- Josh W. Comeau `prefers-reduced-motion` guide — correct React implementation pattern

### Tertiary (LOW confidence)
- Competitor analysis (easy-peasy.ai, junia.ai) — feature landscape; surface review only; internal product decisions unknown
- html2canvas issue tracker (issues #328, #1463, #1940, #3198) — historical font loading failure documentation; html-to-image is the recommended mitigation

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*

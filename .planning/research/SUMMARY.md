# Project Research Summary

**Project:** EgoBoost 3000
**Domain:** AI-powered compliment card generator (React + Firebase + Gemini Flash web app)
**Researched:** 2026-03-13
**Confidence:** HIGH (core stack and architecture from official sources), MEDIUM (competitor feature landscape)

## Executive Summary

EgoBoost 3000 is a stateless, client-rendered single-page application that takes a name, calls Gemini Flash via Firebase AI Logic, and delivers an absurdly dramatic AI-written compliment framed inside a downloadable styled card image. The correct architectural pattern is direct client-to-Firebase AI Logic SDK calls — no Cloud Functions needed. The Firebase proxy keeps the Gemini API key server-side, and the entire UI state lives in a single `useCompliment` hook with four fields. This is intentionally a small, focused product; the temptation to add scope (auth, history, multiple styles, photo upload) should be resisted explicitly.

The core differentiator — and the feature that requires the most care to build correctly — is the downloadable styled card. No competitor in the compliment generator space offers a designed, downloadable card artifact. This means the Design Language System (DLS) must be built first, before any feature work, because the card's visual quality is the product. The download mechanism (html-to-image capturing a ref-forwarded React component) has well-known font and CORS failure modes that are invisible in development and visible in production. These must be treated as exit criteria, not polish.

The top risk is building fast and breaking on the details: hardcoded model names that cause outages when Google deprecates them, card downloads that silently render the wrong font, prompt injection through the name field, and CORS tainting that makes the download button appear broken on production domains. All six critical pitfalls identified in research map to Phase 1 or Phase 2 — none are later-stage concerns. The mitigation pattern is consistent: establish the correct pattern at the start (Remote Config for model name, `document.fonts.ready` await before capture, XML-delimited prompt structure) rather than retrofitting after the first incident.

## Key Findings

### Recommended Stack

The stack is a tight, modern pairing with no ambiguity: React 19 + Vite 8 + TypeScript scaffolded via `npm create vite@latest`, Firebase JS SDK 12.10.0 (which includes `firebase/ai` for Gemini access), and Tailwind CSS v4 via the `@tailwindcss/vite` plugin. Tailwind v4 requires zero config file — just `@import "tailwindcss"` in the CSS entry — which suits the DLS-first approach well. The single non-obvious choice is `html-to-image` over `html2canvas` for card export: html-to-image has better active maintenance, better font handling via SVG foreignObject, and cleaner React integration via `forwardRef`.

**Core technologies:**
- React 19 + Vite 8 + TypeScript: UI and build — the standard 2026 SPA starting point with first-class Firebase integration guides
- Firebase JS SDK 12.10.0 (`firebase/ai`): Gemini Flash proxy — keeps the API key server-side without a custom Cloud Function
- Tailwind CSS v4 (`@tailwindcss/vite`): Styling — zero-config, utility-first, DLS tokens map cleanly to utility classes
- html-to-image 1.11.13: Card PNG export — better font handling than html2canvas, actively maintained
- lucide-react 0.577.0: Icons — tree-shakeable, React-first, fits the "slightly retro techy" aesthetic
- Firebase Remote Config: Model name management — prevents production outage when Google deprecates a model

### Expected Features

The MVP is fully defined and tightly scoped. The hardest feature to build correctly (card download) is also the core differentiator — it must be in v1, not deferred. No competitor offers a designed downloadable card; that gap is the entire product identity.

**Must have (table stakes):**
- Name input + Generate button — entry point; generate must be disabled until name is non-empty
- AI compliment output via Gemini Flash — the payoff; must feel dramatic and personalized
- Loading state with typewriter animation — streaming preferred; prevents perceived brokenness during 1-3s generation
- Error state with retry and specific messages — 429 quota, network error, and generic failure need distinct friendly messages
- Regenerate button — single-shot is too limiting; overwrite model (not branching)
- Styled card component — DLS-first; the card IS the download artifact, built together not separately
- Download card as PNG — core differentiator; uses html-to-image + forwardRef; requires font-load await and CORS validation

**Should have (competitive):**
- Typewriter/animated compliment reveal — differentiates from static competitors; medium effort, high delight
- Kitchen sink DLS validation screen — dev-only route; mandatory for visual consistency between screen and card export
- Mobile-responsive layout — majority of casual web traffic is mobile; single-column on small viewports

**Defer (v2+):**
- User accounts and history — requires auth + storage stack, massively increases scope; stateless is a feature
- Multiple compliment styles/vibes — single dramatic voice IS the brand identity; picker adds friction before the payoff
- Photo upload personalization — content moderation pipeline, unproven value; name-based is sufficient
- Social sharing buttons — platform APIs change; downloaded image is universally shareable already
- Multiple language support — dramatic English register does not translate cleanly; English-first until validated

### Architecture Approach

The architecture is a single-page client application with one-way data flow and no global state store. Four local state fields (`name`, `compliment`, `loading`, `error`) live in a `useCompliment` hook. Components are stateless renderers consuming props and DLS tokens. The Firebase AI Logic SDK is initialized as a singleton in `firebase/ai.ts` and imported where needed. The card component uses `forwardRef` so the same DOM node renders on screen and is captured to PNG — one rendering path, not two. The folder structure follows feature-first organization with a hard separation between the DLS layer (built first) and the feature layer (built after DLS is validated on the kitchen sink screen).

**Major components:**
1. DLS Layer (`src/dls/`) — CSS custom properties for tokens/typography/color; built and validated first; everything downstream depends on it
2. Firebase AI Logic singleton (`src/firebase/ai.ts`) — one initialization point; includes Remote Config for model name; tested in isolation before any UI
3. `useCompliment` hook — owns all AI call logic and state; no UI coupling; testable independently
4. `ComplimentCard` component — pure renderer with `forwardRef`; styled entirely from DLS tokens; identical on-screen and in PNG export
5. `downloadCard` utility — scoped html-to-image capture with `document.fonts.ready` await and `pixelRatio: 2` for retina output
6. `KitchenSinkScreen` — dev-only route that validates every DLS token, font, and component variant before feature build begins

### Critical Pitfalls

1. **Hardcoded Gemini model name causes production outage** — `gemini-2.0-flash` retires June 1, 2026. Store the model name in Firebase Remote Config with a real-time listener from day one; never use a string literal in source code.

2. **Card download renders wrong font silently** — html-to-image captures a DOM clone; if the handwritten font hasn't finished loading, the canvas falls back to system sans-serif with no error. Always `await document.fonts.ready` before the capture call; prefer self-hosting fonts over Google Fonts CDN to avoid the async load race.

3. **CORS canvas taint makes download silently fail on production** — external font or image URLs in the card component cause `SecurityError: canvas tainted` on non-localhost origins. Self-host all card assets; test the download end-to-end on a deployed staging URL before calling Phase 2 complete.

4. **Prompt injection via name field** — raw user input interpolated into the prompt string allows instruction override (OWASP LLM01:2025). Wrap the name in XML delimiters in the prompt (`<user_name>Alex</user_name>`), add a system instruction treating it as data-only, and validate input to alphanumeric + limited punctuation, 50 chars max.

5. **429 rate limit errors surface as cryptic failures** — generic catch blocks make quota errors indistinguishable from network errors. Catch 429 explicitly and show a friendly message ("Too popular right now — try again in a moment"). Debounce the Generate button during active generation to prevent spam-clicking.

6. **Firebase Functions cold start (if Cloud Functions are ever used)** — 5-20 second first-request latency when no warm instance exists. This project correctly avoids Cloud Functions for AI calls (Firebase AI Logic client SDK handles it), but if any Cloud Function is added later, set `minInstances: 1`.

## Implications for Roadmap

Based on the dependency graph established across all four research files, three phases are appropriate. The architecture's build order is explicit: DLS before UI, Firebase before hooks, hooks before components, components before screens. The pitfall map aligns Phase 1 with all AI integration risks and Phase 2 with all card export risks — grouping prevention with implementation.

### Phase 1: Foundation and AI Integration

**Rationale:** The DLS and Firebase AI Logic setup are hard dependencies for every other phase. Pitfalls 1, 4, 5, and 6 all apply to the AI integration layer and must be addressed here, not retrofitted. Building and validating the kitchen sink screen before feature work prevents visual drift between the on-screen card and the downloaded card.

**Delivers:** Working Firebase project, Remote Config wired for model name, `useCompliment` hook returning real Gemini completions, kitchen sink screen validating all DLS tokens and fonts, input validation and prompt injection protection in place, 429 and error handling wired.

**Addresses features:** DLS/kitchen sink screen, name input + generate button, AI compliment output, loading state, error state with specific messages.

**Avoids pitfalls:** Hardcoded model name (Remote Config from day one), prompt injection (XML-delimited prompt structure from first implementation), 429 errors (explicit catch in initial error handler), cold start (client SDK, no Cloud Functions).

**Research flag:** Standard patterns — Firebase AI Logic is well-documented with official guides. No additional research phase needed.

### Phase 2: Card Component and Download

**Rationale:** The card component and download feature are tightly coupled — they must be built together using the same `forwardRef` pattern. Building them separately is the anti-pattern that causes two-path rendering drift. Pitfalls 2 and 3 (font fallback, CORS canvas taint) both live here and both require production-domain verification as exit criteria, not dev-only testing.

**Delivers:** `ComplimentCard` component styled with DLS tokens, `downloadCard` utility with `document.fonts.ready` await and `pixelRatio: 2`, end-to-end download verified on a deployed staging URL (not localhost), regenerate button, mobile-responsive layout.

**Addresses features:** Styled card component, download card as PNG, regenerate button, mobile layout.

**Avoids pitfalls:** Canvas font fallback (`document.fonts.ready` await, self-hosted or CORS-verified fonts), CORS canvas taint (staging deployment test as phase exit criterion), silent download failure (error toast on capture failure).

**Research flag:** Moderate risk — font loading and CORS behavior have known edge cases. The "Looks Done But Isn't" checklist from PITFALLS.md should be used as the phase exit checklist verbatim.

### Phase 3: Polish and Production Readiness

**Rationale:** Once core functionality is proven on a deployed staging environment, the remaining work is production hardening and delight features. Firebase App Check (reCAPTCHA v3) must be in place before any public URL is shared. Typewriter animation and card reveal polish are medium-effort, high-delight additions that are safe to defer until the core is solid.

**Delivers:** Firebase App Check enabled, typewriter animation on compliment reveal, Firebase Hosting production deployment with verified end-to-end flow, final smoke tests (cold start, download on production domain, 429 path).

**Addresses features:** Typewriter animation on reveal, App Check (security), production deployment.

**Avoids pitfalls:** Bot abuse of the Gemini endpoint (App Check), any latency or correctness regressions caught by production smoke tests.

**Research flag:** Standard patterns — Firebase App Check setup is documented with a straightforward reCAPTCHA v3 integration. No additional research phase needed.

### Phase Ordering Rationale

- DLS before features: the card download quality (the product's differentiator) depends entirely on CSS tokens being correct and stable before the card component is built. Post-hoc DLS refactors show up as visual drift in the downloaded PNG.
- Firebase + hook before UI: isolating `useCompliment` as a testable unit before wiring it to components means AI integration bugs are caught without UI noise.
- Card component and download in the same phase: these are the same artifact. Building them in different phases creates two rendering paths, which is the named anti-pattern in ARCHITECTURE.md.
- App Check deferred to Phase 3: it is required before any public URL is shared, but it actively complicates local development. Debug tokens handle dev; production App Check is a pre-launch step.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Card Export):** Font loading and CORS canvas behavior have known edge cases that vary by browser and hosting environment. The `document.fonts.ready` + self-hosted font approach is well-documented but the specific font files (Caveat, Pacifico) should be verified to load correctly in html-to-image's SVG foreignObject path on a real deployment before Phase 2 is considered complete.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Firebase AI Logic setup follows official documentation exactly. Remote Config for model name is documented with code samples. No novel integration work.
- **Phase 3 (Polish/Prod):** Firebase App Check with reCAPTCHA v3 has a standard documented integration. Typewriter animation is a solved UI pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry and official docs; Firebase AI Logic API verified against firebase.google.com; Tailwind v4 Vite setup verified from official blog |
| Features | HIGH (core), MEDIUM (competitors) | Core feature set and dependency graph are well-reasoned; competitor analysis is surface-level and based on live product observation, not internal data |
| Architecture | HIGH | Firebase AI Logic official docs are comprehensive; build order is derived directly from the dependency graph with no gaps; folder structure follows well-established React patterns |
| Pitfalls | HIGH | All six critical pitfalls are verified against official sources or well-documented open-source issue trackers; the model deprecation schedule is from Firebase's published deprecation page |

**Overall confidence:** HIGH

### Gaps to Address

- **html-to-image behavior with specific Google Fonts (Caveat, Pacifico) in SVG foreignObject:** Community sources confirm the general approach works; specific font files on the Google Fonts CDN have not been verified in this exact configuration. Treat Phase 2 font capture as requiring end-to-end testing on a real deployment before sign-off, not just localhost.
- **Gemini Flash streaming integration with Firebase AI Logic client SDK:** STACK.md confirms streaming is available; PITFALLS.md recommends it for perceived performance. The specific streaming API surface (`generateContentStream`) is not detailed in the architecture code samples. Verify the streaming hook implementation against Firebase AI Logic docs during Phase 1 implementation.
- **React 19 + react-hook-form compatibility:** Marked as MEDIUM confidence in STACK.md ("React 19 compatible per community reports"). For a single name input, `useState` with manual validation is the safer path; use react-hook-form only if validation UX requirements justify it after Phase 1 is running.

## Sources

### Primary (HIGH confidence)
- Firebase AI Logic official docs (firebase.google.com/docs/ai-logic) — client SDK architecture, App Check integration, quota and rate limits, Remote Config for model name, deprecation schedule
- Firebase Hosting docs (firebase.google.com/docs/hosting) — static SPA vs App Hosting distinction
- npm registry — verified package versions for firebase, react, vite, tailwindcss, html-to-image, lucide-react, react-hook-form
- Tailwind CSS blog (tailwindcss.com/blog/tailwindcss-v4) — Vite plugin setup, zero-config approach
- OWASP LLM01:2025 (genai.owasp.org) — prompt injection risk classification and mitigation
- CSS Font Loading API (MDN) — `document.fonts.ready` usage
- React folder structure 2025 — Robin Wieruch (robinwieruch.de) — feature-based project structure

### Secondary (MEDIUM confidence)
- Firebase blog: Building AI-powered apps with Firebase AI Logic — architecture patterns, Genkit vs client SDK boundary
- html-to-image vs html2canvas comparison (Better Programming) — library recommendation rationale
- Cloudscape Design System GenAI loading states (AWS) — streaming vs spinner UX patterns
- Comprehensive analysis of Firebase Functions cold starts (Java Code Geeks) — cold start latency data
- Shape of AI — Regenerate pattern — UX pattern for single-shot overwrite vs branching
- Digital Greeting Card Trends 2025 (expresswithacard.com) — market context for shareable card demand

### Tertiary (LOW confidence)
- Competitor feature analysis (easy-peasy.ai, junia.ai, yeschat.ai) — surface review; internal product decisions unknown
- html2canvas GitHub issues #328, #1463, #1940, #3198 — font loading failure documentation; well-documented but older issues, html-to-image is the recommended mitigation

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*

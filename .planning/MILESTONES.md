# Milestones

## v2.0 Make It Work (Shipped: 2026-03-14)

**Phases completed:** 2 phases (3-4), 4 plans
**Lines of code:** ~1,280 TypeScript/TSX
**Timeline:** 2 days (2026-03-13 → 2026-03-14)

**Key accomplishments:**
- Firebase AI Logic (Gemini Flash) wired via `firebase/ai` SDK — no backend server
- `useCompliment` hook with idle/generating/streaming/result/error state machine and debounce guard
- Streaming compliment display with `useTypewriter` hook — character-by-character reveal at 18ms/char
- Retina-sharp PNG card download via `html-to-image` with embedded Caveat font (CORS-safe)
- 32 automated tests (unit + integration) covering all states and edge cases
- Remote Config model name — swap Gemini model without redeploying

**Known gaps (dropped, not deferred):**
- VIZP-01: Animated icon background
- VIZP-02: Reduced-motion support
- VIZP-03: Mobile-responsive layout

**Archives:**
- `.planning/milestones/v2.0-ROADMAP.md`
- `.planning/milestones/v2.0-REQUIREMENTS.md`

---

## v1.0 MVP Foundation (Shipped: 2026-03-13)

**Phases completed:** 2 phases, 3 plans
**Lines of code:** 468 (TypeScript/CSS)
**Timeline:** 1 day (2026-03-13 → 2026-03-14)

**Key accomplishments:**
- Vite + React + TypeScript project with Tailwind v4 and self-hosted Caveat font
- Complete DLS token system — soft blues + cream palette, 8-step typography scale, card spacing tokens
- Icon component wrapping pixelarticons with semantic naming (generate, download, regenerate, brand, decorative)
- Kitchen sink validation screen at dev-only `/kitchen-sink` route (tree-shaken from prod)
- ComplimentCard component with greeting card aesthetic — cream background, soft shadow, heart icon, all DLS tokens

**Archives:**
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`

---

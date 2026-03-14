# EgoBoost 3000

## What This Is

A playful web app that generates ridiculously dramatic, AI-powered compliments. Users type their name, get an over-the-top personalized compliment streamed character-by-character, and download it as a styled PNG card to share. The experience lives in a calm, cozy aesthetic — soft blues and cream — that contrasts beautifully with the absurdly dramatic compliment text.

## Core Value

One tap from name to a downloadable, shareable compliment card that makes anyone smile.

## Requirements

### Validated

- ✓ Design Language System (DLS) layer built first with kitchen sink validation screen — v1.0
- ✓ App uses handwritten/whimsical typography (self-hosted Caveat) — v1.0
- ✓ Icons have a slightly retro techy feel (pixelarticons) — v1.0
- ✓ Card matches the app's calm/cozy aesthetic (soft blues, cream, handwritten font) — v1.0
- ✓ User can enter their name and receive an AI-generated ridiculously dramatic compliment — v2.0
- ✓ Compliment is generated via Firebase AI Logic (Gemini Flash, no backend server) — v2.0
- ✓ User can download the compliment as a styled card PNG — v2.0
- ✓ User can regenerate for a new compliment — v2.0
- ✓ UI is minimal — name input, generate button, card output, download button — v2.0
- ✓ Compliment display with typewriter streaming animation — v2.0
- ✓ Error state with friendly message and retry button — v2.0
- ✓ Card download renders fonts correctly (self-hosted, document.fonts.ready + getFontEmbedCSS) — v2.0
- ✓ Retina-quality PNG output (pixelRatio >= 2) — v2.0

### Active

(None — project is complete. Start fresh milestone for next feature set.)

### Out of Scope

- Copy to clipboard — keeping it card-download focused
- Social sharing buttons — users can share the downloaded card image themselves
- Vibe/style picker — single dramatic style keeps it simple
- User accounts or history — stateless, no login
- Mobile native app — web only
- Multiple languages — validate English first
- Photo upload — requires image processing, content moderation, storage
- Animated icon background (VIZP-01/02/03) — dropped from v2.0, may revisit in future milestone

## Context

- Target audience: Anyone who wants a quick smile — share with friends, coworkers, social media
- The humor comes from the contrast: calm, cozy design + absurdly dramatic compliment text
- Card download is the core deliverable, not just reading the compliment on screen
- Shipped v2.0 with ~1,280 LOC TypeScript/TSX
- Deployed at: https://egoboost3k.web.app (Firebase Hosting, free Spark plan)
- Tech stack: Vite 8, React 19, TypeScript, Tailwind v4, Firebase AI Logic (Gemini Flash), html-to-image, self-hosted Caveat font, pixelarticons
- 32 automated tests (Vitest + Testing Library) — unit + integration

## Constraints

- **AI Provider**: Gemini Flash via Firebase AI Logic SDK — no Cloud Functions, no backend
- **Framework**: React 19 + Vite 8
- **Backend**: Firebase Hosting + Firebase AI Logic
- **Design**: Calm & cozy (soft blues + cream), Caveat handwritten font (self-hosted), pixelarticons
- **Styling**: Tailwind v4 with CSS @theme block (no tailwind.config.js)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini Flash via Firebase AI Logic | User preference for Firebase stack + no backend server needed | ✓ Good — works, no Cloud Functions complexity |
| firebase/ai SDK (not Genkit) | Simpler, direct SDK integration — Genkit was overkill for this scope | ✓ Good — less abstraction, easier to debug |
| Streaming via generateContentStream | Enables typewriter animation during generation, not after | ✓ Good — key UX improvement |
| Card download as primary output | The shareable card IS the product, not just reading text | ✓ Good — validated by user |
| html-to-image with getFontEmbedCSS | Embeds self-hosted font into PNG without CORS issues | ✓ Good — Caveat renders correctly in downloaded PNG |
| pixelRatio Math.max(2, devicePixelRatio) | Guarantees retina quality on any display | ✓ Good — sharp PNGs confirmed |
| DLS-first approach | Build and validate design system before features | ✓ Good — stable visual foundation, no drift |
| Single compliment style (dramatic) | Simplicity — no vibe picker | ✓ Good — product identity is clearer for it |
| Self-hosted Caveat font | Required to avoid CORS canvas taint during card PNG export | ✓ Good — Google Fonts CDN not safe for html-to-image |
| Tailwind v4 CSS-only config | No tailwind.config.js — @theme block in CSS | ✓ Good — simpler, fewer files |
| Pixelarticons at 24px multiples only | Non-multiples cause sub-pixel blurring on pixel art | ✓ Good — crisp rendering |
| Drop Phase 5 Visual Polish | App is working and shipped; animated background is nice-to-have | ✓ Good — ship over perfect |

---
*Last updated: 2026-03-14 after v2.0 milestone*

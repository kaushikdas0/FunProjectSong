# EgoBoost 3000

## What This Is

A playful web app that generates ridiculously dramatic, AI-powered compliments. Users type their name, get an over-the-top personalized compliment, and download it as a cute styled card. The whole experience lives in a calm, cozy aesthetic — soft blues and cream — that contrasts beautifully with the absurdly dramatic compliment text.

## Core Value

One tap from name to a downloadable, shareable compliment card that makes anyone smile.

## Requirements

### Validated

- ✓ Design Language System (DLS) layer built first with kitchen sink validation screen — v1.0
- ✓ App uses handwritten/whimsical typography (self-hosted Caveat) — v1.0
- ✓ Icons have a slightly retro techy feel (pixelarticons) — v1.0
- ✓ Card matches the app's calm/cozy aesthetic (soft blues, cream, handwritten font) — v1.0

### Active

- [ ] User can enter their name and receive an AI-generated ridiculously dramatic compliment
- [ ] Compliment is generated via Gemini Flash API (Firebase stack)
- [ ] User can download the compliment as a styled card image
- [ ] User can regenerate for a new compliment
- [ ] UI is minimal — name input, generate button, card output, download button
- [ ] Compliment display with typewriter animation
- [ ] Error state with friendly message and retry button
- [ ] Card download renders fonts correctly (self-hosted, document.fonts.ready)
- [ ] Mobile-responsive layout (single-column on mobile)

### Out of Scope

- Copy to clipboard — keeping it card-download focused
- Social sharing buttons — users can share the downloaded card image themselves
- Vibe/style picker — single dramatic style keeps it simple
- User accounts or history — stateless, no login
- Mobile native app — web only
- Multiple languages — validate English first
- Photo upload — requires image processing, content moderation, storage

## Context

- Target audience: Anyone who wants a quick smile — share with friends, coworkers, social media
- The humor comes from the contrast: calm, cozy design + absurdly dramatic compliment text
- Card download is the core deliverable, not just reading the compliment on screen
- Shipped v1.0 with 468 LOC TypeScript/CSS
- Tech stack: Vite 8, React 19, TypeScript, Tailwind v4, self-hosted Caveat font, pixelarticons
- DLS foundation validated — all tokens, fonts, icons working on kitchen sink screen
- ComplimentCard component ready to receive dynamic name + compliment props

## Constraints

- **AI Provider**: Gemini Flash via Firebase — chosen for speed and cost efficiency
- **Framework**: React 19 + Vite 8
- **Backend**: Firebase stack
- **Design**: Calm & cozy (soft blues + cream), Caveat handwritten font (self-hosted), pixelarticons
- **Styling**: Tailwind v4 with CSS @theme block (no tailwind.config.js)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini Flash over Claude/OpenAI | User preference for Firebase stack + faster generation | — Pending |
| Card download as primary output | The shareable card IS the product, not just reading text | — Pending |
| DLS-first approach | Build and validate design system before features | ✓ Good — stable visual foundation, no drift |
| Single compliment style (dramatic) | Simplicity — no vibe picker for v1 | — Pending |
| Self-hosted Caveat font | Required to avoid CORS canvas taint during card PNG export | ✓ Good — Google Fonts CDN not safe for html-to-image |
| Tailwind v4 CSS-only config | No tailwind.config.js — @theme block in CSS | ✓ Good — simpler, fewer files |
| Pixelarticons at 24px multiples only | Non-multiples cause sub-pixel blurring on pixel art | ✓ Good — crisp rendering |

---
*Last updated: 2026-03-14 after v1.0 milestone*

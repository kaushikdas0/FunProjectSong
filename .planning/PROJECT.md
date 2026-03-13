# EgoBoost 3000

## What This Is

A playful web app that generates ridiculously dramatic, AI-powered compliments. Users type their name, get an over-the-top personalized compliment, and download it as a cute styled card. The whole experience lives in a calm, cozy aesthetic — soft blues and cream — that contrasts beautifully with the absurdly dramatic compliment text.

## Core Value

One tap from name to a downloadable, shareable compliment card that makes anyone smile.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can enter their name and receive an AI-generated ridiculously dramatic compliment
- [ ] Compliment is generated via Gemini Flash API (Firebase stack)
- [ ] User can download the compliment as a styled card image
- [ ] Card matches the app's calm/cozy aesthetic (soft blues, cream, handwritten font)
- [ ] User can regenerate for a new compliment
- [ ] Design Language System (DLS) layer built first with kitchen sink validation screen
- [ ] App uses handwritten/whimsical typography
- [ ] Icons have a slightly retro techy feel
- [ ] UI is minimal — name input, generate button, card output, download button

### Out of Scope

- Copy to clipboard — keeping it card-download focused
- Social sharing buttons — users can share the downloaded card image themselves
- Vibe/style picker — single dramatic style keeps it simple
- User accounts or history — stateless, no login
- Mobile native app — web only

## Context

- Target audience: Anyone who wants a quick smile — share with friends, coworkers, social media
- The humor comes from the contrast: calm, cozy design + absurdly dramatic compliment text
- Design-first approach: DLS layer with kitchen sink screen for visual validation before building features
- Card download is the core deliverable, not just reading the compliment on screen

## Constraints

- **AI Provider**: Gemini Flash via Firebase — chosen for speed and cost efficiency
- **Framework**: React
- **Backend**: Firebase stack
- **Design**: Calm & cozy (soft blues + cream), handwritten/whimsical fonts, slightly retro techy icons

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini Flash over Claude/OpenAI | User preference for Firebase stack + faster generation | — Pending |
| Card download as primary output | The shareable card IS the product, not just reading text | — Pending |
| DLS-first approach | Build and validate design system before features | — Pending |
| Single compliment style (dramatic) | Simplicity — no vibe picker for v1 | — Pending |

---
*Last updated: 2026-03-13 after initialization*

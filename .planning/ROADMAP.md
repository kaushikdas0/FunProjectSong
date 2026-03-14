# Roadmap: EgoBoost 3000

## Milestones

- ✅ **v1.0 MVP Foundation** — Phases 1-2 (shipped 2005-03-13)
- 🚧 **v2.0 Make It Work** — Phases 3-5 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP Foundation (Phases 1-2) — SHIPPED 2005-03-13</summary>

- [x] Phase 1: Design Language System (2/2 plans) — completed 2005-03-13
- [x] Phase 2: Card Component (1/1 plans) — completed 2005-03-13

</details>

### 🚧 v2.0 Make It Work (In Progress)

**Milestone Goal:** Turn the visual foundation into a fully working app — name input to downloadable compliment card, powered by Firebase AI Logic (Gemini Flash).

- [x] **Phase 3: AI Foundation** - Firebase project wired, name input triggers real Gemini completions with streaming, full error handling (completed 2005-03-13)
- [x] **Phase 4: Card Download** - Compliment streams onto the card with typewriter animation; card downloads as a retina-quality PNG with correct fonts (completed 2005-03-14)

## Phase Details

### Phase 3: AI Foundation
**Goal**: Users can enter their name and receive a real AI-generated compliment, with full error handling and regenerate support
**Depends on**: Phase 2 (DLS, ComplimentCard component)
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05
**Success Criteria** (what must be TRUE):
  1. User can type a name, tap Generate, and see a real Gemini-generated compliment appear
  2. User can tap Regenerate and receive a different compliment (previous one replaced)
  3. When generation fails (network error, quota exceeded), a friendly message and retry button appear — no raw API errors shown
  4. The app never exposes an API key in the browser bundle (Firebase AI Logic proxy handles it)
  5. The generate button cannot be tapped twice simultaneously (debounce prevents double-fire)
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Firebase SDK init, Vitest setup, useCompliment hook with state machine and tests
- [x] 03-02-PLAN.md — MainScreen wired to useCompliment with name input, generate/regenerate, error UI

### Phase 4: Card Download
**Goal**: The compliment streams onto the card with a typewriter effect and users can download a sharp, font-correct PNG
**Depends on**: Phase 3
**Requirements**: DWNL-01, DWNL-02, DWNL-03, GEN-03
**Success Criteria** (what must be TRUE):
  1. Compliment text streams onto the ComplimentCard character by character as Gemini generates it
  2. User can tap Download and receive a PNG file saved to their device
  3. Downloaded PNG renders Caveat font correctly (not system sans-serif fallback)
  4. Downloaded PNG is sharp on Retina/HiDPI displays (not blurry 1x resolution)
**Plans:** 2/2 plans complete

Plans:
- [ ] 04-01-PLAN.md — Install html-to-image, ref on ComplimentCard, downloadCard utility, useTypewriter hook, streaming useCompliment
- [ ] 04-02-PLAN.md — Wire streaming card + download button into MainScreen, human-verify full flow

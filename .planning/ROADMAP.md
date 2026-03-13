# Roadmap: EgoBoost 3000

## Milestones

- ✅ **v1.0 MVP Foundation** — Phases 1-2 (shipped 2026-03-13)
- 🚧 **v2.0 Make It Work** — Phases 3-5 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP Foundation (Phases 1-2) — SHIPPED 2026-03-13</summary>

- [x] Phase 1: Design Language System (2/2 plans) — completed 2026-03-13
- [x] Phase 2: Card Component (1/1 plans) — completed 2026-03-13

</details>

### 🚧 v2.0 Make It Work (In Progress)

**Milestone Goal:** Turn the visual foundation into a fully working app — name input to downloadable compliment card, powered by Firebase AI Logic (Gemini Flash).

- [ ] **Phase 3: AI Foundation** - Firebase project wired, name input triggers real Gemini completions with streaming, full error handling
- [ ] **Phase 4: Card Download** - Compliment streams onto the card with typewriter animation; card downloads as a retina-quality PNG with correct fonts
- [ ] **Phase 5: Visual Polish** - Animated icon background, mobile-responsive layout, reduced-motion support

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
**Plans**: TBD

Plans:
- [ ] 03-01: Firebase project setup, AI Logic SDK init, useCompliment hook with phase state machine
- [ ] 03-02: MainScreen wired to useCompliment — name input, generate/regenerate buttons, error state UI

### Phase 4: Card Download
**Goal**: The compliment streams onto the card with a typewriter effect and users can download a sharp, font-correct PNG
**Depends on**: Phase 3
**Requirements**: DWNL-01, DWNL-02, DWNL-03, GEN-03
**Success Criteria** (what must be TRUE):
  1. Compliment text streams onto the ComplimentCard character by character as Gemini generates it
  2. User can tap Download and receive a PNG file saved to their device
  3. Downloaded PNG renders Caveat font correctly (not system sans-serif fallback)
  4. Downloaded PNG is sharp on Retina/HiDPI displays (not blurry 1x resolution)
**Plans**: TBD

Plans:
- [ ] 04-01: forwardRef on ComplimentCard, downloadCard utility with document.fonts.ready + getFontEmbedCSS + pixelRatio >= 2
- [ ] 04-02: TypewriterText component wired to streaming output, download button in MainScreen

### Phase 5: Visual Polish
**Goal**: The app feels alive with a gentle animated background and works correctly on mobile devices
**Depends on**: Phase 3 (for real device layout testing with actual content)
**Requirements**: VIZP-01, VIZP-02, VIZP-03
**Success Criteria** (what must be TRUE):
  1. Pixelarticons float behind the card with a gentle color-fill and border pulse animation
  2. On a device with prefers-reduced-motion enabled, the background icons appear static (no animation)
  3. On a mobile phone, the full generate-to-download flow works in a single scrollable column without layout overflow
  4. Background animation does not cause jank (only transform/opacity animated, no paint-triggering properties)
**Plans**: TBD

Plans:
- [ ] 05-01: AnimatedIconBackground component with CSS keyframes, prefers-reduced-motion support
- [ ] 05-02: Mobile-responsive layout pass — single-column verified on real device

## Progress

**Execution Order:** 3 → 4 → 5

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design Language System | v1.0 | 2/2 | Complete | 2026-03-13 |
| 2. Card Component | v1.0 | 1/1 | Complete | 2026-03-13 |
| 3. AI Foundation | v2.0 | 0/2 | Not started | - |
| 4. Card Download | v2.0 | 0/2 | Not started | - |
| 5. Visual Polish | v2.0 | 0/2 | Not started | - |

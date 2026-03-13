# Requirements: EgoBoost 3000

**Defined:** 2026-03-13
**Core Value:** One tap from name to a downloadable, shareable compliment card that makes anyone smile

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Design System

- [ ] **DLS-01**: Color token system with soft blues + cream palette as CSS custom properties
- [ ] **DLS-02**: Typography system with handwritten/whimsical font (self-hosted) and heading/body scales
- [ ] **DLS-03**: Slightly retro techy icon set as inline SVGs
- [ ] **DLS-04**: Kitchen sink validation screen showing all DLS components together

### Card

- [ ] **CARD-01**: Styled card component with calm/cozy aesthetic (soft blues, cream, handwritten font, retro icons)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Core Interaction

- **CORE-01**: User can enter their name and trigger compliment generation
- **CORE-02**: AI-generated ridiculously dramatic compliment via Gemini Flash / Firebase
- **CORE-03**: Compliment display with typewriter animation
- **CORE-04**: Error state with friendly message and retry button
- **CORE-05**: Regenerate button to get a new compliment (overwrite model)

### Card Download

- **DWNL-01**: Download styled card as PNG image via html-to-image
- **DWNL-02**: Card download renders fonts correctly (self-hosted, document.fonts.ready)

### Layout

- **LAYT-01**: Mobile-responsive layout (single-column on mobile)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Vibe / style picker | Single "absurdly dramatic" voice IS the product identity |
| Copy to clipboard | Card-download focused; dilutes card-first identity |
| Social sharing buttons | Platform APIs change; users can share downloaded card themselves |
| User accounts / history | Stateless by design; massively increases scope |
| Multiple languages | Complicates prompt engineering; validate English first |
| Photo upload | Requires image processing, content moderation, storage |
| Rating / feedback on compliments | Kills the fun vibe; regeneration rate is implicit signal |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DLS-01 | Phase 1 | Pending |
| DLS-02 | Phase 1 | Pending |
| DLS-03 | Phase 1 | Pending |
| DLS-04 | Phase 1 | Pending |
| CARD-01 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*

# Roadmap: EgoBoost 3000

## Overview

EgoBoost 3000 ships in two focused phases. Phase 1 builds and validates the Design Language System — the visual foundation every component depends on — before a single feature is touched. Phase 2 builds the card component on top of that validated DLS. The DLS-first order is non-negotiable: the card's visual quality (self-hosted fonts, color tokens, icons) is what makes the downloaded PNG the product differentiator, and post-hoc DLS changes cause silent visual drift in card exports.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design Language System** - Build and validate the full DLS (colors, typography, icons, kitchen sink screen)
- [ ] **Phase 2: Card Component** - Build the styled compliment card on top of the validated DLS

## Phase Details

### Phase 1: Design Language System
**Goal**: The complete visual foundation is in place and validated — every DLS token, font, and icon can be seen working together on the kitchen sink screen before any feature is built
**Depends on**: Nothing (first phase)
**Requirements**: DLS-01, DLS-02, DLS-03, DLS-04
**Success Criteria** (what must be TRUE):
  1. The kitchen sink screen renders all color tokens (soft blues + cream palette) visibly and correctly with no fallback or missing values
  2. The handwritten/whimsical font loads from self-hosted files and renders at all heading/body scale steps — no system font fallback visible
  3. All retro techy icon SVGs render inline at their intended sizes with correct color tokens applied
  4. The kitchen sink screen exists at a dev-only route and shows every DLS component variant together on one page
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Vite project, install dependencies, create DLS token system and typography
- [ ] 01-02-PLAN.md — Build Icon component, kitchen sink screen, dev-only routing, visual approval

### Phase 2: Card Component
**Goal**: A styled compliment card component exists that uses only DLS tokens, renders correctly on screen, and is ready to receive a name and compliment as props
**Depends on**: Phase 1
**Requirements**: CARD-01
**Success Criteria** (what must be TRUE):
  1. The card component renders with the calm/cozy aesthetic — soft blues, cream background, handwritten font — pulling all styles from DLS tokens (no hardcoded values)
  2. The card displays a placeholder name and compliment text that is visually readable and formatted as a card artifact (not a plain text block)
  3. The card component appears on the kitchen sink screen alongside other DLS components, confirming visual consistency
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Language System | 0/2 | Not started | - |
| 2. Card Component | 0/TBD | Not started | - |

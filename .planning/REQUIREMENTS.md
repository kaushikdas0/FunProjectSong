# Requirements: EgoBoost 3000

**Defined:** 2026-03-14
**Core Value:** One tap from name to a downloadable, shareable compliment card that makes anyone smile

## v2.0 Requirements

Requirements for v2.0 Make It Work milestone. Each maps to roadmap phases.

### AI Generation

- [x] **GEN-01**: User can enter their name and tap a generate button to receive a compliment
- [x] **GEN-02**: Compliment is generated via Firebase AI Logic (Gemini Flash, no backend server)
- [x] **GEN-03**: Compliment text streams onto the card with a typewriter animation effect
- [x] **GEN-04**: User can tap regenerate to get a new compliment (replaces current one)
- [x] **GEN-05**: Error state shows a friendly message with a retry button

### Card Download

- [ ] **DWNL-01**: User can download the compliment card as a PNG image
- [ ] **DWNL-02**: Downloaded PNG renders fonts correctly (document.fonts.ready + getFontEmbedCSS)
- [ ] **DWNL-03**: Downloaded PNG is retina-quality (pixelRatio >= 2)

### Visual Polish

- [ ] **VIZP-01**: Animated icon background — pixelarticons scattered behind the card with color fill and gentle border pulse
- [ ] **VIZP-02**: Background respects prefers-reduced-motion (no animation if user prefers)
- [ ] **VIZP-03**: Mobile-responsive single-column layout

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

(None — v2.0 covers the full working product)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Copy to clipboard | Card-download focused; dilutes card-first identity |
| Social sharing buttons | Platform APIs change; users can share downloaded card themselves |
| Vibe / style picker | Single "absurdly dramatic" voice IS the product identity |
| User accounts / history | Stateless by design; massively increases scope |
| Multiple languages | Complicates prompt engineering; validate English first |
| Photo upload | Requires image processing, content moderation, storage |
| Production deployment | v2.0 is local dev; deployment is a separate milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GEN-01 | Phase 3 | Complete |
| GEN-02 | Phase 3 | Complete |
| GEN-03 | Phase 4 | Complete |
| GEN-04 | Phase 3 | Complete |
| GEN-05 | Phase 3 | Complete |
| DWNL-01 | Phase 4 | Pending |
| DWNL-02 | Phase 4 | Pending |
| DWNL-03 | Phase 4 | Pending |
| VIZP-01 | Phase 5 | Pending |
| VIZP-02 | Phase 5 | Pending |
| VIZP-03 | Phase 5 | Pending |

**Coverage:**
- v2.0 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation — all 11 requirements mapped*

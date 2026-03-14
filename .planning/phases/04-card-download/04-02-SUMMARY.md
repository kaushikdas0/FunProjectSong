---
phase: 04-card-download
plan: 02
subsystem: ui
tags: [react, useTypewriter, downloadCard, html-to-image, streaming, TDD, png-download]

# Dependency graph
requires:
  - phase: 04-card-download plan 01
    provides: useTypewriter hook, downloadCard lib, streaming ComplimentState, ComplimentCard with ref
provides:
  - MainScreen fully wired with streaming typewriter card display and download button
  - Complete end-to-end user flow: name input -> AI stream -> typewriter card -> PNG download
affects: [phase-05-polish, any phase touching MainScreen]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red/green, streaming state gating download button visibility, cardRef pattern for DOM capture]

key-files:
  created: []
  modified:
    - src/screens/MainScreen.tsx
    - src/screens/MainScreen.test.tsx
    - src/components/Card/ComplimentCard.tsx

key-decisions:
  - "Download button visibility gated strictly on isResult (not isStreaming) — prevents half-written card captures"
  - "canGenerate blocks during both isGenerating and isStreaming — prevents double-trigger mid-stream"
  - "Spinner shown during both generating and streaming states — consistent loading UX throughout AI pipeline"
  - "ComplimentCard outer padding (p-[10px]) + border-cream-400 added during human verify — card floats with breathing room in downloaded PNG"

patterns-established:
  - "Streaming card pattern: feed state.compliment to useTypewriter only during streaming state, use full text during result"
  - "cardRef wired to ComplimentCard ref prop (React 19 plain ref) — passed to downloadCard on button click"

requirements-completed: [DWNL-01, GEN-03]

# Metrics
duration: ~35min
completed: 2026-03-14
---

# Phase 4 Plan 02: MainScreen Integration Summary

**Streaming typewriter card display and download button wired into MainScreen — complete name-to-PNG flow user-verified with Caveat font and retina-sharp output**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-14T01:00:24Z
- **Completed:** 2026-03-14
- **Tasks:** 2 of 2 complete (Task 1 TDD, Task 2 human-verify — approved)
- **Files modified:** 3

## Accomplishments

- Wired useTypewriter hook into MainScreen: compliment text streams character-by-character during AI generation
- Added cardRef to ComplimentCard for DOM capture; Download button calls downloadCard(cardRef.current)
- Download button visible only in result state — blocked during streaming to prevent mid-text captures
- canGenerate and spinner extended to cover streaming state — consistent UX throughout AI pipeline
- Full TDD cycle: 4 new failing tests (RED), then all 32 tests passing (GREEN)
- Human verify approved: typewriter animates smoothly, Download produces retina-sharp PNG with Caveat handwriting font
- ComplimentCard enhanced during verify: border-cream-400 + 10px outer padding for floating card look in PNG exports

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing streaming/download tests** - `0a4710d` (test)
2. **Task 1 GREEN: Wire streaming display and download button** - `f5fdcd4` (feat)
3. **Task 2 human-verify: ComplimentCard border/padding for download polish** - `1aacaa0` (feat)

_Note: TDD tasks have two commits (test RED → feat GREEN)_

## Files Created/Modified

- `src/screens/MainScreen.tsx` - Added useTypewriter, downloadCard, cardRef, isStreaming state, Download button
- `src/screens/MainScreen.test.tsx` - Added 4 new tests: streaming card visible, download hidden during streaming, download visible in result, click calls downloadCard
- `src/components/Card/ComplimentCard.tsx` - Added border-cream-400 and 10px outer padding wrapper for polished PNG export look

## Decisions Made

- Download button gated on `isResult` only — streaming state intentionally excluded to prevent capturing half-written text
- `canGenerate` extended to block during `isStreaming` to prevent re-triggering while AI is mid-stream
- Spinner extended to both `isGenerating` and `isStreaming` for consistent loading feedback

## Deviations from Plan

### Human-Verify Enhancement

**[Checkpoint Discovery] ComplimentCard border and outer padding for download look**
- **Found during:** Task 2 (human-verify)
- **Issue:** Downloaded PNG looked flat without a border or padding around the card edge
- **Fix:** Added `border border-cream-400` to inner card div and `p-[10px]` outer wrapper to ComplimentCard
- **Files modified:** src/components/Card/ComplimentCard.tsx
- **Verification:** User confirmed PNG looks good — "ok all good"
- **Committed in:** 1aacaa0

---

**Total deviations:** 1 (visual enhancement discovered during human verification)
**Impact on plan:** Enhancement only — improves PNG output quality. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full streaming + download flow is complete and user-verified — all 32 automated tests pass
- Phase 4 is done (both plans executed and human-verified)
- Phase 5 (Visual Polish) can begin: background decorative icons already shipped in Phase 3, remaining polish work targets layout and visual refinement
- Known concern still open: self-hosted font on localhost may not embed in html-to-image (GitHub issue #412) — verify on staging URL before launch

---
*Phase: 04-card-download*
*Completed: 2026-03-14*

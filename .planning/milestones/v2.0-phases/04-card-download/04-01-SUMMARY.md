---
phase: 04-card-download
plan: 01
subsystem: ui
tags: [react, html-to-image, typewriter, streaming, firebase-ai, testing, vitest]

# Dependency graph
requires:
  - phase: 03-ai-foundation
    provides: useCompliment hook, firebase model abstraction (createModel/getModelName)

provides:
  - downloadCard utility (DOM-to-PNG with getFontEmbedCSS + retina pixelRatio)
  - useTypewriter hook (character-by-character reveal from a growing source string)
  - useCompliment with streaming state (generateContentStream, idle/generating/streaming/result/error)
  - ComplimentCard with React 19 ref prop (exposes DOM node for capture)

affects: [04-02, MainScreen integration, card export]

# Tech tracking
tech-stack:
  added:
    - html-to-image 1.11.13 (DOM-to-PNG with font embedding)
  patterns:
    - TDD red-green cycle for each module (tests written first, implementation follows)
    - React 19 ref as plain prop (no forwardRef wrapper)
    - generateContentStream with for-await chunk accumulation into streaming state
    - downloadCard: fonts.ready -> getFontEmbedCSS (try/catch) -> toPng pixelRatio>=2 -> anchor click
    - useTypewriter: setInterval at 18ms/char, slices from growing source string

key-files:
  created:
    - src/lib/downloadCard.ts
    - src/lib/downloadCard.test.ts
    - src/hooks/useTypewriter.ts
    - src/hooks/useTypewriter.test.ts
  modified:
    - src/hooks/useCompliment.ts
    - src/hooks/useCompliment.test.ts
    - src/components/Card/ComplimentCard.tsx
    - package.json

key-decisions:
  - "downloadCard try/catch around getFontEmbedCSS — localhost CORS failures must not block the download"
  - "pixelRatio Math.max(2, window.devicePixelRatio ?? 2) — guarantees retina quality on all displays"
  - "useTypewriter uses functional setState updater (prev => ...) to avoid stale closure over displayed length"
  - "streaming status added between generating and result — enables card to render partial text during stream"
  - "useCompliment.test.ts debounce test refactored with async generator and a deferred promise rather than mockReturnValueOnce new Promise — more idiomatic for streaming API"

patterns-established:
  - "Pattern: TDD cycle per module — write failing test, implement, verify green, commit"
  - "Pattern: React 19 ref as plain prop — Ref<HTMLDivElement> in interface, no forwardRef"
  - "Pattern: streaming state machine — generating/streaming/result with accumulated text"

requirements-completed: [DWNL-01, DWNL-02, DWNL-03, GEN-03]

# Metrics
duration: 18min
completed: 2026-03-14
---

# Phase 4 Plan 01: Building Blocks Summary

**html-to-image download utility, useTypewriter hook, streaming useCompliment, and React 19 ref on ComplimentCard — 28 tests green**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-14T08:55:00Z
- **Completed:** 2026-03-14T08:58:07Z
- **Tasks:** 2 of 2
- **Files modified:** 8

## Accomplishments

- `downloadCard` utility awaits `document.fonts.ready`, embeds fonts via `getFontEmbedCSS` (with CORS fallback), captures at `pixelRatio >= 2`, triggers browser download
- `useTypewriter` hook reveals characters at 18ms/char from a growing source string (streaming-friendly)
- `useCompliment` switched from `generateContent` to `generateContentStream` with chunk accumulation and a new `streaming` state status
- `ComplimentCard` now accepts `ref` as a plain prop (React 19 style) — exposes the outer `<div>` for DOM capture

## Task Commits

Each task was committed atomically:

1. **Task 1: Install html-to-image, add ref to ComplimentCard, downloadCard + useTypewriter** - `a848b2e` (feat)
2. **Task 2: Update useCompliment to generateContentStream with streaming state** - `46bab03` (feat)

## Files Created/Modified

- `src/lib/downloadCard.ts` - DOM-to-PNG download utility (fonts.ready, getFontEmbedCSS, toPng, anchor click)
- `src/lib/downloadCard.test.ts` - 6 unit tests (mocked html-to-image, CORS fallback, pixelRatio, anchor)
- `src/hooks/useTypewriter.ts` - Character-by-character reveal hook using setInterval
- `src/hooks/useTypewriter.test.ts` - 7 unit tests (fake timers, growing text, custom speed)
- `src/hooks/useCompliment.ts` - Updated to generateContentStream with streaming state union
- `src/hooks/useCompliment.test.ts` - Extended: 8 tests (updated mocks, 2 new streaming tests)
- `src/components/Card/ComplimentCard.tsx` - Added `ref?: Ref<HTMLDivElement>` prop (React 19)
- `package.json` - Added html-to-image dependency

## Decisions Made

- `getFontEmbedCSS` wrapped in try/catch — localhost CORS failures (html-to-image issue #412) must not prevent download; warning logged, toPng proceeds without embedded fonts
- `Math.max(2, window.devicePixelRatio ?? 2)` — ensures minimum 2x output on every display
- `useTypewriter` uses functional `setState(prev => ...)` — avoids stale closure over `displayed.length` inside the interval callback
- `streaming` state added between `generating` and `result` — card can render partial text during stream, enabling typewriter effect in Plan 02 integration
- Debounce test refactored to use async generator + deferred promise — `generateContentStream` returns an async iterable, not a plain Promise; the old `mockReturnValueOnce(new Promise(...))` pattern doesn't work for streaming

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test `document.createElement` recursion in downloadCard.test.ts**
- **Found during:** Task 1 (downloadCard GREEN phase)
- **Issue:** `document.createElement.bind(document)` was called inside `beforeEach` after the spy was already installed, causing infinite recursion when `vi.spyOn` intercepted the bound call
- **Fix:** Captured `Document.prototype.createElement.bind(document)` at describe-block scope before any spy was set up, so the original reference is preserved
- **Files modified:** `src/lib/downloadCard.test.ts`
- **Verification:** All 6 downloadCard tests pass with no stack overflow
- **Committed in:** `a848b2e` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test setup)
**Impact on plan:** Necessary fix for test correctness. No scope creep.

## Issues Encountered

None beyond the test recursion bug documented above.

## Next Phase Readiness

- All four building blocks are fully tested and ready for Plan 02 (MainScreen wiring)
- Plan 02 will: attach a `useRef` to `ComplimentCard`, show card during `streaming` state, pass partial text through `useTypewriter`, add Download button visible only in `result` state
- Risk noted in STATE.md: self-hosted Caveat font on localhost may not embed — verify on `vite preview` before closing DWNL-02

---
*Phase: 04-card-download*
*Completed: 2026-03-14*

---
phase: 04-card-download
verified: 2026-03-14T09:15:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
human_verification:
  - test: "Watch compliment stream onto the card character by character"
    expected: "Text appears one character at a time — not all at once — during AI generation"
    why_human: "useTypewriter hook is verified in unit tests with fake timers; cannot confirm the visual animation renders correctly in a real browser at 18ms/char intervals"
  - test: "Confirm no download button visible while text is streaming"
    expected: "Download button is absent during the streaming phase, appears only after generation completes"
    why_human: "Conditional rendering gated on isResult is verified in tests; real-time state transitions require browser observation to confirm UX is correct"
  - test: "Download a PNG and inspect font rendering"
    expected: "Downloaded PNG uses Caveat handwriting font, not a system sans-serif fallback"
    why_human: "getFontEmbedCSS embeds font as base64 CSS; whether the self-hosted Caveat font survives the html-to-image CORS fetch on localhost cannot be verified without running the app — known risk documented in SUMMARY"
  - test: "Inspect downloaded PNG sharpness"
    expected: "PNG is crisp and sharp at retina density, not blurry"
    why_human: "pixelRatio >= 2 is verified programmatically; actual visual sharpness of the rendered output requires human inspection of the file"
  - test: "Tap Boost Again and confirm new compliment replaces old one"
    expected: "Old card disappears, a new compliment streams in for the same or new name"
    why_human: "State machine regression that involves streaming-to-result-to-streaming; smoke test in browser is the simplest confirmation"
---

# Phase 4: Card Download Verification Report

**Phase Goal:** The compliment streams onto the card with a typewriter effect and users can download a sharp, font-correct PNG
**Verified:** 2026-03-14T09:15:00Z
**Status:** human_needed — all automated checks pass; 5 visual/runtime items require browser confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All truths come from the two PLAN frontmatter `must_haves` blocks (Plan 01 and Plan 02).

#### Plan 01 Must-Haves

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | downloadCard calls document.fonts.ready before capturing | VERIFIED | `downloadCard.ts` line 9: `await document.fonts.ready`. Test "calls document.fonts.ready before calling toPng" asserts ordering. |
| 2 | downloadCard passes pixelRatio >= 2 to toPng | VERIFIED | `downloadCard.ts` line 21: `Math.max(2, window.devicePixelRatio ?? 2)`. Test asserts `callOptions.pixelRatio >= 2`. |
| 3 | downloadCard calls getFontEmbedCSS and passes result to toPng | VERIFIED | `downloadCard.ts` lines 15-18 and 23-26. Test asserts `mockGetFontEmbedCSS` called with node, and `callOptions.fontEmbedCSS` equals returned value. |
| 4 | downloadCard triggers browser download via anchor click | VERIFIED | `downloadCard.ts` lines 29-32: creates anchor, sets `.download` and `.href`, calls `.click()`. Test asserts all three. |
| 5 | useCompliment hook streams chunks via generateContentStream | VERIFIED | `useCompliment.ts` lines 23-31: calls `model.generateContentStream`, iterates `for await` over `result.stream`, accumulates into state. |
| 6 | useCompliment state machine includes streaming status | VERIFIED | `useCompliment.ts` line 7: `\| { status: "streaming"; name: string; compliment: string }` in the union type. setState called with streaming status inside the loop. |
| 7 | useTypewriter hook reveals characters one at a time from a growing source string | VERIFIED | `useTypewriter.ts`: setInterval slices one character at a time using `text.slice(0, prev.length + 1)`. 7 tests pass including growing-text and incremental-reveal scenarios. |
| 8 | ComplimentCard accepts ref prop (React 19 style, no forwardRef) | VERIFIED | `ComplimentCard.tsx` line 12: `ref?: Ref<HTMLDivElement>` in props interface. Line 15: destructured as plain prop. No `forwardRef` anywhere in the file. |

#### Plan 02 Must-Haves

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 9 | Compliment text streams onto the card character by character as Gemini generates | VERIFIED (automated) / NEEDS HUMAN (visual) | `MainScreen.tsx` lines 33-37: feeds `state.compliment` to `useTypewriter` during streaming, renders `typedText` to card. Unit test confirms card is visible during streaming state. Browser confirmation needed for actual animation. |
| 10 | Card is visible during both streaming and result states | VERIFIED | `MainScreen.tsx` line 122: `{(isStreaming \|\| isResult) && ...}`. Test "during streaming state, card is visible with partial compliment" passes. |
| 11 | Download button appears only when generation is fully complete (result state) | VERIFIED | `MainScreen.tsx` line 125: `{isResult && (<button...Download Card</button>)}`. Tests confirm button absent during streaming and present during result. |
| 12 | Tapping Download saves a PNG file to the user's device | VERIFIED (automated) / NEEDS HUMAN (file inspection) | `MainScreen.tsx` line 127: `onClick={() => cardRef.current && downloadCard(cardRef.current)}`. Test "tapping download button calls downloadCard" passes. Font/sharpness quality needs human inspection. |

**Score:** 12/12 truths verified (automated). 5 items flagged for human visual/runtime confirmation.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/downloadCard.ts` | DOM-to-PNG download utility | VERIFIED | 33 lines. Substantive: fonts.ready, getFontEmbedCSS, toPng with pixelRatio, anchor download. Exports `downloadCard`. |
| `src/lib/downloadCard.test.ts` | Unit tests (mocked html-to-image) | VERIFIED | 127 lines. 6 tests covering all behaviors including CORS fallback. All pass. |
| `src/hooks/useTypewriter.ts` | Character-by-character text reveal hook | VERIFIED | 29 lines. Substantive: setInterval, functional setState updater, cleanup. Exports `useTypewriter`. |
| `src/hooks/useTypewriter.test.ts` | Unit tests for useTypewriter | VERIFIED | 88 lines. 7 tests with fake timers, growing text, custom speed. All pass. |
| `src/hooks/useCompliment.ts` | Updated hook with streaming state | VERIFIED | 43 lines. Substantive: streaming union member, generateContentStream, for-await accumulation. |
| `src/hooks/useCompliment.test.ts` | Extended tests covering streaming | VERIFIED | 229 lines. 8 tests including 2 new streaming-specific tests. All pass. |
| `src/components/Card/ComplimentCard.tsx` | Card with ref prop for DOM capture | VERIFIED | 39 lines. `ref?: Ref<HTMLDivElement>` as plain prop, passed to outer div. |
| `src/screens/MainScreen.tsx` | Wired screen with streaming card, download button | VERIFIED | 170 lines (exceeds 80-line minimum). useTypewriter, downloadCard, cardRef all wired. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/downloadCard.ts` | `html-to-image` | `import { toPng, getFontEmbedCSS }` | WIRED | Line 5: `import { toPng, getFontEmbedCSS } from 'html-to-image'`. Both used in function body. |
| `src/hooks/useCompliment.ts` | `firebase/ai` (via `src/lib/firebase.ts`) | `generateContentStream` + for-await | WIRED | Line 23: `model.generateContentStream(...)`. Line 28: `for await (const chunk of result.stream)`. |
| `src/screens/MainScreen.tsx` | `src/hooks/useTypewriter.ts` | import + fed streaming compliment | WIRED | Line 4: `import { useTypewriter }`. Line 34: `const typedText = useTypewriter(streamingCompliment)`. Line 37: `typedText` passed to card. |
| `src/screens/MainScreen.tsx` | `src/lib/downloadCard.ts` | import + called on button click with cardRef.current | WIRED | Line 5: `import { downloadCard }`. Line 127: `downloadCard(cardRef.current)` in onClick handler. |
| `src/screens/MainScreen.tsx` | `src/components/Card/ComplimentCard.tsx` | `ref={cardRef}` prop for DOM capture | WIRED | Line 13: `cardRef = useRef<HTMLDivElement>(null)`. Line 124: `<ComplimentCard ref={cardRef} ...>`. |

All 5 key links verified as fully wired — imports present and actually used.

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DWNL-01 | 04-01, 04-02 | User can download the compliment card as a PNG image | SATISFIED | downloadCard utility + Download button in MainScreen. Test confirms button click calls downloadCard. |
| DWNL-02 | 04-01 | Downloaded PNG renders fonts correctly (document.fonts.ready + getFontEmbedCSS) | SATISFIED (automated) / NEEDS HUMAN | Both calls implemented and tested. Whether Caveat font survives embed on localhost requires browser inspection. |
| DWNL-03 | 04-01 | Downloaded PNG is retina-quality (pixelRatio >= 2) | SATISFIED | `Math.max(2, window.devicePixelRatio ?? 2)` implemented and asserted in test. |
| GEN-03 | 04-01, 04-02 | Compliment text streams onto the card with a typewriter animation effect | SATISFIED (automated) / NEEDS HUMAN | streaming state + useTypewriter wired in MainScreen. Visual animation requires browser confirmation. |

No orphaned requirements: all 4 IDs declared across plans (DWNL-01, DWNL-02, DWNL-03, GEN-03) are accounted for. REQUIREMENTS.md traceability table marks all four as Complete under Phase 4.

---

## Anti-Patterns Found

No blockers or warnings found.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/downloadCard.ts` | 17 | `console.warn` | Info | Intentional — CORS fallback warning is correct behavior, not a debug leftover. |

No TODO/FIXME/placeholder comments. No empty return values. No stub implementations. All handlers make real API calls.

---

## Human Verification Required

Plan 02 included a blocking human-verify checkpoint (Task 2). The SUMMARY documents that this checkpoint was completed and the user approved. The following items are listed here for completeness and because the summary claim cannot be verified programmatically.

### 1. Typewriter Animation Smoothness

**Test:** Enter a name with 3+ characters and tap "Boost Me". Watch the compliment appear on the card.
**Expected:** Characters appear one at a time at approximately 18ms per character — a smooth handwriting feel, not a flash of full text.
**Why human:** useTypewriter uses setInterval at 18ms/char. Unit tests use fake timers to assert correctness. Real-time visual rendering in a browser cannot be confirmed without running the app.

### 2. Download Button Timing

**Test:** Tap "Boost Me" and observe the UI during and after generation.
**Expected:** No download button is visible while text is streaming. The "Download Card" button appears below the card only after the last chunk arrives and the full text is shown.
**Why human:** State transitions are tested with mocked useCompliment returning static states. The live sequence idle -> generating -> streaming -> result requires browser observation.

### 3. Font Rendering in Downloaded PNG

**Test:** Tap "Download Card" and open the downloaded `my-boost.png` file.
**Expected:** The name and compliment text render in the Caveat handwriting font, not a browser-default sans-serif.
**Why human:** `getFontEmbedCSS` fetches and base64-encodes the woff2 file at capture time. On localhost, this may fail due to a known html-to-image CORS issue (GitHub issue #412). The CORS fallback means the download still works but may use a system font. Only a real render confirms font correctness. The SUMMARY notes this risk and recommends verifying on `vite preview` rather than `npm run dev`.

### 4. PNG Sharpness

**Test:** Open `my-boost.png` in an image viewer. Zoom in on the text.
**Expected:** Text and card edges are crisp and sharp — not blurry or pixelated. This indicates the 2x pixel ratio is working.
**Why human:** `pixelRatio >= 2` is verified in tests. Visual sharpness of the actual output file requires human inspection.

### 5. Boost Again Resets Typewriter

**Test:** After a result appears, tap "Boost Again" and enter a name.
**Expected:** The old card disappears (idle state, no card visible), then a new compliment streams in character by character.
**Why human:** This is a multi-step state regression (result -> generating -> streaming -> result) involving the useTypewriter `displayed` state resetting. The unit tests cover individual states in isolation; the full cycle needs smoke testing.

---

## Gaps Summary

No gaps. All automated truths are verified.

The phase goal is structurally achieved: the compliment streams onto the card (useCompliment streaming state + useTypewriter wired in MainScreen), and users can download a sharp PNG (downloadCard with fonts.ready + getFontEmbedCSS + pixelRatio >= 2 + anchor click). All 32 tests pass. No TypeScript errors. The human verification items are quality confirmations of visual behavior, not missing functionality.

The one open technical risk is font embedding on localhost (CORS). This is known, documented, and handled gracefully with a fallback — the download works regardless; only the font may degrade. This is not a gap in the implementation.

---

_Verified: 2026-03-14T09:15:00Z_
_Verifier: Claude (gsd-verifier)_

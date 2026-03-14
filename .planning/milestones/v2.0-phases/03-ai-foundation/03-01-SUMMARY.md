---
phase: 03-ai-foundation
plan: 01
subsystem: ai
tags: [firebase, firebase-ai, remote-config, react-hooks, vitest, testing-library, gemini]

# Dependency graph
requires:
  - phase: 02-card-component
    provides: ComplimentCard component that receives name + compliment props
provides:
  - Firebase singleton init (src/lib/firebase.ts) — firebaseApp, getModelName, createModel
  - useCompliment hook (src/hooks/useCompliment.ts) — four-state machine idle/generating/result/error
  - Vitest test infrastructure configured (vitest.config.ts, jsdom environment)
  - .env.example with all six VITE_FIREBASE_* empty placeholders
  - TypeScript env type augmentation (src/vite-env.d.ts)
affects: [03-ai-foundation, 04-export-share]

# Tech tracking
tech-stack:
  added:
    - vitest@4.1.0 (test runner, jsdom environment)
    - "@testing-library/react@16 (renderHook, act)"
    - "@testing-library/dom (peer dep of testing-library/react)"
    - "@testing-library/user-event@14"
    - jsdom@28
  patterns:
    - Firebase singleton module pattern — one initializeApp() in src/lib/firebase.ts, never in hooks
    - Discriminated union state machine in custom hook (ComplimentState)
    - isFlyingRef debounce guard prevents double-fire without external library
    - useCallback with empty deps array for stable generate function reference

key-files:
  created:
    - src/lib/firebase.ts
    - src/hooks/useCompliment.ts
    - src/hooks/useCompliment.test.ts
    - vitest.config.ts
    - src/vite-env.d.ts
  modified:
    - .env.example
    - package.json

key-decisions:
  - "vitest --legacy-peer-deps required: @tailwindcss/vite@4.2.1 declares peer vite ^5-7 but project uses vite 8; vitest 4.1.0 supports vite 8 correctly so --legacy-peer-deps is safe"
  - "vitest.config.ts excludes tailwindcss plugin — Tailwind is a CSS build plugin, not needed in test environment"
  - "createModel is synchronous (not async) — getGenerativeModel is cheap; Remote Config fetch happens in getModelName separately"
  - "Debounce test validates by checking final state is Alice (not Bob) and generateContent called once — more robust than timing-dependent 0-call assertion"

patterns-established:
  - "Firebase singleton: Initialize once in src/lib/firebase.ts; all hooks/components import from there"
  - "State machine hook: Export discriminated union type + hook returning { state, action } pairs"
  - "TDD flow: Write tests with mocked Firebase modules first (RED), then implement (GREEN)"

requirements-completed: [GEN-02, GEN-04, GEN-05]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 3 Plan 01: AI Foundation Summary

**Firebase AI Logic hook with four-state machine (idle/generating/result/error), Remote Config model name, GoogleAIBackend singleton, and full Vitest test suite (6/6 passing)**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-13T17:21:01Z
- **Completed:** 2026-03-13T17:36:00Z
- **Tasks:** 2 completed (Task 0: scaffolding, Task 1: TDD implementation)
- **Files modified:** 7

## Accomplishments

- Vitest 4.1.0 configured with jsdom for React hook testing — full test infrastructure operational
- Firebase singleton module with AI instance, Remote Config model name fetch, and Grand Compliment Oracle system instruction
- useCompliment hook with idle/generating/result/error state machine, isFlyingRef debounce guard, and useCallback stability
- All 6 unit tests pass with fully mocked Firebase dependencies

## Task Commits

Each task was committed atomically:

1. **Task 0: Install dependencies and configure Vitest** - `5708df3` (chore)
2. **Task 1 RED: Add failing tests for useCompliment** - `85e2f56` (test)
3. **Task 1 GREEN: Firebase singleton + useCompliment hook** - `07e5a1e` (feat)

_Note: TDD task has two commits — RED (failing tests) then GREEN (implementation)._

## Files Created/Modified

- `src/lib/firebase.ts` - Firebase singleton init, getModelName (Remote Config), createModel (GoogleAIBackend, system instruction, generationConfig)
- `src/hooks/useCompliment.ts` - Four-state machine hook: idle/generating/result/error with isFlyingRef debounce
- `src/hooks/useCompliment.test.ts` - 6 unit tests: initial state, generate→result, debounce guard, error transition, error→retry, regenerate
- `vitest.config.ts` - Vitest config with jsdom environment, globals: true, react plugin
- `src/vite-env.d.ts` - TypeScript ImportMetaEnv interface for all 6 VITE_FIREBASE_* vars
- `.env.example` - Updated to empty placeholder values (6 keys, no MEASUREMENT_ID)
- `package.json` - Added test script, vitest + testing-library devDependencies

## Decisions Made

- Used `--legacy-peer-deps` for vitest install: `@tailwindcss/vite@4.2.1` incorrectly declares peer vite `^5-7` but vitest 4.1.0 correctly supports vite 8. The --legacy-peer-deps flag bypasses the false conflict.
- Excluded tailwindcss plugin from vitest.config.ts: Tailwind is a CSS build-time plugin, not needed during unit tests.
- `createModel` is synchronous: `getGenerativeModel` is a cheap synchronous call; the async work lives in `getModelName()` which handles Remote Config. Keeping them separate simplifies testing and hook implementation.
- Debounce test assertion: Changed from checking `toHaveBeenCalledTimes(0)` (timing-sensitive) to verifying the final state shows Alice and generateContent called exactly once (semantically correct and timing-stable).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest install peer dep conflict with @tailwindcss/vite**
- **Found during:** Task 0 (dependency installation)
- **Issue:** `@tailwindcss/vite@4.2.1` declares peer `vite@"^5.2.0 || ^6 || ^7"` which conflicts with project's `vite@8`. vitest npm install fails without flag.
- **Fix:** Used `npm install -D vitest@4.1.0 ... --legacy-peer-deps` — safe because vitest 4.1.0 explicitly supports vite `^8.0.0-0` in its own peer deps.
- **Files modified:** package.json, package-lock.json
- **Verification:** vitest runs successfully after install
- **Committed in:** 5708df3 (Task 0 commit)

**2. [Rule 3 - Blocking] Missing @testing-library/dom peer dependency**
- **Found during:** Task 1 GREEN (first test run)
- **Issue:** `@testing-library/react` requires `@testing-library/dom` as a peer dep; not automatically installed
- **Fix:** `npm install -D @testing-library/dom --legacy-peer-deps`
- **Files modified:** package.json, package-lock.json
- **Verification:** Tests import successfully, all 6 pass
- **Committed in:** 07e5a1e (Task 1 GREEN commit)

**3. [Rule 1 - Bug] Debounce test had incorrect assertion**
- **Found during:** Task 1 GREEN (tests run with 5/6 passing)
- **Issue:** Test asserted `mockGenerateContent.toHaveBeenCalledTimes(0)` immediately after Bob's generate call, but Alice's async chain had already reached `generateContent` by that point. The debounce is working correctly; the test expectation was wrong.
- **Fix:** Rewrote assertion to verify final state is Alice's result AND generateContent called exactly once (Bob's call never executed)
- **Files modified:** src/hooks/useCompliment.test.ts
- **Verification:** All 6 tests pass
- **Committed in:** 07e5a1e (Task 1 GREEN commit)

---

**Total deviations:** 3 auto-fixed (2 blocking dependencies, 1 test assertion bug)
**Impact on plan:** All fixes required for correct test execution. No scope creep.

## Issues Encountered

- `tinyexec@1.0.3` (vitest dependency) had a corrupt npm publish where `dist/main.js` was missing. Resolved by re-running `npm install` which pulled a fresh copy with the correct file.

## User Setup Required

Firebase environment variables must be set before the app can make real AI calls. The `.env.example` lists all required keys — copy to `.env` and fill in values from the Firebase Console (Project Settings > General > Your apps > Web app config).

Required keys: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID.

## Next Phase Readiness

- useCompliment hook is the complete AI backbone for Phase 3 UI wiring (Plan 02)
- Firebase module exports are stable: `firebaseApp`, `getModelName`, `createModel`
- All tests pass with mocked Firebase — real API calls need `.env` populated from Firebase Console
- Concern: Remote Config fetch requires live Firebase project — tests pass with mocks but integration testing requires the `.env` to be populated

## Self-Check: PASSED

- FOUND: src/lib/firebase.ts
- FOUND: src/hooks/useCompliment.ts
- FOUND: src/hooks/useCompliment.test.ts
- FOUND: vitest.config.ts
- FOUND: .env.example
- FOUND: .planning/phases/03-ai-foundation/03-01-SUMMARY.md
- FOUND commit: 5708df3 (chore: install Vitest)
- FOUND commit: 85e2f56 (test: RED failing tests)
- FOUND commit: 07e5a1e (feat: GREEN implementation)
- 6/6 tests passing confirmed

---
*Phase: 03-ai-foundation*
*Completed: 2026-03-14*

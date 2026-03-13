---
phase: 3
slug: ai-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Wave 0 installs) |
| **Config file** | `vitest.config.ts` (Wave 0 creates) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | GEN-02 | unit | `npx vitest run src/hooks/useCompliment.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | GEN-01 | unit | `npx vitest run src/hooks/useCompliment.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | GEN-04 | unit | `npx vitest run src/hooks/useCompliment.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | GEN-05 | unit | `npx vitest run src/hooks/useCompliment.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | GEN-01 | integration | `npx vitest run src/screens/MainScreen.test.tsx` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | GEN-05 | integration | `npx vitest run src/screens/MainScreen.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event jsdom` — test framework + React testing utils
- [ ] `vitest.config.ts` — Vitest configuration (jsdom environment for React)
- [ ] `src/hooks/useCompliment.test.ts` — stubs for GEN-01, GEN-02, GEN-04, GEN-05
- [ ] `src/screens/MainScreen.test.tsx` — stubs for GEN-01 UI, GEN-05 UI

*Wave 0 tasks must be the first tasks in Plan 03-01.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| API key not in browser bundle | GEN-03 | Requires inspecting built output | 1. Run `npm run build` 2. Search `dist/` for Gemini API key string 3. Verify only Firebase `apiKey` (public) appears |
| Real Gemini response renders | GEN-02 | E2E requires live API | 1. Enter name 2. Tap Generate 3. Verify AI-generated compliment appears in card |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

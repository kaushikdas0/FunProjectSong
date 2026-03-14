---
phase: 5
slug: visual-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | VIZP-01 | unit | `npm test -- --reporter=verbose` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | VIZP-02 | manual-only | — | N/A | ⬜ pending |
| 05-02-01 | 02 | 1 | VIZP-03 | manual-only | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/AnimatedIconBackground/AnimatedIconBackground.test.tsx` — smoke test: component renders without crashing, `aria-hidden="true"` present on wrapper

*Existing 28-test suite in MainScreen.test.tsx covers the rest of the app — no gaps there.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| prefers-reduced-motion disables animation | VIZP-02 | jsdom cannot evaluate CSS @media queries | In Chrome DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce"; verify icons are static |
| No layout overflow at 375px viewport | VIZP-03 | Requires real browser or Playwright | In Chrome DevTools → toggle device toolbar → iPhone SE (375px); verify full generate-to-download flow in single scrollable column without overflow |
| No paint-triggering jank | VIZP-01 | Requires browser performance tools | In Chrome DevTools → Performance tab; record animation cycle; verify only composite layers used (transform/opacity) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 4
slug: card-download
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

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
| 04-01-01 | 01 | 1 | DWNL-01, DWNL-03 | unit | `npm test -- src/lib/downloadCard.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DWNL-02 | manual-only | Manual: inspect downloaded PNG | N/A | ⬜ pending |
| 04-02-01 | 02 | 1 | GEN-03 | unit | `npm test -- src/components/TypewriterText.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | GEN-03 | unit | `npm test -- src/hooks/useCompliment.test.ts` | ✅ (extend) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/downloadCard.test.ts` — stubs for DWNL-01, DWNL-03 (mock html-to-image, assert pixelRatio ≥ 2, assert anchor click)
- [ ] `src/components/TypewriterText.test.tsx` — stubs for GEN-03 (character-by-character reveal)
- [ ] `src/hooks/useCompliment.test.ts` — EXTEND to cover streaming state transitions (generating → streaming → result)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Font correctly embedded in PNG | DWNL-02 | jsdom has no `document.fonts`, canvas, or blob export | 1. Generate a compliment 2. Tap Download 3. Open PNG 4. Verify Caveat font renders (not system sans-serif) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 1
slug: design-language-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (to be installed — greenfield project) |
| **Config file** | `vitest.config.ts` (Wave 0 creates) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Visual check of kitchen sink screen in browser (`npm run dev`, navigate to `/kitchen-sink`)
- **After every plan wave:** Full kitchen sink visual inspection — all sections render without fallbacks
- **Before `/gsd:verify-work`:** Full suite must be green + user approves kitchen sink screen
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 0 | — | scaffold | `npm run dev` starts without error | ❌ W0 | ⬜ pending |
| 01-02 | 01 | 1 | DLS-01 | smoke | Check `--color-blue-400` exists in rendered DOM styles | ❌ W0 | ⬜ pending |
| 01-03 | 01 | 1 | DLS-02 | smoke/manual | `document.fonts.check('1em Caveat')` returns true | ❌ W0 | ⬜ pending |
| 01-04 | 01 | 1 | DLS-03 | manual visual | Kitchen sink screen visual inspection at `/kitchen-sink` | ❌ W0 | ⬜ pending |
| 01-05 | 01 | 1 | DLS-04 | smoke | `GET /kitchen-sink` returns 200 in dev mode | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm create vite@latest` — scaffold React + TypeScript project
- [ ] `npm install -D vitest @vitest/ui` — test framework
- [ ] `npm install @fontsource/caveat` — self-hosted font
- [ ] `npm install pixelarticons` — pixel art icon set
- [ ] `npm install react-router-dom` — routing for kitchen sink dev route
- [ ] `vitest.config.ts` — test configuration
- [ ] `src/dls/tokens.css` — @theme block stub
- [ ] `src/dls/index.css` — entry point with @import statements

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Icons render at intended sizes with correct color | DLS-03 | Visual pixel-art rendering quality cannot be asserted programmatically | Open `/kitchen-sink`, inspect icon section — all icons visible at 24/48px, colors match tokens |
| Font renders with whimsical style, no system fallback | DLS-02 | Visual font quality is subjective | Open `/kitchen-sink`, inspect typography section — Caveat visible, no serif/sans-serif fallback |
| Color palette feels cohesive | DLS-01 | Aesthetic judgment | Open `/kitchen-sink`, review color swatches against `font-preview.html` reference |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

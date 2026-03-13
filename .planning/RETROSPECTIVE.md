# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP Foundation

**Shipped:** 2026-03-13
**Phases:** 2 | **Plans:** 3

### What Was Built
- Complete DLS token system (colors, typography, spacing) in Tailwind v4 CSS @theme block
- Self-hosted Caveat handwriting font with 8-step type scale
- Icon component wrapping pixelarticons with semantic naming
- Kitchen sink validation screen at dev-only route
- ComplimentCard component with greeting card aesthetic — cream, soft shadow, heart icon

### What Worked
- DLS-first approach paid off — card component was straightforward because all tokens were validated
- Kitchen sink screen as visual proof point — caught issues before building features
- Self-hosted font decision made early — avoids CORS headaches later during card PNG export
- Small focused phases (2 phases, 3 plans) kept scope tight and momentum high

### What Was Inefficient
- Research step could have been skipped for Phase 2 given the small scope (was skipped manually with --skip-research)
- Summary one-liner fields weren't populated by executors — minor tooling gap

### Patterns Established
- Tailwind v4 CSS-only config pattern (no tailwind.config.js)
- Icon wrapper pattern with semantic type names mapped to pixelarticons
- Dev-only route pattern via import.meta.env.DEV + React.lazy
- Card padding via inline CSS variables when Tailwind can't generate custom spacing utilities

### Key Lessons
1. Design-first approach with kitchen sink validation builds confidence — every subsequent component uses proven tokens
2. Self-hosting fonts is non-negotiable when canvas/image export is in scope
3. Pixel art icons must render at exact multiples of their grid size (24px) to avoid sub-pixel blur

### Cost Observations
- Model mix: balanced profile (opus orchestrator, sonnet subagents)
- Sessions: 2 (one for Phase 1, one for Phase 2 + milestone completion)
- Notable: Small milestone completed in a single day

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 2 | 3 | DLS-first foundation approach |

### Top Lessons (Verified Across Milestones)

1. Build visual foundation before features — prevents style drift
2. Self-host fonts when image export is in scope

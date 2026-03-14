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

## Milestone: v2.0 — Make It Work

**Shipped:** 2026-03-14
**Phases:** 2 (3-4) | **Plans:** 4

### What Was Built
- Firebase AI Logic (Gemini Flash) hook with idle/generating/streaming/result/error state machine
- Streaming typewriter animation — compliment reveals character-by-character during generation
- Retina PNG card download via html-to-image with embedded Caveat font
- 32 automated tests covering all states, debounce guard, streaming, and download flow

### What Worked
- TDD cycle per module — every hook and utility written test-first, caught real bugs before integration
- Discriminated union state machine — clean conditional rendering with no boolean flag soup
- React 19 ref-as-prop pattern — no forwardRef boilerplate for DOM capture
- Streaming state between generating and result — enables typewriter without post-hoc animation hacks
- Deciding early to drop Phase 5 — app works, shipping > polishing

### What Was Inefficient
- Phase 5 Visual Polish was planned, partially executed, reverted, then removed — wasted planning and execution cycles on work that was ultimately cut
- Firebase project migration mid-session (expired API key) — avoidable with earlier key rotation awareness
- Summary one-liner fields still not populated by executors — same gap as v1.0, still minor

### Patterns Established
- Streaming state machine: idle → generating → streaming → result (not just idle → loading → result)
- getFontEmbedCSS in try/catch: CORS failures on localhost must not block download
- useTypewriter reads from growing source string via functional setState — avoids stale closures
- React 19 ref as plain prop: `ref?: Ref<HTMLDivElement>` in interface, no forwardRef

### Key Lessons
1. Plan for API key rotation — external services expire; have a rotation procedure before it causes downtime
2. Cut scope early rather than late — Phase 5 revert+remove cost more than never planning it
3. Streaming state as first-class status enables richer UX with no extra complexity in the consumer
4. Test the download on a real deployed URL, not just localhost — CORS behavior differs

### Cost Observations
- Model mix: balanced profile (sonnet executor)
- Sessions: ~3 (phases 3-4, security audit, migration/cleanup)
- Notable: Both phases completed in a single day; Firebase project migration added unplanned session

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 2 | 3 | DLS-first foundation approach |
| v2.0 | 2 | 4 | Streaming state machine + TDD per module |

### Top Lessons (Verified Across Milestones)

1. Build visual foundation before features — prevents style drift
2. Self-host fonts when image export is in scope
3. Cut scope decisions early — late cuts waste planning and execution cycles
4. Streaming state as first-class status unlocks richer UX with no consumer complexity

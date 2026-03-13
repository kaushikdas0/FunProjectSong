# Phase 2: Card Component - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

A styled compliment card component that uses only DLS tokens, renders correctly on screen, and is ready to receive a name and compliment as props. This phase builds the card visual artifact — no AI integration, no download functionality, just the card component itself displayed on the kitchen sink screen.

</domain>

<decisions>
## Implementation Decisions

### Card Visual Style
- Layered/paper-textured background feel — like real stationery or a greeting card
- Soft shadow only, no visible border — gentle drop shadow lifts the card off the page
- Vertical/portrait proportions — taller than wide, greeting card feel
- Medium/centered on the page with breathing room around it — feels like an object you're looking at
- Cream card background on a periwinkle/soft blue page background — warm card pops against cool surroundings

### Content Layout
- Center-aligned text throughout — classic greeting card feel, natural with Caveat handwriting
- Name large on top (display size), compliment body text below — "Dear [Name]" energy
- Small "EgoBoost 3000" text at the bottom footer — subtle branding, identifies source when shared
- Placeholder name and compliment text for this phase (real AI text comes later)

### Decorative Touches
- Minimal decoration — clean and elegant, let typography and colors do the work
- Small decorative heart icon (pixelarticons) near the person's name — adds warmth
- Thin subtle horizontal line divider between name and compliment (cream-400 or blue-200 color)
- No other flourishes, patterns, or corner decorations

### Claude's Discretion
- Text sizing strategy for different compliment lengths (fixed size vs shrink-to-fit)
- Exact shadow values and card dimensions
- Paper/stationery texture approach (CSS only — subtle grain, off-white variation, or similar)
- Exact placement of the heart icon relative to the name
- Footer "EgoBoost 3000" styling (size, color, opacity)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/dls/tokens.css`: All 19 color tokens, `--radius-card: 20px`, `--spacing-card-pad-x: 36px`, `--spacing-card-pad-y: 40px` — card-specific tokens already defined
- `src/dls/typography.css`: 8-step type scale from `.text-display` (48px) to `.text-label` (14px) — all in Caveat
- `src/components/Icon/Icon.tsx`: Heart icon available as `<Icon name="decorative" />`, Zap as `<Icon name="brand" />`
- Tailwind v4 with `@theme` block — use `bg-cream-*`, `text-text-primary`, `shadow-*` utilities

### Established Patterns
- CSS-only DLS approach via Tailwind v4 @theme (no JS token files)
- Icon color controlled via `text-*` classes on the Icon component (fill=currentColor)
- Render pixelarticons at multiples of 24px only (24, 48) for pixel-perfect sharpness
- Self-hosted Caveat font (3 weights: 400, 600, 700) — no Google Fonts CDN

### Integration Points
- Card component added to KitchenSinkScreen.tsx for visual validation alongside existing DLS components
- Card must work with html-to-image in future phase — self-hosted fonts and no external resources are critical
- Card receives `name` and `compliment` as props (placeholder values for now)

</code_context>

<specifics>
## Specific Ideas

- The card should feel like a little gift — warm, personal, something you'd want to send to a friend
- Paper/stationery texture provides physical-object feel that contrasts nicely with the pixel-art digital icons
- The humor contrast (calm design + dramatic text) means the card itself should be serene and inviting

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-card-component*
*Context gathered: 2026-03-13*

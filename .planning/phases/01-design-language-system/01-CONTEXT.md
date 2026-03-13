# Phase 1: Design Language System - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete visual foundation: color tokens, typography system, icon set, and a kitchen sink validation screen. This phase delivers the DLS that all future components (especially the card in Phase 2) will consume. No features, no AI integration — purely visual foundation.

</domain>

<decisions>
## Implementation Decisions

### Color Palette
- Periwinkle blue (#9EB1CF range) as the primary blue
- Blush cream with pink undertone (#FFF0EC range) as background/base
- Soft coral/peach as accent color (buttons, CTAs, highlights)
- Standard palette size: 6-8 shades (light/medium/dark variants of blue and cream, plus accent and text colors)
- All colors defined as CSS custom properties (design tokens)

### Typography
- Font: Caveat (Google Fonts) — casual handwriting feel
- Self-hosted (not loaded from Google Fonts CDN) for reliable card image export later
- Same font for everything — headings, body, buttons, labels. Full whimsical commitment
- Full type ramp: heading and body scales at multiple sizes

### Icon Style
- Pixel-art style — 8-bit/16-bit chunky, nostalgic aesthetic
- Monochrome — single color (periwinkle or dark), not multi-color
- Small set: 4-6 icons only (generate, download, regenerate, brand mark, maybe 1-2 decorative)
- Inline SVGs for styling control

### Kitchen Sink Screen
- Dev-only throwaway page — not reused as app layout
- Shows: buttons (primary coral, secondary periwinkle, disabled), text input field, full typography scale in Caveat, color swatch grid with labels
- All icons rendered at intended sizes
- Purpose: visual validation that everything works together before building features

### Claude's Discretion
- Exact hex values for the 6-8 color shades (within the periwinkle/blush cream/coral direction)
- Typography scale steps (how many sizes, exact rem values)
- Pixel-art icon source (custom SVGs or adapted from an existing pixel icon set)
- Kitchen sink page layout and organization
- CSS architecture (how tokens are structured)

</decisions>

<specifics>
## Specific Ideas

- The humor of the app comes from contrast: calm, cozy design + absurdly dramatic compliment text. The DLS should feel warm and inviting, not loud
- Pixel-art icons should feel "slightly retro techy" — not full arcade game, just a nostalgic nod
- User wants to see everything rendered together on the kitchen sink before approving — visual validation is the gate for this phase

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `font-preview.html` exists in project root — shows Caveat and other fonts rendered with the color palette. Can reference as visual baseline.

### Established Patterns
- None — greenfield project. This phase establishes all patterns.

### Integration Points
- Phase 2 (Card Component) will consume all DLS tokens directly
- Card image export (v2) depends on self-hosted fonts established here

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-design-language-system*
*Context gathered: 2026-03-13*

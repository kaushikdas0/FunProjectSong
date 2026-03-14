# Phase 5: Visual Polish - Research

**Researched:** 2026-03-14
**Domain:** CSS animations, prefers-reduced-motion, mobile responsive layout
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIZP-01 | Animated icon background — pixelarticons scattered behind the card with color fill and gentle border pulse | CSS @keyframes with transform/opacity only; icons already placed in MainScreen |
| VIZP-02 | Background respects prefers-reduced-motion (no animation if user prefers) | @media (prefers-reduced-motion: reduce) stops all keyframes; Tailwind motion-safe variant |
| VIZP-03 | Mobile-responsive single-column layout | Audit MainScreen flex column + max-w-sm constraints; verify on narrow viewport |
</phase_requirements>

---

## Summary

Phase 5 has two entirely independent concerns: (1) making the background icon layer feel alive via CSS keyframe animations, and (2) confirming the UI does not break on a phone-sized screen. Both are self-contained CSS/layout tasks — no new dependencies are needed.

The animated background already exists structurally. MainScreen renders ~20 `<span>` elements with `absolute` positioning and Tailwind `animate-[pulse_*]` classes. The current animation uses Tailwind's built-in `pulse` keyframe, which tweaks `opacity`. The requirement calls for a **border pulse** as well, which means a custom keyframe is needed. The cleanest approach is a single named keyframe defined in `tokens.css` (or `index.css`) and referenced via Tailwind's arbitrary animation syntax `animate-[icon-float_4s_ease-in-out_infinite]`.

The plan will extract the background icon layer from MainScreen into a dedicated `AnimatedIconBackground` component, define the new custom keyframe in the DLS CSS, and add the `prefers-reduced-motion` guard. The mobile pass is a viewport audit — no structural changes are expected, only minor padding/sizing tweaks if any element overflows at 375 px width.

**Primary recommendation:** Define one custom `@keyframes icon-float` in `tokens.css` (transform: scale + opacity variation), wrap the background span block in `AnimatedIconBackground`, add `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }` to the DLS, then do a real-device mobile audit.

---

## Standard Stack

### Core
| Library / Feature | Version | Purpose | Why Standard |
|-------------------|---------|---------|--------------|
| CSS `@keyframes` | Browser native | Define animation curves | No JS runtime cost; composited by GPU |
| `prefers-reduced-motion` CSS media query | Browser native | Disable motion for accessibility | W3C standard; required by WCAG 2.1 SC 2.3.3 |
| Tailwind v4 arbitrary animation | 4.2.1 (already installed) | Apply custom keyframes via class | Consistent with project's CSS-only config |
| pixelarticons/react | 2.0.2 (already installed) | Icon SVGs | Already used throughout project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No new libraries needed | — | — | All requirements are achievable with existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS @keyframes | Framer Motion / react-spring | No justification for a runtime animation library; pure CSS is lighter, GPU-composited, and zero JS |
| Single global `* { animation: none }` | Per-element `motion-safe:` Tailwind variant | Global suppression is simpler and more robust; per-element is preferred only when some animations should survive reduced-motion |

**Installation:**
No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

No new directories needed. One new component file:

```
src/
├── components/
│   └── AnimatedIconBackground/
│       └── AnimatedIconBackground.tsx   # extracted from MainScreen
├── dls/
│   └── tokens.css                       # add @keyframes icon-float here
└── screens/
    └── MainScreen.tsx                   # imports AnimatedIconBackground
```

### Pattern 1: Extract AnimatedIconBackground Component

**What:** Move the `<div className="absolute inset-0 pointer-events-none">` block from MainScreen into its own component. The component renders nothing interactive — it is pure decoration.

**When to use:** Any time a visual sub-tree has no state or event handling and would otherwise bloat the parent component.

**Example:**
```tsx
// src/components/AnimatedIconBackground/AnimatedIconBackground.tsx
import { Icon } from '../Icon/Icon';

export function AnimatedIconBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* icon spans — same positions as today, updated animation class */}
      <span className="absolute top-[4%] left-[8%] rotate-12 text-coral-500 animate-[icon-float_4s_ease-in-out_0s_infinite]" style={{ opacity: 0.3 }}>
        <Icon name="decorative" size={48} />
      </span>
      {/* …remaining spans… */}
    </div>
  );
}
```

### Pattern 2: Custom CSS Keyframe in DLS tokens.css

**What:** Define `@keyframes icon-float` in `tokens.css` (inside or adjacent to the `@theme` block). Tailwind v4 CSS-only config means no `tailwind.config.js` — custom keyframes go directly in CSS.

**When to use:** Whenever a project-specific animation is needed that Tailwind's built-in set doesn't cover.

**Example:**
```css
/* In src/dls/tokens.css — add after @theme block */

@keyframes icon-float {
  0%, 100% {
    transform: scale(1);
    opacity: var(--icon-opacity, 0.22);
  }
  50% {
    transform: scale(1.08);
    opacity: calc(var(--icon-opacity, 0.22) * 1.4);
  }
}
```

Tailwind applies it via: `animate-[icon-float_5s_ease-in-out_0s_infinite]`

> Note on "border pulse": the requirement says "color fill and border pulse". The icons are SVG fills controlled by `currentColor` — there is no border on the icon elements themselves. The most natural interpretation is an opacity/scale pulse that makes the icon appear to breathe. If a literal border is desired, add `outline` or `box-shadow` to the span and animate its opacity in the same keyframe. The simpler approach (scale + opacity) is recommended unless design review says otherwise.

### Pattern 3: prefers-reduced-motion Guard

**What:** A single CSS media query that strips all animations for users who have enabled the OS "Reduce Motion" accessibility setting.

**When to use:** Any time CSS animations are used. Required for WCAG 2.1 SC 2.3.3 and VIZP-02.

**Example:**
```css
/* In src/dls/tokens.css or index.css */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Setting duration to `0.01ms` instead of `none` preserves JS `animationend` event listeners (if any) while making the animation visually instant/invisible. For this project, `animation: none !important` is also acceptable since no JS listens to animation events.

### Pattern 4: Mobile Layout — Audit Approach

**What:** The app already uses a flex-col layout with `max-w-sm` (384 px) constraints. The mobile pass verifies no element overflows on a 375 px (iPhone SE) or 390 px (iPhone 14) viewport.

**Known risk areas from reading MainScreen.tsx:**
- Input: `w-full max-w-sm` — should be fine
- Button: `w-full max-w-sm` — should be fine
- Card: `w-full max-w-[400px]` — 400 px card inside a 375 px viewport needs verification; the parent has `px-4` (16 px each side = 343 px available), so the card will shrink via `w-full`
- Background icons with `left-[25%]` and `right-[25%]` positions — absolute positioning can cause scroll width issues if they overflow the `overflow-hidden` parent

**Verification method:** Browser DevTools device emulation at 375 px width, then rotate to landscape.

### Anti-Patterns to Avoid

- **Animating `width`, `height`, `top`, `left`, `margin`, `padding`:** These trigger layout recalculation (reflow) on every frame. Only `transform` and `opacity` are GPU-composited.
- **Animating `background-color` or `color` on many elements:** Paint-triggering. Use opacity variation instead.
- **Using `position: fixed` for background elements:** Can cause Safari iOS scroll bugs. `position: absolute` inside `overflow-hidden` is correct.
- **Forgetting `will-change: transform` on heavily animated elements:** Adding it can help the browser promote the layer to GPU, though for subtle opacity/scale animations on many icons it may increase memory consumption. Omit unless jank is observed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced motion detection in JS | Custom React hook that reads `window.matchMedia` | Pure CSS `@media (prefers-reduced-motion: reduce)` | CSS solution works before JS loads, survives SSR, zero code |
| Animation scheduler | JS-based timing loop | CSS `animation-delay` per span | Browser schedules animations natively, no JS overhead |
| Icon scatter math | Algorithm to compute positions | Hardcoded `top-[]` / `left-[]` arbitrary values | Positions are already written in MainScreen; they only need a class update |

**Key insight:** Every VIZP requirement is achievable with CSS alone. Adding any JS-based animation library would be over-engineering for this scope.

---

## Common Pitfalls

### Pitfall 1: Animating Paint-Triggering CSS Properties
**What goes wrong:** Using `opacity` via Tailwind's built-in `pulse` (which does animate opacity) is fine, but if someone adds `background`, `color`, `border-color`, or `box-shadow` to the keyframe, browsers repaint every frame causing jank.
**Why it happens:** `box-shadow` looks like a "visual only" property but is actually painted by the CPU.
**How to avoid:** Keyframe body must only contain `transform` and/or `opacity`. To simulate a glowing border, use `box-shadow` as a static style and animate its opacity via a wrapping element's `opacity`.
**Warning signs:** Chrome DevTools Performance panel shows "Paint" or "Layout" in the flame graph during animation.

### Pitfall 2: `overflow-hidden` on Main Container Clipping Content on iOS Safari
**What goes wrong:** Safari iOS sometimes interprets `overflow: hidden` differently when combined with `position: fixed` children or `100vh` height, causing the page to be unscrollable or content to be clipped.
**Why it happens:** Safari's dynamic toolbar affects `100vh`.
**How to avoid:** The current layout uses `min-h-screen` (not fixed height) and `overflow-hidden`. This is generally fine, but if content extends below the fold on small phones, the `overflow-hidden` on the outer div will clip it. Verify that the outer container does NOT have `overflow-hidden` when content must scroll.
**Warning signs:** Content truncated at viewport bottom on iPhone with no scrollbar.

### Pitfall 3: Absolute-Positioned Icons Causing Horizontal Scroll
**What goes wrong:** Icons placed at `right-[35%]` or similar percentage positions might still extend beyond the viewport if their width is 48 px and the element they're in is narrower than expected.
**Why it happens:** `inset-0` on the background div should constrain them, but if the parent is wider than the viewport, icons can escape.
**How to avoid:** Ensure the outermost container has `overflow-hidden` AND `relative`. MainScreen already does this (`overflow-hidden` on the root div). Verify in mobile view that no horizontal scroll bar appears.
**Warning signs:** Body has horizontal scroll; `document.body.scrollWidth > window.innerWidth`.

### Pitfall 4: Tailwind v4 Arbitrary Animation Requires Keyframe Defined in CSS
**What goes wrong:** Writing `animate-[icon-float_4s_ease-in-out_infinite]` in a class attribute but forgetting to define `@keyframes icon-float` in any CSS file results in no animation (silently ignored).
**Why it happens:** Unlike Tailwind v3's `theme.extend.keyframes`, Tailwind v4 does not auto-generate keyframes from config — they must be plain CSS.
**How to avoid:** Define `@keyframes icon-float { ... }` in `tokens.css` or `index.css` before using the arbitrary animation class.
**Warning signs:** Element has the class but DevTools shows `animation-name: icon-float` with no matching keyframe rule.

---

## Code Examples

Verified patterns for this project:

### Defining a Custom Keyframe in Tailwind v4 CSS-only Config
```css
/* src/dls/tokens.css — after the @theme block */

@keyframes icon-float {
  0%, 100% {
    transform: scale(1) rotate(var(--tw-rotate, 0deg));
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1) rotate(var(--tw-rotate, 0deg));
    opacity: 0.35;
  }
}
```

Using it in JSX via Tailwind arbitrary animation:
```tsx
<span className="absolute top-[4%] left-[8%] rotate-12 text-coral-500 animate-[icon-float_4s_ease-in-out_0s_infinite]">
  <Icon name="decorative" size={48} />
</span>
```

### prefers-reduced-motion Global Guard
```css
/* src/dls/tokens.css — append at end of file */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Testing prefers-reduced-motion in jsdom (Vitest)
```tsx
// jsdom does not support @media queries natively,
// so use matchMedia mock to test component behavior
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});
```

> Note: The `prefers-reduced-motion` requirement is CSS-only — no JS behavior changes. The component renders identically either way; the CSS media query removes the animation. Testing the component's rendered output in jsdom is not the right verification target. Correct verification is: (1) the `@media` rule exists in CSS (code review / snapshot), and (2) real-device or DevTools emulation confirms icons stop moving.

### AnimatedIconBackground — Component Shell
```tsx
// src/components/AnimatedIconBackground/AnimatedIconBackground.tsx
import { Icon } from '../Icon/Icon';

export function AnimatedIconBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* positions from existing MainScreen — update animate-[] class name */}
    </div>
  );
}
```

MainScreen usage:
```tsx
import { AnimatedIconBackground } from '../components/AnimatedIconBackground/AnimatedIconBackground';

// inside the return, before main content:
<AnimatedIconBackground />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS-based animation (GSAP, react-spring) for decorative elements | Pure CSS @keyframes with transform/opacity | Browsers gained GPU compositing (circa 2015, now standard) | Zero JS cost, no hydration delay, simpler code |
| `prefers-reduced-motion` as opt-in | `prefers-reduced-motion` as default accessibility requirement | WCAG 2.1 (2018) | Must be implemented, not optional |
| Tailwind v3 `theme.extend.keyframes` in config | Tailwind v4 `@keyframes` directly in CSS | Tailwind v4 (2024) | No JS config file; keyframes are plain CSS |

**Deprecated/outdated:**
- Tailwind `theme.extend.keyframes` in `tailwind.config.js`: Not applicable in this project (Tailwind v4 CSS-only). Keyframes must be defined directly in CSS files.

---

## Open Questions

1. **"Border pulse" exact interpretation**
   - What we know: The requirement says "color fill and gentle border pulse". Icons are SVGs with `fill=currentColor` — they have no CSS border.
   - What's unclear: Does "border pulse" mean a literal CSS border/outline on the span that pulses? Or does it mean the icon's visual edge appears to pulse (achievable via scale + opacity)?
   - Recommendation: Implement scale + opacity pulse (the visually cleanest approach) and present to the user during human-verify. If they want a literal border ring around icons, add `ring-1` or `outline` to the span and include its opacity in the keyframe.

2. **Mobile overflow at 375 px with 400 px max-width card**
   - What we know: ComplimentCard has `max-w-[400px]` and MainScreen has `px-4` on the outer container.
   - What's unclear: Whether 400 px max-width card overflows on a 375 px device. The card also has `w-full` so it should shrink, but the padding wrapper `p-[10px]` adds 20 px, meaning the inner card needs 360 px minimum.
   - Recommendation: Verify with DevTools at 375 px before declaring VIZP-03 complete. If overflow occurs, change `max-w-[400px]` to `max-w-sm` (384 px) or `w-full`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIZP-01 | AnimatedIconBackground renders behind card | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 (new component needs smoke test) |
| VIZP-02 | prefers-reduced-motion: CSS rule exists | manual-only | — (CSS media query; jsdom cannot evaluate @media) | N/A |
| VIZP-03 | No layout overflow at 375 px viewport | manual-only | — (requires real browser or Playwright) | N/A |

**VIZP-02 and VIZP-03 are manual-only.** jsdom does not process CSS files or evaluate media queries, so automated tests cannot verify them. Verification happens in the browser during human-verify.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + manual browser check before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/AnimatedIconBackground/AnimatedIconBackground.test.tsx` — smoke test: component renders without crashing, `aria-hidden="true"` is present on the wrapper

*(Existing 28-test suite in MainScreen.test.tsx covers the rest of the app — no gaps there)*

---

## Sources

### Primary (HIGH confidence)
- MDN Web Docs: `prefers-reduced-motion` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- MDN Web Docs: CSS @keyframes — https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
- MDN Web Docs: CSS animation performance (transform/opacity compositing) — https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance
- Tailwind CSS v4 docs: arbitrary values in animation utilities — https://tailwindcss.com/docs/animation
- WCAG 2.1 SC 2.3.3 (Animation from Interactions) — https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html

### Secondary (MEDIUM confidence)
- Project source (verified by direct code read): MainScreen.tsx already has ~20 positioned icon spans with `animate-[pulse_*]` Tailwind classes; extracting to a component is a refactor, not a feature build
- Project source: tokens.css uses `@theme` block (Tailwind v4 CSS-only config) — custom keyframes must be defined as raw CSS, not in any config file

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; existing stack fully verified in project
- Architecture: HIGH — patterns are direct extractions from existing code; custom keyframe approach is standard CSS
- Pitfalls: HIGH — all pitfalls are from direct code inspection + well-documented browser behavior
- Mobile layout: MEDIUM — overflow risk identified from code reading, but actual behavior requires browser verification

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable CSS standards; Tailwind v4 API unlikely to change)

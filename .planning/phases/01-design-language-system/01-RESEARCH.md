# Phase 1: Design Language System - Research

**Researched:** 2026-03-13
**Domain:** CSS design tokens, self-hosted typography, pixel-art SVG icons, kitchen sink validation (React + Tailwind v4 + Vite)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Color Palette**
- Periwinkle blue (#9EB1CF range) as the primary blue
- Blush cream with pink undertone (#FFF0EC range) as background/base
- Soft coral/peach as accent color (buttons, CTAs, highlights)
- Standard palette size: 6-8 shades (light/medium/dark variants of blue and cream, plus accent and text colors)
- All colors defined as CSS custom properties (design tokens)

**Typography**
- Font: Caveat (Google Fonts) — casual handwriting feel
- Self-hosted (not loaded from Google Fonts CDN) for reliable card image export later
- Same font for everything — headings, body, buttons, labels. Full whimsical commitment
- Full type ramp: heading and body scales at multiple sizes

**Icon Style**
- Pixel-art style — 8-bit/16-bit chunky, nostalgic aesthetic
- Monochrome — single color (periwinkle or dark), not multi-color
- Small set: 4-6 icons only (generate, download, regenerate, brand mark, maybe 1-2 decorative)
- Inline SVGs for styling control

**Kitchen Sink Screen**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DLS-01 | Color token system with soft blues + cream palette as CSS custom properties | Tailwind v4 `@theme` directive generates both utility classes and CSS custom properties simultaneously from a single token definition |
| DLS-02 | Typography system with handwritten/whimsical font (self-hosted) and heading/body scales | `@fontsource/caveat` is an npm package that self-hosts Caveat as woff2 files bundled by Vite — no CDN, no CORS risk, document.fonts.ready compatible |
| DLS-03 | Slightly retro techy icon set as inline SVGs | `pixelarticons` npm package: 800+ pixel-art icons, React components, `fill="currentColor"`, drawn on 24x24 grid — or hand-craft 4-6 custom SVGs for precise control |
| DLS-04 | Kitchen sink validation screen showing all DLS components together | Dev-only React route at `/kitchen-sink`; conditionally mounted based on `import.meta.env.DEV`; renders all tokens, all icon variants, full type ramp |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield project setup phase combined with DLS construction. The project has no scaffolded React app yet, so the first task is running `npm create vite@latest` with the react-ts template. Everything else builds on that foundation.

The chosen stack (Tailwind CSS v4, Vite, React 19, TypeScript) is ideally suited to a CSS token-first design system. Tailwind v4's `@theme` directive is the correct tool: a single block of color/font/radius declarations generates both Tailwind utility classes (`bg-blue-500`, `text-caveat`) and native CSS custom properties (`var(--color-blue-500)`) simultaneously. This means the DLS tokens are available everywhere — Tailwind utilities, custom CSS, inline styles, and critically, inside `html-to-image` DOM capture for card export in Phase 2.

For Caveat self-hosting, `@fontsource/caveat` is the correct solution. It packages the font files as npm assets, Vite bundles them as static files, and the font is served from the same origin with no CDN dependency. This eliminates the CORS tainted canvas risk (identified as a critical pitfall in prior research) and ensures `document.fonts.ready` works reliably at card export time.

**Primary recommendation:** Use Tailwind v4 `@theme` for all color/typography tokens, `@fontsource/caveat` for self-hosted font, `pixelarticons` for pixel-art SVG icons (with `fill="currentColor"` for token-controlled color), and a dev-only React route (`import.meta.env.DEV`) for the kitchen sink screen.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 8.0.0 | Build tool + dev server + static asset bundling | First-class Tailwind v4 plugin, fast HMR, bundles font files automatically |
| React | 19.x | UI framework | Project constraint; React components for kitchen sink screen |
| TypeScript | 5.x | Type safety | Vite scaffolds it; catches token naming errors |
| Tailwind CSS | 4.2.1 | CSS token system + utility classes | v4 `@theme` is the DLS token architecture — generates CSS custom properties and utility classes from one source |
| @tailwindcss/vite | 4.x | Tailwind v4 Vite plugin | Required for v4 (replaces PostCSS config); single plugin entry in vite.config.ts |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource/caveat | latest | Self-hosted Caveat font, woff2, weights 400/500/600/700 | Required for DLS-02; eliminates CDN dependency and CORS risk |
| pixelarticons | latest | 800+ pixel-art icons as React components with `fill="currentColor"` | Use for DLS-03 if hand-crafting 4-6 custom SVGs is not preferred; exact pixel-art aesthetic, monochrome-capable |
| react-router-dom | 7.x | Client-side routing | Needed to mount kitchen sink at `/kitchen-sink` as a dev-only route |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @fontsource/caveat | Manual woff2 download + public/fonts/ | Fontsource handles font-display, unicode-range, and build integration automatically; manual approach is more work for same result |
| pixelarticons | Hand-crafted custom SVGs | Custom SVGs give pixel-perfect control over exactly the 4-6 icons needed; pixelarticons is faster but ships 800 icons you won't use |
| Tailwind v4 @theme | CSS Modules + :root variables | @theme generates Tailwind utility classes from the same definitions — one source of truth instead of parallel token files |
| react-router-dom | Conditional render in App.tsx | Router approach is cleaner and makes the kitchen sink a real navigable route for visual review |

**Installation (greenfield — run in project root):**
```bash
# Step 1: Scaffold the project
npm create vite@latest egoboost-3000 -- --template react-ts
cd egoboost-3000

# Step 2: Core dependencies
npm install tailwindcss @tailwindcss/vite

# Step 3: DLS dependencies
npm install @fontsource/caveat
npm install pixelarticons

# Step 4: Routing for kitchen sink
npm install react-router-dom

# Step 5: Firebase (needed now to set up project structure)
npm install firebase
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── dls/
│   ├── tokens.css          # @theme block: all color, font, radius, spacing tokens
│   ├── typography.css      # @font-face (via @fontsource import) + type scale classes
│   └── index.css           # Single entry: @import "tailwindcss"; imports tokens + typography
│
├── components/
│   ├── Button/
│   │   ├── Button.tsx      # Primary, secondary, disabled variants
│   │   └── Button.css      # Token-driven styles
│   ├── TextInput/
│   │   ├── TextInput.tsx
│   │   └── TextInput.css
│   └── Icon/
│       └── Icon.tsx        # Thin wrapper around pixelarticons with token-controlled color
│
├── screens/
│   ├── KitchenSinkScreen.tsx   # Dev-only; renders all DLS elements together
│   └── MainScreen.tsx          # Placeholder for Phase 2
│
├── App.tsx                 # Router: / → MainScreen, /kitchen-sink → KitchenSinkScreen (DEV only)
└── main.tsx                # Entry; imports dls/index.css
```

### Pattern 1: Tailwind v4 @theme Token Block

**What:** All design tokens (colors, fonts, radii, spacing) defined in a single `@theme` block in CSS. Tailwind generates utility classes AND CSS custom properties from the same definitions.

**When to use:** The single source of truth for all visual tokens. Any color/spacing/font used anywhere in the app must be defined here first.

**Example:**
```css
/* src/dls/tokens.css */
/* Source: https://tailwindcss.com/docs/theme */

@theme {
  /* Colors — periwinkle blue family */
  --color-blue-100: #EEF2F8;
  --color-blue-300: #BFD0E8;
  --color-blue-500: #9EB1CF;   /* primary periwinkle — matches font-preview.html */
  --color-blue-700: #6B8AB5;
  --color-blue-900: #3D5A8A;

  /* Colors — cream/blush family */
  --color-cream-50:  #FFFAF8;
  --color-cream-100: #FFF5F1;
  --color-cream-300: #FFF0EC;  /* primary background — matches font-preview.html */
  --color-cream-500: #F5E6E0;

  /* Colors — coral accent (buttons, CTAs) */
  --color-coral-400: #F0A898;
  --color-coral-500: #E8A598;  /* primary coral — matches font-preview.html button */
  --color-coral-600: #D98A7A;

  /* Colors — text */
  --color-text-primary: #5A4A6F;   /* dark purple-grey — legible on cream */
  --color-text-secondary: #8B7BA3;
  --color-text-muted: #A99BBF;

  /* Typography */
  --font-caveat: 'Caveat', cursive;

  /* Border radius */
  --radius-card: 20px;
  --radius-button: 12px;
  --radius-input: 10px;
}
```

```css
/* src/dls/index.css */
@import "tailwindcss";
@import "./tokens.css";
@import "./typography.css";
```

**Result:** Tailwind generates `bg-blue-500`, `text-coral-500`, `font-caveat` etc. AND CSS custom properties `var(--color-blue-500)`, `var(--font-caveat)` are available globally.

### Pattern 2: @fontsource/caveat Self-Hosting

**What:** Import the font package in the app entry point. Vite bundles the woff2 files as static assets served from the same origin. No CDN, no CORS risk.

**When to use:** Always — this is the DLS-02 requirement and eliminates the card export font fallback pitfall.

**Example:**
```typescript
// src/main.tsx
import '@fontsource/caveat/400.css';   // Regular
import '@fontsource/caveat/700.css';   // Bold
import './dls/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

```css
/* src/dls/typography.css */
/* Type scale using Caveat — all sizes, all contexts */

.text-display {
  font-family: var(--font-caveat);
  font-size: 3rem;        /* 48px */
  font-weight: 700;
  line-height: 1.2;
}

.text-heading-xl {
  font-family: var(--font-caveat);
  font-size: 2.25rem;     /* 36px */
  font-weight: 700;
  line-height: 1.3;
}

.text-heading-lg {
  font-family: var(--font-caveat);
  font-size: 1.875rem;    /* 30px */
  font-weight: 600;
  line-height: 1.3;
}

.text-heading-md {
  font-family: var(--font-caveat);
  font-size: 1.5rem;      /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

.text-body-lg {
  font-family: var(--font-caveat);
  font-size: 1.25rem;     /* 20px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body {
  font-family: var(--font-caveat);
  font-size: 1.125rem;    /* 18px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {
  font-family: var(--font-caveat);
  font-size: 1rem;        /* 16px */
  font-weight: 400;
  line-height: 1.6;
}

.text-label {
  font-family: var(--font-caveat);
  font-size: 0.875rem;    /* 14px */
  font-weight: 400;
  line-height: 1.5;
}
```

**Note on Caveat minimum legible size:** Caveat is a handwriting font. Below 14px (0.875rem) it becomes difficult to read. The type ramp bottoms out at `.text-label` (14px). Do not use Caveat below this.

### Pattern 3: Pixel-Art Icons with fill="currentColor"

**What:** Use `pixelarticons` React components with color controlled by Tailwind utility classes. Icons inherit the color of their CSS context — no hardcoded fill colors.

**When to use:** Every icon in the app. Never set a fill color directly on the SVG; always use CSS `color` property so icons respond to token changes.

**Example:**
```tsx
/* src/components/Icon/Icon.tsx */
/* Source: https://github.com/halfmage/pixelarticons */
import { Refresh, Download, Plus } from 'pixelarticons/react';

type IconName = 'generate' | 'download' | 'regenerate';

const iconMap = {
  generate: Plus,
  download: Download,
  regenerate: Refresh,
} as const;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className = '' }: IconProps) {
  const Component = iconMap[name];
  return <Component width={size} height={size} className={className} />;
}

/* Usage — color controlled entirely by Tailwind token class */
<Icon name="generate" className="text-blue-500" />
<Icon name="download" className="text-coral-500" />
```

**Pixel-art rendering sharpness:** Pixelarticons are drawn on a 24×24 grid. Render at multiples of 24 (24, 48, 72) for pixel-perfect sharpness. At non-multiples, SVG anti-aliasing may blur the pixel edges slightly — acceptable for web, avoid if strict pixel-art look is required.

### Pattern 4: Dev-Only Kitchen Sink Route

**What:** A React route that only mounts in development builds. Uses `import.meta.env.DEV` (Vite's built-in) to prevent the route from appearing in production bundles.

**When to use:** The kitchen sink screen is a dev tool, not a feature. It should be unreachable in production.

**Example:**
```tsx
/* src/App.tsx */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainScreen from './screens/MainScreen';

// Lazy-import kitchen sink — tree-shaken from production build
const KitchenSinkScreen = import.meta.env.DEV
  ? React.lazy(() => import('./screens/KitchenSinkScreen'))
  : null;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        {import.meta.env.DEV && KitchenSinkScreen && (
          <Route
            path="/kitchen-sink"
            element={
              <React.Suspense fallback={null}>
                <KitchenSinkScreen />
              </React.Suspense>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}
```

### Anti-Patterns to Avoid

- **Raw hex values in component files:** Any `#9EB1CF` appearing outside `tokens.css` is a violation. Components reference only `var(--color-*)` or Tailwind token classes.
- **Loading Caveat from Google Fonts CDN:** The `<link href="https://fonts.googleapis.com/...">` approach is explicitly rejected. It creates CORS risk for card export and a CDN dependency. Use `@fontsource/caveat` only.
- **Hardcoded icon fill colors:** Never `<svg fill="#9EB1CF">`. Icons use `fill="currentColor"` and get their color from CSS `color` property. This ensures icons respond to DLS token changes without touching SVG files.
- **Tailwind v3 config file:** Do not create `tailwind.config.js`. Tailwind v4 uses only the CSS `@theme` block. Creating a v3 config file will conflict.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosting Caveat font files | Download woff2 files manually, write @font-face declarations, manage font-display | `@fontsource/caveat` npm package | Fontsource handles font-display: swap, unicode-range subsetting, weight variants, and Vite asset bundling automatically |
| CSS custom properties from token definitions | Maintain parallel `:root { --color: ... }` block AND `@theme` block | Tailwind v4 `@theme` only | v4 @theme generates BOTH Tailwind utilities AND CSS custom properties from one definition — two outputs, one source |
| Pixel-art icon SVGs from scratch | Hand-draw SVG paths on pixel grid for each icon | `pixelarticons` React components | 800 icons already drawn on 24×24 grid, React-ready, `fill="currentColor"`, TypeScript types |
| Dev/prod route guarding | Custom environment middleware, route guards, separate entry points | `import.meta.env.DEV` + React lazy import | Vite's built-in env flag tree-shakes dev-only code from production bundles automatically |

**Key insight:** Tailwind v4's `@theme` is designed to be the DLS token layer. Using it correctly means zero token duplication across the entire codebase.

---

## Common Pitfalls

### Pitfall 1: Caveat renders correctly in browser but falls back to system font in card export

**What goes wrong:** The handwritten font renders beautifully on screen but the downloaded card image shows Arial or system-ui. Users immediately notice.

**Why it happens:** `html-to-image` (used in Phase 2) clones the DOM and repaints it. If the font hasn't been fully loaded into the browser's font registry when capture runs, the canvas uses a fallback silently — no error thrown. This is a Phase 2 runtime issue, but it is **prevented in Phase 1** by using `@fontsource/caveat` instead of a CDN link.

**How to avoid (Phase 1 role):** Self-host via `@fontsource/caveat`. The font is bundled by Vite as a same-origin asset. This ensures the browser loads it as part of the app bundle, making it available to `document.fonts.ready` in Phase 2.

**Warning signs:** If `font-preview.html` at the project root still uses `<link href="https://fonts.googleapis.com/...">` — that's fine for the preview file, but the React app must NEVER use that approach.

### Pitfall 2: Tailwind v3 and v4 config mixed

**What goes wrong:** A `tailwind.config.js` file is created alongside the v4 setup. Tailwind v4 ignores it silently in some cases, or conflicts cause utility classes to not generate.

**Why it happens:** Muscle memory from v3 projects. Scaffolding guides often still show the v3 config approach.

**How to avoid:** No `tailwind.config.js` file. No `tailwind.config.ts`. All configuration lives in the CSS `@theme` block. The only Tailwind config is in `vite.config.ts` (add the plugin) and `src/dls/index.css` (the `@theme` block).

**Warning signs:** `tailwind.config.*` file exists in the project root.

### Pitfall 3: Color tokens defined outside @theme don't generate utility classes

**What goes wrong:** Colors are defined as regular CSS custom properties in `:root { --color-blue-500: ... }` instead of inside `@theme`. The variables work in custom CSS but Tailwind doesn't generate `bg-blue-500`, `text-blue-500` utilities.

**Why it happens:** The distinction between `@theme` (Tailwind token registration) and `:root` (plain CSS variable) is not obvious from v3 mental models.

**How to avoid:** All DLS tokens go inside `@theme`. Use `:root` only for CSS variables that explicitly should NOT have Tailwind utility classes (very rare in this project).

### Pitfall 4: Kitchen sink screen leaks into production build

**What goes wrong:** The kitchen sink route is accessible at `/kitchen-sink` in production. Not a security issue, but adds bundle weight and exposes an unfinished-looking screen to real users.

**Why it happens:** Environment guarding is forgotten or misconfigured.

**How to avoid:** Use `import.meta.env.DEV` for both the conditional import and the route registration. Use `React.lazy()` so the module is code-split — even if the guard fails, the chunk won't be loaded unless navigated to.

### Pitfall 5: Pixel-art icons rendered at non-grid-aligned sizes look blurry

**What goes wrong:** Pixelarticons look slightly blurry or anti-aliased when rendered at sizes like 20px, 32px (non-multiples of 24).

**Why it happens:** The icons are drawn on a 24×24 pixel grid. SVG scaling to non-multiples causes sub-pixel rendering.

**How to avoid:** Render pixelarticons at 24px, 48px, or 72px. If a different size is required, consider hand-crafting custom SVGs at the needed grid size (16×16 for small, 32×32 for medium) or use `image-rendering: pixelated` CSS to preserve sharp edges.

---

## Code Examples

### Complete @theme token block with project palette

```css
/* src/dls/tokens.css */
/* Source: https://tailwindcss.com/docs/theme */

@theme {
  /* === Color System === */

  /* Primary blue (periwinkle) — from font-preview.html: #9EB1CF */
  --color-blue-50:  #F3F6FB;
  --color-blue-100: #E6EDF6;
  --color-blue-200: #CCDAED;
  --color-blue-300: #B3C8E4;
  --color-blue-400: #9EB1CF;  /* primary brand periwinkle */
  --color-blue-500: #7A97BE;
  --color-blue-600: #5B7CAC;
  --color-blue-700: #3D5A8A;

  /* Background/base (blush cream) — from font-preview.html: #FFF0EC */
  --color-cream-50:  #FFFCFA;
  --color-cream-100: #FFF8F5;
  --color-cream-200: #FFF4EF;
  --color-cream-300: #FFF0EC;  /* primary background */
  --color-cream-400: #F8E8E2;
  --color-cream-500: #F0DDD6;

  /* Accent coral (buttons, CTAs) — from font-preview.html: #E8A598 */
  --color-coral-300: #F5C4BA;
  --color-coral-400: #EEB4A8;
  --color-coral-500: #E8A598;  /* primary CTA coral */
  --color-coral-600: #D98A7A;
  --color-coral-700: #C06E5E;

  /* Text colors — from font-preview.html: #5A4A6F primary */
  --color-text-primary:   #5A4A6F;
  --color-text-secondary: #8B7BA3;
  --color-text-muted:     #A99BBF;
  --color-text-light:     #C4A8B0;

  /* === Typography === */
  --font-caveat: 'Caveat', cursive;

  /* === Border Radii === */
  --radius-card:   20px;
  --radius-button: 12px;
  --radius-input:  10px;
  --radius-swatch:  8px;

  /* === Spacing (DLS-specific additions) === */
  --spacing-card-pad-x: 36px;
  --spacing-card-pad-y: 40px;
}
```

### Fontsource Caveat import

```typescript
// src/main.tsx — weights used by the type ramp
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import './dls/index.css';
```

### Tailwind v4 Vite plugin config

```typescript
// vite.config.ts
// Source: https://tailwindcss.com/docs/installation/vite
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // replaces PostCSS config entirely
  ],
});
```

### Kitchen sink screen structure

```tsx
// src/screens/KitchenSinkScreen.tsx
// Dev-only — not imported in production

export default function KitchenSinkScreen() {
  return (
    <div className="min-h-screen bg-cream-300 p-10">
      <h1 className="text-display text-text-primary mb-8">
        EgoBoost 3000 — Kitchen Sink
      </h1>

      {/* Color swatches */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-4">Colors</h2>
        <div className="flex gap-3 flex-wrap">
          {/* One swatch per token */}
          <div className="w-16 h-16 rounded-swatch bg-blue-400" title="blue-400 #9EB1CF" />
          <div className="w-16 h-16 rounded-swatch bg-coral-500" title="coral-500 #E8A598" />
          <div className="w-16 h-16 rounded-swatch bg-cream-300 border border-blue-200" title="cream-300 #FFF0EC" />
          {/* ... all token swatches */}
        </div>
      </section>

      {/* Typography scale */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-4">Typography (Caveat)</h2>
        <p className="text-display text-text-primary">Display / 48px</p>
        <p className="text-heading-xl text-text-primary">Heading XL / 36px</p>
        <p className="text-heading-lg text-text-primary">Heading LG / 30px</p>
        <p className="text-heading-md text-text-primary">Heading MD / 24px</p>
        <p className="text-body-lg text-text-primary">Body LG / 20px</p>
        <p className="text-body text-text-primary">Body / 18px — main compliment text size</p>
        <p className="text-body-sm text-text-primary">Body SM / 16px</p>
        <p className="text-label text-text-muted">Label / 14px — minimum legible size</p>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-4">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-coral-500 text-white font-caveat text-body-sm
                             px-7 py-3 rounded-button hover:bg-coral-600 transition-colors">
            Primary — Generate
          </button>
          <button className="bg-blue-400 text-white font-caveat text-body-sm
                             px-7 py-3 rounded-button hover:bg-blue-500 transition-colors">
            Secondary — Download
          </button>
          <button className="bg-cream-500 text-text-muted font-caveat text-body-sm
                             px-7 py-3 rounded-button cursor-not-allowed" disabled>
            Disabled
          </button>
        </div>
      </section>

      {/* Text input */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-4">Text Input</h2>
        <input
          type="text"
          placeholder="Your name..."
          className="bg-white border border-blue-200 text-text-primary
                     font-caveat text-body rounded-input px-4 py-3 w-64
                     focus:outline-none focus:border-blue-400"
        />
      </section>

      {/* Icons */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-4">Icons (pixel-art)</h2>
        <div className="flex gap-6 items-center">
          <Icon name="generate"   size={24} className="text-blue-400" />
          <Icon name="download"   size={24} className="text-coral-500" />
          <Icon name="regenerate" size={24} className="text-text-secondary" />
          {/* 48px variants */}
          <Icon name="generate"   size={48} className="text-blue-400" />
          <Icon name="download"   size={48} className="text-coral-500" />
        </div>
      </section>
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `theme.extend.colors` | `@theme` block in CSS with `--color-*` variables | Tailwind v4.0 (Jan 2025) | One source of truth generates both utilities and CSS custom properties |
| Google Fonts `<link>` in `index.html` | `@fontsource/*` npm packages | Mainstream by 2024 | Fonts bundled by Vite, same-origin, no CDN dependency, safe for canvas capture |
| Tailwind PostCSS config | `@tailwindcss/vite` plugin | Tailwind v4.0 | Zero config file needed; plugin handles everything |
| lucide-react for "slightly retro" look | `pixelarticons` for true pixel-art | Ongoing | Pixelarticons are specifically pixel-art drawn on strict grid; lucide-react is modern vector icons |
| `html2canvas` | `html-to-image` | 2023-2024 ecosystem shift | html-to-image has better custom font handling and active maintenance |

**Deprecated/outdated for this project:**
- `tailwind.config.js` / `tailwind.config.ts`: Not needed in v4; will conflict if created
- Google Fonts CDN link for Caveat: Rejected (CORS canvas taint risk, CDN dependency)
- `lucide-react` for this project's icon need: Wrong aesthetic (modern vector, not pixel-art)

---

## Open Questions

1. **Custom SVGs vs pixelarticons for brand mark icon**
   - What we know: pixelarticons has no specific "EgoBoost 3000" brand mark icon
   - What's unclear: Whether a generic pixelarticons icon (Star, Heart, Zap) satisfies the "brand mark" need, or whether a custom SVG is required
   - Recommendation: Plan should include a task to decide brand mark icon. Start with pixelarticons for the 4 functional icons (generate, download, regenerate, decorative); hand-craft the brand mark SVG if nothing fits.

2. **OKLCH vs hex for color token values**
   - What we know: Tailwind v4 uses OKLCH internally for its default palette; hex values also work in `@theme`; the color decisions reference specific hex ranges (#9EB1CF, #FFF0EC, #E8A598)
   - What's unclear: Whether OKLCH provides any visual benefit for this specific palette
   - Recommendation: Use hex values in `@theme` to match the established palette from `font-preview.html`. OKLCH adds complexity for no visible gain when specific hex targets are already decided.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — greenfield project; Wave 0 must scaffold |
| Config file | `vitest.config.ts` (to be created) or via `vite.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DLS-01 | CSS custom properties for all color tokens are present in compiled output | smoke | Check that `--color-blue-400` exists in rendered DOM styles | ❌ Wave 0 |
| DLS-02 | Caveat font loads from same origin (no googleapis.com requests) | smoke/manual | `document.fonts.check('1em Caveat')` returns true after load | ❌ Wave 0 |
| DLS-03 | Icons render at intended sizes with correct token color applied | manual visual | Kitchen sink screen visual inspection at `/kitchen-sink` | ❌ Wave 0 |
| DLS-04 | Kitchen sink screen accessible at `/kitchen-sink` in dev; not in prod | smoke | `GET /kitchen-sink` returns 200 in dev mode; route absent in prod build | ❌ Wave 0 |

**Note on DLS-01 through DLS-04:** These requirements are primarily visual and structural. The primary validation mechanism is the kitchen sink screen itself — the user views it and approves. Automated tests are supplementary smoke tests.

### Sampling Rate

- **Per task commit:** Visual check of kitchen sink screen in browser (`npm run dev`, navigate to `/kitchen-sink`)
- **Per wave merge:** Full kitchen sink visual inspection — all sections render without fallbacks
- **Phase gate:** User approves kitchen sink screen before moving to Phase 2 (per CONTEXT.md: "visual validation is the gate for this phase")

### Wave 0 Gaps

- [ ] `src/` — entire React app to be scaffolded via `npm create vite@latest`
- [ ] `vitest` — install and configure if unit tests are desired; `npm install -D vitest @vitest/ui`
- [ ] `src/dls/tokens.css` — create @theme block
- [ ] `src/dls/typography.css` — create type scale classes
- [ ] `src/dls/index.css` — create entry point with @import statements
- [ ] Font install: `npm install @fontsource/caveat` — after scaffold
- [ ] Icon install: `npm install pixelarticons` — after scaffold
- [ ] Router install: `npm install react-router-dom` — after scaffold

---

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme docs](https://tailwindcss.com/docs/theme) — `@theme` directive, `--color-*` namespace, CSS custom property generation
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, Vite plugin, OKLCH palette
- [Fontsource Caveat install](https://fontsource.org/fonts/caveat/install) — weights 400/500/600/700, npm install command, CSS import syntax
- [Pixelarticons GitHub](https://github.com/halfmage/pixelarticons) — React component API, `fill="currentColor"`, 24×24 grid, npm package

### Secondary (MEDIUM confidence)
- [Google Webfonts Helper — Caveat](https://gwfh.mranftl.com/fonts/caveat?subsets=latin) — alternative self-hosting path (manual woff2 + @font-face); confirms latin subset available
- [MDN CSS Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) — `document.fonts.ready`, `document.fonts.check()` for font load verification
- [font-preview.html in project root](../../../font-preview.html) — established color values (#9EB1CF, #FFF0EC, #E8A598, #5A4A6F) used as token anchors

### Tertiary (LOW confidence)
- WebSearch results on Tailwind v4 + design tokens 2026 — confirmed @theme approach is current best practice; multiple sources agree

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Tailwind v4 docs, Fontsource docs, pixelarticons README all verified directly
- Architecture: HIGH — Pattern is prescribed by prior project ARCHITECTURE.md research (HIGH confidence) and confirmed by Tailwind v4 official docs
- Color token values: MEDIUM — Derived from `font-preview.html` (established by user) + interpolated shades; exact intermediate hex values are Claude's discretion
- Pitfalls: HIGH — Self-hosting font pitfall verified against prior PITFALLS.md research (HIGH confidence); Tailwind v3/v4 config conflict verified against official docs

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (90 days — Tailwind v4 and Fontsource are stable; pixelarticons API stable)

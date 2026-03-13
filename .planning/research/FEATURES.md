# Feature Research

**Domain:** AI fun text generator / compliment card web app
**Researched:** 2026-03-14 (v2.0 milestone update)
**Confidence:** HIGH (core features, implementation patterns), MEDIUM (Genkit streaming architecture)

---

## v2.0 Milestone: Technical Feature Behaviors

This section documents the *how* for each new feature being built in the v2.0 milestone. The prior research (below) covers the feature landscape. This addendum covers implementation mechanics, table stakes vs differentiators, complexity, and dependencies on existing DLS/Card components.

---

### Feature 1: AI Text Generation (Streaming vs Non-Streaming)

**What it is:** Calling Genkit's Gemini Flash integration from the React app and getting a compliment back.

**Architecture reality (HIGH confidence):** Genkit runs server-side only. It cannot execute in the browser. The pattern is:
1. React client calls a deployed Genkit flow via HTTP (using `runFlow` or `streamFlow` from `genkit/beta/client`)
2. Genkit flow runs on a Node.js server (Express, Cloud Run, or Firebase Cloud Functions)
3. The flow calls Gemini Flash, then returns the result to the client

**Non-streaming (simplest):** `runFlow()` — fire request, await complete response. No partial text visible. Latency is the full generation time (~1-3s for Gemini Flash). Good enough for short compliments; users see nothing until it's done.

**Streaming:** `streamFlow()` returns an async iterable. Each `chunk.text` is a partial string. React iterates chunks and appends to displayed text. Creates the "typewriter" feel without needing a separate animation library. This is the better UX choice for this app because:
- Reduces perceived latency (text starts appearing immediately)
- Naturally produces the typewriter effect without additional complexity
- Gemini Flash streaming chunks arrive fast — real-world feel is smooth

**Table stakes vs differentiator:**
- Table stakes: AI generation working at all (name in → compliment out)
- Differentiator: Streaming display that makes it feel alive vs a spinner then dump

**Complexity:** MEDIUM — requires a running Node.js backend with Genkit configured. This is the most architecturally significant feature in v2.0. It is not "add a library and call an API" — it requires a server component.

**Dependency on existing components:** None from DLS — this is pure logic. The output feeds into ComplimentCard props (`name` and `compliment`).

---

### Feature 2: Typewriter Text Animation in React

**What it is:** Character-by-character reveal of the compliment text as it appears on the card.

**Two implementation paths:**

**Path A — Streaming-native typewriter (RECOMMENDED):** If using `streamFlow`, each chunk is a partial string. Appending chunks to state in real time IS the typewriter effect. No separate animation needed. The chunk cadence from Gemini Flash creates natural variation in speed, which actually looks better than a fixed-interval timer.

```
streamFlow chunk → append to React state → re-render card text
```

**Path B — Simulated typewriter (fallback for non-streaming):** If using `runFlow` (full response at once), simulate typewriter with `useEffect` + `setInterval` or `setTimeout`:
- Store full text in state
- Store display index in state
- `setInterval` increments index, revealing one character at a time
- Clean up interval in `useEffect` return

**Table stakes:** Some kind of generation feedback (skeleton, pulse, or typewriter) — users need to know something is happening. A blank card during generation feels broken.

**Differentiator:** Typewriter specifically — it is warmer than a spinner and pairs naturally with the "dramatic reveal" personality of the app.

**Complexity:** LOW (streaming-native) / LOW-MEDIUM (simulated)

**Dependency on existing components:** The typewriter text renders inside ComplimentCard. The ComplimentCard component must accept either a `compliment` prop (complete text) or be compatible with partial/growing text. Since it's just a string prop, this works without changes.

**Anti-pattern:** Do not use a third-party typewriter library (TypeIt.js, react-type-animation) — they add dependency weight for behavior you get for free from streaming, or can implement in ~15 lines.

---

### Feature 3: HTML-to-Image Card Download with Custom Fonts

**What it is:** Capturing the rendered ComplimentCard DOM node as a PNG and downloading it.

**Library:** `html-to-image` (bubkoo/html-to-image) is the standard for this. It uses SVG foreignObject + Canvas to capture a DOM node. `toPng()` is the primary function.

**The font problem (HIGH confidence — verified via GitHub issues):** Canvas operations taint when fonts are loaded cross-origin (e.g., Google Fonts CDN). A tainted canvas throws when you try to export pixel data. Self-hosted fonts avoid this. This project already self-hosts Caveat — this was the right decision at v1.0.

**The font timing problem (MEDIUM confidence):** Even with self-hosted fonts, `html-to-image` may capture the card before the font is loaded and render fallback system fonts. The fix: `await document.fonts.ready` before calling `toPng()`. This guarantees the browser has loaded and rendered all fonts before the capture.

**The double-render issue:** `html-to-image` internally renders the node twice (once to measure, once to capture). Always call `getFontEmbedCSS(element)` once and pass the result to `toPng()` as an option to avoid fetching fonts twice.

**Correct implementation pattern:**
```typescript
await document.fonts.ready;
const fontEmbedCSS = await getFontEmbedCSS(cardRef.current);
const dataUrl = await toPng(cardRef.current, { fontEmbedCSS });
// then trigger download via anchor click
```

**Table stakes:** Download button works and produces a PNG that looks like what's on screen.

**Differentiator:** Font renders correctly in the downloaded PNG (looks designed, not broken). Most simple implementations miss the font timing issue and ship broken downloads.

**Complexity:** MEDIUM — the implementation is ~10 lines but the font pipeline has three specific pitfalls that will cause silent failures if not handled.

**Dependency on existing components:** Hard dependency on ComplimentCard. The card must be rendered (not hidden, not zero-opacity) at the moment of capture. If the card is conditionally rendered (`&&`), it must be visible. Use `visibility: hidden` instead of `display: none` if you need to pre-render it off-screen.

**Known limitation (LOW confidence — from GitHub issue #412):** There are reports of self-hosted fonts served from localhost not embedding correctly even with `getFontEmbedCSS`. This may not affect production (where fonts are served from the same origin with correct headers). Worth testing early in development against `localhost` specifically.

---

### Feature 4: Animated Floating Icon Background

**What it is:** Pixelarticons scattered behind the main card, with subtle movement (float/pulse) to add life to the page without distracting from the card.

**Implementation approach:** Pure CSS with Tailwind + `@keyframes` in the CSS file. No animation library needed.

**Layout:** Use `position: fixed` or `position: absolute` on a container div behind the card (`z-index: -1`). Place 8-12 icon instances at random-ish positions using inline styles or a set of Tailwind-based position classes. Fixed positions work better than truly random for reproducibility and visual balance.

**Float animation:** Classic CSS float is a translateY oscillation:
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
```

**Border pulse animation:** A box-shadow or outline pulse using `@keyframes`:
```css
@keyframes borderPulse {
  0%, 100% { box-shadow: 0 0 0 2px transparent; }
  50% { box-shadow: 0 0 0 4px var(--color-blue-200); }
}
```

**Variety:** Stagger `animation-delay` and `animation-duration` per icon so they don't all move in sync. Different durations (3s, 4s, 5s) create organic feel.

**Color fill:** Pixelarticons are SVGs. Apply a color via Tailwind `text-*` classes (if icons use `currentColor`) or via CSS `fill` property. The DLS already defines the color tokens — use soft blue and cream tints so icons stay background-tier, not foreground.

**Table stakes:** Background is visually interesting without being distracting. Icons don't overlap the card or input.

**Differentiator:** The combination of retro pixel icons + calm floating animation reinforces the app's personality. No competitor does this.

**Complexity:** LOW — pure CSS, no library, no JavaScript. The main work is choosing positions and tuning timing values. The Icon component already exists (v1.0).

**Dependency on existing components:** Hard dependency on the Icon component from v1.0. Uses existing pixelarticons set and color tokens from DLS.

**Anti-pattern:** Do not use a JS-driven animation (requestAnimationFrame, setInterval updating positions) — CSS animations are GPU-composited, cheaper, and simpler for this decorative use case.

---

### Feature 5: Mobile-Responsive Single-Column Layout

**What it is:** The page layout stacks vertically on mobile (name input → card → download button) rather than any side-by-side arrangement.

**Tailwind v4 approach:** Mobile-first by default. Use `flex flex-col` as base, then `md:flex-row` if a wider layout is needed on desktop. For this app, single-column may be correct on all breakpoints given the centered, focused interaction model.

**Key responsive concerns:**
- ComplimentCard must be readable at small widths — set `max-w-full` or `w-full` on mobile, `max-w-sm` or similar on desktop
- Name input should be full-width on mobile
- Download button should be full-width on mobile (easier tap target)
- Animated background icons may need to be fewer or smaller on mobile to avoid cluttering a small viewport

**Table stakes:** Layout does not break on iPhone-sized screens. No horizontal scroll. Text does not overflow the card.

**Differentiator:** None — this is purely expected behavior. Missing it would severely hurt the experience since casual/fun web traffic skews heavily mobile.

**Complexity:** LOW — Tailwind v4 responsive utilities make this straightforward. The DLS already uses Tailwind v4 CSS-only config (`@theme` block), so there's no new configuration needed.

**Dependency on existing components:** ComplimentCard width behavior. The card was designed at a fixed width for the kitchen sink screen — ensure it responds to its container width rather than having a hardcoded `width` value.

---

## Feature Landscape (v1.0 Research — Preserved)

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Name input field | Every personalization tool takes a name input — it's the entry point | LOW | Single text input; keep it prominent and minimal |
| Generate button | Users need an explicit trigger to kick off generation | LOW | Clear CTA; label "Generate My Compliment" or similar — not generic "Submit" |
| AI-generated compliment output | This IS the product — users came for this | LOW | Output must be displayed prominently; text should feel dramatic and fun |
| Loading / generation state feedback | Users expect visual feedback that something is happening; blank screen reads as broken | MEDIUM | Streaming typewriter animation preferred over spinner for text — reduces perceived latency and creates delight |
| Regenerate / try again | Users want to explore multiple results; single-shot feels incomplete | LOW | Simple button near output; overwrite model (not branching) is correct for this use case |
| Error state handling | API calls fail; users need to know it wasn't their fault | LOW | Friendly error message + retry button; never a raw error stack |
| Mobile-responsive layout | Majority of casual/fun web traffic is mobile | MEDIUM | Single-column layout on mobile; card must remain readable at small sizes |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Downloadable styled card image | The card IS the shareable artifact — this is the core product differentiator, not just text on a screen | HIGH | Use `html-to-image` to render the styled card div to PNG; `toBlob()` + `URL.createObjectURL()` preferred over `toDataURL()` for performance |
| Calm/cozy visual design contrast | The humor comes from the contrast: soft, elegant aesthetic + absurdly dramatic text — this is the brand identity | MEDIUM | DLS-first approach validates this contrast before any feature is built |
| Handwritten / whimsical typography | Sets emotional tone; makes card feel like a personal gift, not a template | LOW | Self-hosted Caveat font (already done in v1.0) |
| Retro techy icon system | Adds visual personality that separates EgoBoost from generic AI tools | LOW | Pixelarticons (already done in v1.0); animated background use in v2.0 |
| Typed/animated compliment reveal | Typewriter-style appearance makes the generation feel alive and builds anticipation | MEDIUM | Streaming-native typewriter preferred over simulation; plays once on generation |
| Themed card layout (not raw text box) | The download card feels designed — framed, with name, decorative elements — not a screenshot of a text box | MEDIUM | ComplimentCard component (already done in v1.0) maps directly to the download artifact |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Vibe / style picker (funny, sweet, romantic) | Users want control over tone | Adds decision friction before the payoff; the single "absurdly dramatic" voice IS the product identity | Lock in one voice; refine prompt engineering to nail it |
| Copy to clipboard button | Seems convenient | Shifts focus from card (the differentiator) to raw text; dilutes the product's card-first identity | Download button is the CTA; if text copying matters, it's a v1.x addition |
| Social sharing buttons (Twitter, Instagram) | Virality appeal | Platform APIs change constantly; native sharing adds auth/OAuth complexity; downloaded image is universally shareable | Let users share the downloaded card themselves — they already know how |
| User accounts / history | Power users want to revisit past compliments | Requires auth, database, session management — massively increases scope; app is stateless by design | Keep stateless; history is a v2+ concern if retention data demands it |
| Multiple languages / localization | Broader reach | Complicates prompt engineering; dramatic English register doesn't translate cleanly; testing explodes | Ship English only; add language support only after validating core experience |
| Photo upload for personalized compliments | Competitors offer this; seems more personal | Requires image processing pipeline, content moderation, storage — transforms a simple app into a complex product | Name-based personalization is sufficient and cleaner; photo is a v2+ experiment |
| Rating / feedback on compliments | Useful for model improvement | Adds UI complexity; for a fun toy app, rating kills the vibe | Implicit signal: regeneration rate indicates dissatisfaction; no explicit rating needed |
| Loading progress percentage | Feels informative | Gemini Flash responses are fast enough (~1-3s) that a progress bar overshoots its usefulness; it feels clinical | Typewriter animation during streaming is warmer and appropriate for this domain |

## Feature Dependencies

```
[Name Input]
    └──enables──> [Generate Button activation]
                      └──triggers──> [AI Compliment Generation (Genkit + Gemini Flash)]
                                         └──streams into──> [Typewriter Display on ComplimentCard]
                                                               └──enables──> [Regenerate Button]
                                                               └──enables──> [Download Card Button]

[Design Language System (DLS) — v1.0 complete]
    └──required by──> [ComplimentCard Component — v1.0 complete]
                          └──required by──> [Typewriter Display]
                          └──required by──> [Download Card as PNG]
                          └──required by──> [Animated Background Icons]

[Download Card as PNG]
    └──requires──> [ComplimentCard rendered and visible]
    └──requires──> [document.fonts.ready]
    └──requires──> [html-to-image library]
    └──requires──> [Self-hosted Caveat font — v1.0 complete]

[Animated Icon Background]
    └──requires──> [Icon component — v1.0 complete]
    └──requires──> [DLS color tokens — v1.0 complete]
    └──CSS only──> no JS dependencies

[Genkit Flow (server-side)]
    └──requires──> [Node.js server / Cloud Run / Firebase Functions]
    └──client calls via──> [streamFlow from genkit/beta/client]
```

### Dependency Notes

- **Streaming requires a server:** Genkit cannot run in the browser. A Node.js server (Express or equivalent) must be running and accessible for `streamFlow` to work. This is the largest architectural dependency in v2.0.
- **Download requires visible card:** `html-to-image` captures the DOM. The card must be rendered and visible (not `display: none`) at capture time. Use `visibility: hidden` if hiding before generation.
- **Typewriter is free with streaming:** If streaming is implemented, the typewriter effect comes naturally from appending chunks to state. No separate animation library needed.
- **Background icons require Icon component:** The animated background is composed of existing Icon instances with CSS animation — not a new component. Build on v1.0 work directly.
- **Font correctness is critical for download quality:** Self-hosted fonts + `document.fonts.ready` + `getFontEmbedCSS` are all three required for reliable font rendering in the exported PNG. Missing any one of these causes silent font fallback.

## MVP Definition

### Launch With (v2.0)

- [ ] Genkit server running (Node.js/Express or Firebase Functions) with Gemini Flash flow — the AI backbone; nothing works without this
- [ ] `streamFlow` call from React client — name input triggers streaming generation
- [ ] Streaming typewriter display on ComplimentCard — text appears live as chunks arrive
- [ ] Error state with friendly message + retry — API calls fail; must handle gracefully
- [ ] Regenerate button — single-shot is too limiting
- [ ] Download card as PNG — `html-to-image` with `document.fonts.ready` + `getFontEmbedCSS`
- [ ] Animated background icons — pixelarticons with float + pulse CSS animations
- [ ] Mobile-responsive single-column layout — full-width card and inputs on mobile

### Add After Validation (v2.x)

- [ ] Copy compliment text to clipboard — add only if analytics show users want raw text
- [ ] Subtle card entrance animation on reveal — low effort, high delight potential
- [ ] Reduced-motion media query respect for animations — accessibility improvement

### Future Consideration (v3+)

- [ ] Multiple compliment styles / vibes — after user feedback shows demand
- [ ] User history / saved compliments — requires auth + storage
- [ ] Shareable card URL — requires storage and URL-based rendering

## Feature Prioritization Matrix (v2.0 Scope)

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| AI generation via Genkit + streamFlow | HIGH | HIGH | P1 |
| Streaming typewriter display | HIGH | LOW (free with streaming) | P1 |
| Download card as PNG | HIGH | MEDIUM | P1 |
| Error state + retry | HIGH | LOW | P1 |
| Regenerate button | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | LOW | P1 |
| Animated background icons | MEDIUM | LOW | P2 |
| document.fonts.ready font fix | HIGH (invisible if missing) | LOW | P1 |

**Priority key:**
- P1: Must have for v2.0 launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Easy-Peasy.AI | Junia.ai | ComplimentAI (App Store) | EgoBoost 3000 (Our Approach) |
|---------|---------------|----------|--------------------------|------------------------------|
| Name input | Yes (recipient name) | Yes | Likely yes | Yes — minimal, prominent |
| Style picker (tone/vibe) | No (generates directly) | Yes (choose vibe) | Unknown | No — single dramatic voice is the brand |
| Multiple generations | Yes (1-5 per request) | Unknown | Unknown | One at a time; regenerate button |
| Download as image/card | No — text only | No — text only | Unknown | YES — core differentiator |
| Designed card output | No | No | No | YES — styled component = shareable artifact |
| Mobile experience | Basic (template tool) | Basic | Native app | Responsive web; mobile-first layout |
| Aesthetic / design | Generic template | Generic tool | Generic app | Intentional: calm/cozy vs. dramatic text |
| Streaming / typewriter | No | No | Unknown | Yes — streaming-native typewriter |
| Auth required | Yes (account) | Yes (account) | Yes (account) | No — fully stateless |
| Animated background | No | No | No | Yes — pixelarticons with float/pulse |

**Key insight:** No competitor combines (a) a designed downloadable card with (b) a single over-the-top comedic voice with (c) a strong visual aesthetic identity and (d) animated background personality. The download-as-designed-card angle remains genuinely unoccupied territory.

## Sources

**v2.0 Research (2026-03-14):**
- [Genkit Client Library docs](https://genkit.dev/docs/client/) — runFlow and streamFlow API (HIGH confidence — official docs)
- [Genkit generateStream API](https://genkit.dev/docs/models/) — streaming generation mechanics (HIGH confidence — official docs)
- [Streaming Cloud Functions for Firebase blog post](https://firebase.blog/posts/2025/03/streaming-cloud-functions-genkit/) — streaming architecture with onCallGenkit trigger (HIGH confidence — official Firebase blog, March 2025)
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) — toPng, getFontEmbedCSS, font embedding (MEDIUM confidence — widely used library, some open issues with localhost fonts)
- [html-to-image issue #213 — document.fonts support](https://github.com/bubkoo/html-to-image/issues/213) — confirmed font loading gap (HIGH confidence — primary source issue thread)
- [html-to-image issue #412 — localhost font rendering](https://github.com/bubkoo/html-to-image/issues/412) — localhost-specific font embed bug (MEDIUM confidence — issue thread, may not affect production)
- [LogRocket — 5 ways to implement typing animation in React](https://blog.logrocket.com/5-ways-implement-typing-animation-react/) — typewriter patterns (MEDIUM confidence)
- [Tailwind CSS responsive design docs](https://tailwindcss.com/docs/responsive-design) — mobile-first breakpoints (HIGH confidence — official docs)
- [Smashing Magazine — Keyframes Tokens](https://www.smashingmagazine.com/2025/11/keyframes-tokens-standardizing-animation-across-projects/) — CSS animation token patterns (MEDIUM confidence)

**v1.0 Research (2026-03-13):**
- [Easy-Peasy.AI Compliment Generator](https://easy-peasy.ai/templates/compliment-generator) — competitor feature analysis (MEDIUM confidence)
- [Junia.ai Compliment Generator](https://www.junia.ai/tools/compliment-generator) — competitor feature analysis (MEDIUM confidence)
- [Shape of AI — Regenerate Pattern](https://www.shapeof.ai/patterns/regenerate) — UX pattern for regeneration (HIGH confidence)
- [Cloudscape Design System — GenAI Loading States](https://cloudscape.design/patterns/genai/genai-loading-states/) — loading state best practices (HIGH confidence)

---
*Feature research for: AI compliment generator / fun text generator web app (EgoBoost 3000)*
*v1.0 researched: 2026-03-13 | v2.0 updated: 2026-03-14*

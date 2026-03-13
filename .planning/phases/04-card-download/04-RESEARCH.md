# Phase 4: Card Download - Research

**Researched:** 2026-03-14
**Domain:** HTML-to-image export with custom font embedding, streaming text animation, React 19 ref forwarding
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GEN-03 | Compliment text streams onto the card with a typewriter animation effect | generateContentStream + for-await loop + React useState accumulation; TypewriterText component reads streamed chunks |
| DWNL-01 | User can download the compliment card as a PNG image | html-to-image toPng + Blob URL + anchor click pattern |
| DWNL-02 | Downloaded PNG renders fonts correctly (document.fonts.ready + getFontEmbedCSS) | document.fonts.ready guard before capture; getFontEmbedCSS embeds @fontsource/caveat woff2 data-URL into the SVG |
| DWNL-03 | Downloaded PNG is retina-quality (pixelRatio >= 2) | toPng({ pixelRatio: Math.max(2, window.devicePixelRatio) }) |
</phase_requirements>

---

## Summary

Phase 4 delivers two tightly-coupled features: streaming text onto the card (GEN-03) and downloading the card as a sharp, font-correct PNG (DWNL-01 through DWNL-03). Both features share the same DOM node — the ComplimentCard element — which is why the plan co-locates them here.

The standard tool for DOM-to-PNG conversion in browser React apps is **html-to-image** (v1.11.13). It clones the target element into an SVG, embeds external resources (including fonts), then renders to a canvas and exports. The critical risk for this project is that @fontsource/caveat is self-hosted and served from `localhost` in dev. html-to-image's `getFontEmbedCSS` function can fail to fetch localhost font files due to CORS restrictions (GitHub issue #412, resolved Oct 2023). The documented workaround is to pre-load the font as an ArrayBuffer and register it as a data-URL before calling the export function, so html-to-image sees a data-URL instead of a localhost URL.

For the streaming typewriter effect, Firebase AI Logic's `generateContentStream` returns an async iterable. A `for await` loop over `result.stream` yields chunks, each exposing a `.text()` method. The implementation pattern is: update a React state variable by concatenating each chunk as it arrives. A `TypewriterText` component renders the accumulated string. Because React 19 is in use (project already uses `react@19.2.4`), `forwardRef` is deprecated in favor of passing `ref` as a plain prop — no wrapper needed for ComplimentCard to expose its DOM node.

**Primary recommendation:** Install html-to-image. Add `ref` prop to ComplimentCard (React 19 style). In the download utility, call `document.fonts.ready`, then call `getFontEmbedCSS(node)`, then call `toPng(node, { pixelRatio: Math.max(2, window.devicePixelRatio), fontEmbedCSS })`. Switch useCompliment to use `generateContentStream` and stream chunks into state; TypewriterText renders them.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| html-to-image | 1.11.13 | DOM element → PNG (browser-side, no server) | Maintained fork of dom-to-image; built-in font embedding; TypeScript types included; used by thousands of projects |
| @fontsource/caveat | 5.2.8 (already installed) | Self-hosted Caveat font | Already in project; CORS-safe localhost serving via Vite; woff2 format embeds cleanly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| firebase/ai generateContentStream | already installed | Streams Gemini response chunks | Replaces generateContent in useCompliment for GEN-03 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html-to-image | dom-to-image | dom-to-image unmaintained; html-to-image is the maintained fork |
| html-to-image | html2canvas | html2canvas has worse CSS support and no font embedding utility; avoid |
| html-to-image | Server-side Puppeteer | Requires a backend; project is stateless by design |
| Streaming accumulation in hook | External typewriter library (typewriter-effect, motion Typewriter) | No external typewriter library is needed — streaming chunks are already character-batched from Gemini; simple useState accumulation + character delay is sufficient |

**Installation:**
```bash
npm install html-to-image
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/Card/
│   └── ComplimentCard.tsx    # Add ref prop (React 19 style) → exposes <div> DOM node
├── hooks/
│   └── useCompliment.ts      # Switch to generateContentStream; expose streamedText state
├── lib/
│   └── downloadCard.ts       # NEW: downloadCard(node) utility — fonts.ready + getFontEmbedCSS + toPng
├── components/
│   └── TypewriterText.tsx    # NEW: renders accumulated streamed string
└── screens/
    └── MainScreen.tsx        # Wire TypewriterText into card; add Download button
```

### Pattern 1: React 19 Ref on ComplimentCard

React 19 deprecates `forwardRef`. Function components receive `ref` as a plain prop.

**What:** Expose the card's outer `<div>` DOM node to the parent so the download utility can target it.
**When to use:** Any time a parent needs to capture or measure a child element.

```typescript
// src/components/Card/ComplimentCard.tsx
// React 19: ref is a plain prop — no forwardRef wrapper needed

import type { Ref } from 'react';
import { Icon } from '../Icon/Icon';

interface ComplimentCardProps {
  name: string;
  compliment: string;       // rendered text (may be partial during streaming)
  ref?: Ref<HTMLDivElement>; // React 19: just a prop
}

export function ComplimentCard({ name, compliment, ref }: ComplimentCardProps) {
  return (
    <div
      ref={ref}
      className="bg-cream-50 rounded-card w-full max-w-[380px] mx-auto ..."
      ...
    >
      {/* existing card content */}
    </div>
  );
}
```

### Pattern 2: TypewriterText Component

**What:** Renders a progressively-built string, one character at a time, with a fixed interval between characters.
**When to use:** When the source string grows over time (streaming) and the UI should reveal characters as they arrive.

```typescript
// src/components/TypewriterText.tsx
// Renders text one character at a time from a growing source string.
// No external library needed — streaming chunks are already character-batched.

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;          // full accumulated text from streaming
  className?: string;
}

export function TypewriterText({ text, className }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    // When new text arrives, type any new characters individually
    if (text.length <= displayed.length) return;
    const newChars = text.slice(displayed.length);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, displayed.length + i));
      if (i >= newChars.length) clearInterval(id);
    }, 18); // ~18ms per character (~55 chars/s)
    return () => clearInterval(id);
  }, [text]);

  return <span className={className}>{displayed}</span>;
}
```

### Pattern 3: generateContentStream in useCompliment

**What:** Replace `generateContent` with `generateContentStream`, yield chunk text into state.
**When to use:** Whenever displaying text progressively as AI generates it.

```typescript
// Source: https://firebase.google.com/docs/ai-logic/stream-responses
const result = await model.generateContentStream(prompt);
let accumulated = '';
for await (const chunk of result.stream) {
  accumulated += chunk.text();
  setState({ status: 'streaming', name, compliment: accumulated });
}
setState({ status: 'result', name, compliment: accumulated });
```

The state machine gains a `streaming` status (between `generating` and `result`) to represent partial content. The card renders during `streaming` state so TypewriterText can animate.

### Pattern 4: downloadCard Utility

**What:** Captures a DOM node as a retina-quality PNG with embedded Caveat font, triggers browser download.
**When to use:** User taps the Download button in MainScreen.

```typescript
// src/lib/downloadCard.ts
import { toPng, getFontEmbedCSS } from 'html-to-image';

export async function downloadCard(node: HTMLElement, filename = 'my-boost.png') {
  // 1. Wait for all fonts registered in the document to finish loading
  await document.fonts.ready;

  // 2. Embed font CSS once — getFontEmbedCSS fetches and base64-encodes the woff2 file
  //    If font fetch fails (localhost CORS edge case), log and continue without embed
  let fontEmbedCSS: string | undefined;
  try {
    fontEmbedCSS = await getFontEmbedCSS(node);
  } catch (err) {
    console.warn('downloadCard: font embed failed, PNG may use fallback font', err);
  }

  // 3. Render at ≥2x for retina sharpness
  const pixelRatio = Math.max(2, window.devicePixelRatio ?? 2);

  const dataUrl = await toPng(node, {
    pixelRatio,
    ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
  });

  // 4. Trigger download via Blob URL + anchor click
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
```

### Anti-Patterns to Avoid

- **Calling toPng without document.fonts.ready:** Font may not be available during cloning, producing system-serif fallback text in the PNG.
- **Using window.devicePixelRatio directly without a floor:** On 1x displays the PNG will be 1x (blurry when printed or zoomed). Always use `Math.max(2, window.devicePixelRatio)`.
- **Skipping getFontEmbedCSS:** The SVG clone does not inherit the document's font-face declarations unless they are embedded inline.
- **Calling `toPng` twice** (once for font embedding, once for render): Use the `fontEmbedCSS` option to pass pre-embedded CSS, not two separate calls.
- **Not revoking Blob URLs:** If you use `toBlob` + `URL.createObjectURL`, call `URL.revokeObjectURL` after `.click()` to avoid memory leaks. Using the `dataUrl` (data: string) approach from `toPng` sidesteps this entirely.
- **Using forwardRef in React 19:** The project uses React 19.2.4. Pass `ref` as a plain prop. Using the old `forwardRef` wrapper still works but emits a deprecation warning.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM-to-PNG conversion | Canvas draw loop, manual CSS serialization | html-to-image toPng | Font embedding, cross-browser SVG foreignObject, CSS clone — dozens of edge cases already handled |
| Font embedding in canvas | Manual ArrayBuffer + base64 | html-to-image getFontEmbedCSS | Handles @font-face parsing, multiple format selection, proper data-URL wrapping |
| Typewriter timing across streaming chunks | Custom debounced state machine | Simple setInterval + slice pattern | Streaming chunks are already character-batched; a trivial counter + interval is sufficient |
| File download trigger | Form POST, server endpoint | Blob URL + anchor click | Completely client-side, no server needed, well-supported in all modern browsers |

**Key insight:** html-to-image handles the hard parts of canvas image export. The download flow can be a 20-line utility function.

---

## Common Pitfalls

### Pitfall 1: Self-Hosted Font on Localhost Fails to Embed
**What goes wrong:** `getFontEmbedCSS(node)` internally fetches the font file from the URL in the @font-face declaration. On `localhost`, the browser may block or fail this fetch with a CORS error or because the font is already served from a different origin in the @fontsource CSS (which uses relative paths resolved from the CSS file's location). The result is a PNG with system-serif fallback text instead of Caveat.

**Why it happens:** html-to-image issue #412 (closed Oct 2023) confirmed this is a real failure mode in dev. @fontsource resolves font paths relative to the CSS bundle, but the SVG clone's fetch context may differ.

**How to avoid:**
- Wrap `getFontEmbedCSS` in a try/catch so a font-embed failure doesn't block the download.
- During development, verify the PNG actually has Caveat rendered — test on a deployed URL (e.g., `vite preview` or Firebase Hosting), not just `localhost`, before marking DWNL-02 complete.
- If localhost fails, the workaround from issue #412: pre-fetch the font file as an ArrayBuffer, register it with the FontFace API as a data-URL, and inject an @font-face style tag. html-to-image recognizes the data-URL in the inline style and embeds it without a fetch.

**Warning signs:** Fonts render correctly in the browser UI but appear as a different typeface in the downloaded PNG.

### Pitfall 2: Blurry PNG on Retina Displays
**What goes wrong:** toPng defaults to `window.devicePixelRatio` which may be 1 on some screens. A 1x PNG looks blurry on 2x (Retina) displays when expanded to fill the screen.

**Why it happens:** Omitting `pixelRatio` or setting it to `1`.

**How to avoid:** Always pass `pixelRatio: Math.max(2, window.devicePixelRatio)`. This guarantees at least 2x output regardless of the user's screen.

**Warning signs:** Downloaded PNG looks soft/blurry when viewed in Photos or on a Retina display.

### Pitfall 3: Streaming State Not Visible on Card
**What goes wrong:** The card only renders in `status === 'result'` in MainScreen. If the state machine adds a `streaming` status but MainScreen doesn't render the card during `streaming`, the typewriter effect is invisible.

**Why it happens:** MainScreen currently guards card render with `isResult` only.

**How to avoid:** Update the render condition in MainScreen to show the card in both `streaming` and `result` states. During `streaming`, the card's compliment prop receives the partial accumulated text.

**Warning signs:** Compliment appears instantly (no typewriter) or not at all until generation finishes.

### Pitfall 4: Download Button Visible Before Card is Ready
**What goes wrong:** Download button appears during `streaming` state when the compliment is incomplete. User downloads a half-written compliment.

**Why it happens:** Early render of the download button without checking whether generation is complete.

**How to avoid:** Only show the Download button when `state.status === 'result'` (fully complete). During `streaming`, the card is visible but the Download button is hidden.

### Pitfall 5: forwardRef Deprecation Warning in React 19
**What goes wrong:** Using `forwardRef()` in React 19 emits a console warning "forwardRef render functions accept exactly two parameters" or deprecation notice, cluttering dev console.

**Why it happens:** React 19 removed the need for forwardRef — `ref` is now a standard prop.

**How to avoid:** Pass `ref` as a plain prop typed as `Ref<HTMLDivElement>` in the component's props interface. No `forwardRef` wrapper needed.

---

## Code Examples

Verified patterns from official sources:

### generateContentStream Usage
```typescript
// Source: https://firebase.google.com/docs/ai-logic/stream-responses
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  // Accumulate into React state
}
// Full response available after loop
const fullText = (await result.response).text();
```

### toPng with pixelRatio and fontEmbedCSS
```typescript
// Source: https://github.com/bubkoo/html-to-image
import { toPng, getFontEmbedCSS } from 'html-to-image';

const fontEmbedCSS = await getFontEmbedCSS(element);
const dataUrl = await toPng(element, {
  pixelRatio: 2,
  fontEmbedCSS,
});
```

### Trigger Browser Download from data URL
```typescript
// Standard browser download pattern (MDN)
const link = document.createElement('a');
link.download = 'filename.png';
link.href = dataUrl; // data: URL from toPng
link.click();
// No revoke needed for data: URLs (only for blob: URLs)
```

### React 19 ref as plain prop
```typescript
// Source: https://react.dev/reference/react/forwardRef (React 19 note)
import type { Ref } from 'react';

interface Props {
  name: string;
  compliment: string;
  ref?: Ref<HTMLDivElement>;
}

export function ComplimentCard({ name, compliment, ref }: Props) {
  return <div ref={ref}>...</div>;
}
```

### useCompliment with streaming state
```typescript
// Extended state machine: adds 'streaming' between 'generating' and 'result'
export type ComplimentState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'streaming'; name: string; compliment: string }
  | { status: 'result'; name: string; compliment: string }
  | { status: 'error' };
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `forwardRef(fn)` wrapper | `ref` as plain prop in React 19 | React 19 (project already on 19.2.4) | Simpler ComplimentCard; no wrapper boilerplate |
| `generateContent` (waits for full response) | `generateContentStream` (chunks) | Firebase AI Logic from launch | Enables typewriter effect without any delay hack |
| toPng without pixelRatio | toPng({ pixelRatio: 2 }) | html-to-image v1.x | Sharp on Retina; no change needed to html-to-image itself |

**Deprecated/outdated:**
- `forwardRef`: Works in React 19 but deprecated; emits warning in future versions
- `generateContent` for streaming: Still works, but returns the full string at once — cannot drive a typewriter effect

---

## Open Questions

1. **Localhost font embed reliability**
   - What we know: Issue #412 (Oct 2023) confirmed getFontEmbedCSS can fail on localhost fonts; workaround is data-URL pre-loading
   - What's unclear: Whether Vite's dev server headers already include appropriate CORS headers that would make getFontEmbedCSS work on localhost without the workaround
   - Recommendation: Implement try/catch fallback; verify on `vite preview` URL before closing DWNL-02; if localhost still fails, the data-URL workaround from issue #412 is the fix

2. **TypewriterText character speed vs. streaming chunk size**
   - What we know: Gemini streams in chunks of varying character counts (not guaranteed single-character)
   - What's unclear: Whether 18ms per character will feel natural given chunk arrival timing — chunks may arrive faster or slower than the interval
   - Recommendation: Use the interval-based character reveal for smooth playback; the interval is independent of chunk arrival rate, so even large chunks will type out smoothly

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `/Volumes/x10/CODE/FunProjectSong/vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEN-03 | Compliment text streams onto card character by character | unit | `npm test -- --reporter=verbose` (TypewriterText tests) | ❌ Wave 0 |
| DWNL-01 | Download button triggers PNG download | unit | `npm test` (MainScreen download button test) | ❌ Wave 0 |
| DWNL-02 | Font correctly embedded in PNG | manual-only | Manual: inspect downloaded PNG visually | N/A — canvas content not testable in jsdom |
| DWNL-03 | PNG is retina-quality (≥2x resolution) | unit (mock) | `npm test` (downloadCard utility unit test mocking html-to-image) | ❌ Wave 0 |

**Note on DWNL-02 (manual-only):** jsdom does not implement `document.fonts`, canvas rendering, or blob export. The font embedding behavior can only be verified by downloading an actual PNG in a browser. The automated test for DWNL-03 can verify that `pixelRatio: Math.max(2, ...)` is passed to toPng via mock assertion, but cannot verify the actual pixel output.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/TypewriterText.test.tsx` — covers GEN-03 (character-by-character reveal from growing text)
- [ ] `src/lib/downloadCard.test.ts` — covers DWNL-01 and DWNL-03 (mocks html-to-image, asserts pixelRatio ≥ 2, asserts anchor click called)
- [ ] `src/hooks/useCompliment.test.ts` — EXTEND existing file to cover streaming state transitions (generating → streaming → result)

---

## Sources

### Primary (HIGH confidence)
- Firebase AI Logic docs: https://firebase.google.com/docs/ai-logic/stream-responses — confirmed `generateContentStream` + `for await` + `.text()` chunk API
- html-to-image GitHub: https://github.com/bubkoo/html-to-image — confirmed toPng options (`pixelRatio`, `fontEmbedCSS`), `getFontEmbedCSS` API
- React 19 docs: https://react.dev/reference/react/forwardRef — confirmed `ref` as plain prop in React 19, `forwardRef` deprecated
- MDN URL.createObjectURL: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static — confirmed Blob URL + anchor click download pattern

### Secondary (MEDIUM confidence)
- html-to-image issue #412: https://github.com/bubkoo/html-to-image/issues/412 — localhost font embed failure confirmed; data-URL workaround documented; issue closed Oct 2023
- html-to-image issue #213: https://github.com/bubkoo/html-to-image/issues/213 — document.fonts limitation; workaround via injected style tag
- npm html-to-image registry — confirmed version 1.11.13, last published ~1 year ago, 0 dependencies

### Tertiary (LOW confidence)
- WebSearch community examples for typewriter + streaming — multiple sources agree on setState accumulation pattern; not linked to a single authoritative source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — html-to-image well-documented on npm and GitHub; firebase/ai confirmed on official docs
- Architecture: HIGH — all patterns verified against React 19 docs and official Firebase AI Logic docs
- Pitfalls: HIGH — font embed localhost issue verified via closed GitHub issue with documented workaround; retina pixelRatio verified via library docs

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable libraries; html-to-image last published ~1 year ago; low churn)

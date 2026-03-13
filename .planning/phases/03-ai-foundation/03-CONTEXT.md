# Phase 3: AI Foundation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can enter their name, tap Generate, and receive a real AI-generated compliment via Firebase AI Logic (Gemini Flash). Includes regenerate support and full error handling. Typewriter streaming animation is Phase 4 — compliment appears all at once here.

</domain>

<decisions>
## Implementation Decisions

### Compliment personality
- Absurdly dramatic tone — peak hyperbole, borderline mythological ("The sun itself pauses each morning just to watch you rise")
- 2-3 sentences per compliment — enough for dramatic arc without overwhelming the card
- Weave the person's name naturally into the compliment text ("Dear Sarah, the stars reorganized themselves...")
- Universal compliments only — no assumptions about specific traits (smart, funny, creative). Works for anyone.

### Name input behavior
- Playful placeholder text (Claude crafts something fitting the cozy-dramatic vibe)
- Auto-focus on page load — cursor ready in input immediately
- Minimum 3 characters required (filters typos, allows short names like "Ali")
- Generate button disabled until name meets minimum length
- Claude's Discretion: maximum character limit (based on ComplimentCard layout constraints)

### Generate flow & states
- Button text: "Boost Me" for first generation
- Loading state: button shows spinner + "Boosting..." text, card area stays hidden until ready
- After result: button changes to "Boost Again" (same button, two states)
- Name stays editable after compliment is showing — user can tweak name and tap "Boost Again"
- Card stays visible when name is edited (doesn't reset to initial state)
- Debounce on generate button prevents double-fire

### Error messaging
- Playful, in-character error messages ("Even the universe needs a coffee break. Try again?")
- One generic playful message for all error types — users don't need to know network vs quota
- Retry button text: "Try Again"
- Error state replaces the card area (not a toast/banner)
- No raw API errors ever shown to user

### Claude's Discretion
- Exact placeholder text wording
- Maximum name character limit
- Specific error message copy (within playful/in-character constraint)
- Loading spinner style
- Exact prompt engineering for Gemini (within the personality constraints above)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ComplimentCard` component (`src/components/Card/ComplimentCard.tsx`): Ready to receive `name` and `compliment` props. Max-width 380px, uses DLS tokens throughout.
- `Icon` component (`src/components/Icon/Icon.tsx`): Available for decorative elements in error states or loading.
- DLS tokens (`src/dls/tokens.css`, `typography.css`): Full design system with Caveat font, color palette, spacing.

### Established Patterns
- Tailwind v4 with CSS @theme block (no tailwind.config.js)
- Self-hosted Caveat font via @fontsource
- Pixelarticons at 24px multiples for crisp rendering
- Component-per-folder structure (`src/components/Card/`, `src/components/Icon/`)

### Integration Points
- `MainScreen.tsx` — currently a stub, will be wired up with name input, generate button, and ComplimentCard
- No Firebase packages installed yet — need `firebase` and `@firebase/ai`
- No hooks directory exists — `useCompliment` hook will be the first custom hook
- `App.tsx` with react-router-dom already set up

</code_context>

<specifics>
## Specific Ideas

- Button naming ("Boost Me" / "Boost Again") ties directly to the app name EgoBoost 3000 — maintains brand identity throughout the interaction
- The humor contrast is key: calm/cozy visual design vs absurdly dramatic compliment text
- Firebase AI Logic proxies the API key — it must never appear in the browser bundle

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ai-foundation*
*Context gathered: 2026-03-14*

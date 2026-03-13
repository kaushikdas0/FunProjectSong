# Feature Research

**Domain:** AI fun text generator / compliment card web app
**Researched:** 2026-03-13
**Confidence:** HIGH (core features), MEDIUM (competitor specifics)

## Feature Landscape

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
| Downloadable styled card image | The card IS the shareable artifact — this is the core product differentiator, not just text on a screen | HIGH | Use `html-to-image` or `html2canvas` to render the styled card div to PNG; `toBlob()` + `URL.createObjectURL()` preferred over `toDataURL()` for performance |
| Calm/cozy visual design contrast | The humor comes from the contrast: soft, elegant aesthetic + absurdly dramatic text — this is the brand identity | MEDIUM | DLS-first approach validates this contrast before any feature is built |
| Handwritten / whimsical typography | Sets emotional tone; makes card feel like a personal gift, not a template | LOW | Font choice at DLS layer; Google Fonts (Caveat, Pacifico, or similar) |
| Retro techy icon system | Adds visual personality that separates EgoBoost from generic AI tools | LOW | Icon set chosen at DLS layer; inline SVGs preferred for styling control |
| Typed/animated compliment reveal | Typewriter-style appearance makes the generation feel alive and builds anticipation | MEDIUM | TypeIt.js or CSS animation; plays once on generation, not on every render cycle |
| Themed card layout (not raw text box) | The download card feels designed — framed, with name, decorative elements — not a screenshot of a text box | MEDIUM | Card component is a styled React component that maps directly to the download artifact |

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
                      └──triggers──> [AI Compliment Generation]
                                         └──populates──> [Compliment Display]
                                                             └──enables──> [Regenerate Button]
                                                             └──enables──> [Download Card Button]

[Design Language System (DLS)]
    └──required by──> [Styled Card Component]
                          └──required by──> [Download Card as Image]

[Compliment Display]
    └──requires──> [Loading / Generation State]
    └──requires──> [Error State]

[Download Card as Image]
    └──requires──> [Styled Card Component]
    └──requires──> [html-to-image / html2canvas library]
```

### Dependency Notes

- **Generate Button requires Name Input:** The button should be disabled or visually inert until a name is entered — prevents empty-name API calls.
- **Download Card requires Styled Card Component:** The download artifact IS the card component rendered to PNG. They are the same thing; build them together, not separately.
- **DLS required by everything visual:** The card's downloadable quality depends entirely on the design system being correct first. DLS-first is not optional for this project — it's a hard dependency.
- **Compliment Display requires Loading State:** Generation takes 1-3 seconds. The display area must handle three states: empty (pre-generation), loading, and populated.
- **Regenerate conflicts with history:** Overwrite-mode regeneration (replace current) conflicts with any future history feature. If history is ever added, the regeneration model needs to change to branching. Keep this in mind for v2.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Name input + Generate button — the entry point; nothing works without this
- [ ] Gemini Flash API call via Firebase — core AI integration; prompt engineering for dramatic style lives here
- [ ] Loading state with typewriter animation — generation feedback; prevents perceived brokenness
- [ ] Error state with retry — API calls fail; must handle gracefully
- [ ] Compliment output display — the payoff moment
- [ ] Regenerate button — single-shot is too limiting; users need to explore
- [ ] Styled card component — the designed artifact that frames name + compliment
- [ ] Download card as PNG — the differentiator; this is the core value proposition
- [ ] DLS / kitchen sink validation screen — design system first; validates visual language before building features

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Copy compliment text to clipboard — add if analytics show users want raw text; only if download UX proves insufficient
- [ ] Subtle card animation on reveal — add if the static card reveal feels flat; low effort, high delight potential
- [ ] Mobile PWA / "Add to Home Screen" hint — add if mobile usage is high and session data shows repeat visitors

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Multiple compliment styles / vibes — defer until user feedback explicitly requests variety; risks diluting brand voice
- [ ] User history / saved compliments — defer; requires auth + storage stack; not validated yet
- [ ] Photo upload personalization — defer; high complexity, content moderation required, unproven value
- [ ] Multiple language support — defer; validate English-first, then expand if international demand is clear
- [ ] Shareable card URL (not just download) — defer; requires storage and URL-based card rendering

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Name input + Generate button | HIGH | LOW | P1 |
| AI compliment output | HIGH | LOW | P1 |
| Loading / generation state | HIGH | LOW | P1 |
| Error state | HIGH | LOW | P1 |
| Regenerate button | HIGH | LOW | P1 |
| Styled card component | HIGH | MEDIUM | P1 |
| Download card as PNG | HIGH | MEDIUM | P1 |
| DLS / kitchen sink screen | HIGH (enables all) | MEDIUM | P1 |
| Typewriter animation on reveal | MEDIUM | MEDIUM | P2 |
| Copy to clipboard | LOW | LOW | P3 |
| Social sharing buttons | LOW | HIGH | P3 |
| User accounts / history | LOW | HIGH | P3 |
| Photo upload | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
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
| Streaming / typewriter | No | No | Unknown | Yes — typewriter animation on reveal |
| Auth required | Yes (account) | Yes (account) | Yes (account) | No — fully stateless |

**Key insight:** No competitor combines (a) a designed downloadable card with (b) a single over-the-top comedic voice with (c) a strong visual aesthetic identity. The download-as-designed-card angle is genuinely unoccupied territory in the compliment generator space.

## Sources

- [Easy-Peasy.AI Compliment Generator](https://easy-peasy.ai/templates/compliment-generator) — competitor feature analysis (MEDIUM confidence — live product observed)
- [Junia.ai Compliment Generator](https://www.junia.ai/tools/compliment-generator) — competitor feature analysis (MEDIUM confidence)
- [YesChat Compliment Me](https://www.yeschat.ai/gpts-ZxWyYSef-Compliment-Me) — competitor feature analysis (LOW confidence — surface review only)
- [Shape of AI — Regenerate Pattern](https://www.shapeof.ai/patterns/regenerate) — UX pattern for regeneration (HIGH confidence — authoritative AI UX pattern library)
- [Cloudscape Design System — GenAI Loading States](https://cloudscape.design/patterns/genai/genai-loading-states/) — loading state best practices (HIGH confidence — AWS official design system)
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) — DOM-to-PNG library for card download (MEDIUM confidence — widely used, check version compatibility)
- [MDN — HTMLCanvasElement.toDataURL()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) — image export best practices (HIGH confidence — MDN official)
- [Digital Greeting Card Trends 2025](https://expresswithacard.com/blog/trends-digital-greeting-cards-2025) — market context for shareable card demand (MEDIUM confidence)
- [LLMs and the Psychology Behind Loading Animations](https://tigerabrodi.blog/llms-and-the-psychology-behind-loading-animations) — streaming vs spinner UX rationale (MEDIUM confidence)

---
*Feature research for: AI compliment generator / fun text generator web app (EgoBoost 3000)*
*Researched: 2026-03-13*

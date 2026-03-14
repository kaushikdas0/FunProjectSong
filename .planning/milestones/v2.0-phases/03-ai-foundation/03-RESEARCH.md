# Phase 3: AI Foundation - Research

**Researched:** 2026-03-14
**Domain:** Firebase AI Logic (firebase/ai), React custom hooks, Gemini prompt engineering
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Compliment personality:**
- Absurdly dramatic tone — peak hyperbole, borderline mythological ("The sun itself pauses each morning just to watch you rise")
- 2-3 sentences per compliment — enough for dramatic arc without overwhelming the card
- Weave the person's name naturally into the compliment text ("Dear Sarah, the stars reorganized themselves...")
- Universal compliments only — no assumptions about specific traits (smart, funny, creative). Works for anyone.

**Name input behavior:**
- Playful placeholder text (Claude crafts something fitting the cozy-dramatic vibe)
- Auto-focus on page load — cursor ready in input immediately
- Minimum 3 characters required (filters typos, allows short names like "Ali")
- Generate button disabled until name meets minimum length
- Claude's Discretion: maximum character limit (based on ComplimentCard layout constraints)

**Generate flow and states:**
- Button text: "Boost Me" for first generation
- Loading state: button shows spinner + "Boosting..." text, card area stays hidden until ready
- After result: button changes to "Boost Again" (same button, two states)
- Name stays editable after compliment is showing — user can tweak name and tap "Boost Again"
- Card stays visible when name is edited (doesn't reset to initial state)
- Debounce on generate button prevents double-fire

**Error messaging:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GEN-01 | User can enter their name and tap a generate button to receive a compliment | Name input with 3-char minimum, "Boost Me" / "Boost Again" button, useCompliment hook idle→generating→result state machine |
| GEN-02 | Compliment is generated via Firebase AI Logic (Gemini Flash, no backend server) | firebase/ai SDK with GoogleAIBackend + VITE_ env vars for firebaseConfig; API key stays in Firebase console, never in bundle |
| GEN-03 | (Phase 4 — NOT this phase) Typewriter streaming animation | Out of scope here; generateContent (non-streaming) is the correct call for Phase 3 |
| GEN-04 | User can tap regenerate to get a new compliment (replaces current one) | Same hook generate() function called again from "result" state; button becomes "Boost Again" after first success |
| GEN-05 | Error state shows a friendly message with a retry button | try/catch around generateContent; all errors mapped to single playful message; retry calls generate() again |
</phase_requirements>

---

## Summary

Phase 3 wires the real Gemini API into the app. The chosen path — Firebase AI Logic (`firebase/ai` SDK with `GoogleAIBackend`) — lets Gemini calls happen directly from the browser without any backend server. The Firebase project config (apiKey, projectId, etc.) goes into Vite environment variables; it is intentionally public. The Gemini API key itself never touches the app bundle — Firebase AI Logic proxies it server-side.

The core implementation is two units: a `useCompliment` custom hook (state machine + API call) and a wired-up `MainScreen` (UI shell). The hook owns a four-state machine: `idle → generating → result → error`, with `error → generating` on retry. Remote Config is used to store the model name string so if Gemini Flash is retired, the model can be swapped without a code deploy.

**Primary recommendation:** Install `firebase` (includes `firebase/ai` and `firebase/remote-config`). Initialize once in `src/lib/firebase.ts`. The `useCompliment` hook calls `model.generateContent(prompt)` inside a try/catch; every caught error surfaces the same playful message string. No streaming in this phase — that lands in Phase 4.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| firebase | ^11.x (latest) | Firebase SDK — includes `firebase/ai` and `firebase/remote-config` | Official SDK; `firebase/ai` is the only browser-safe path to Gemini without a backend |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| firebase/ai (sub-import) | included in firebase | `getAI`, `getGenerativeModel`, `GoogleAIBackend`, `generateContent` | All AI calls |
| firebase/remote-config (sub-import) | included in firebase | `getRemoteConfig`, `fetchAndActivate`, `getValue` | Fetching model name at startup |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GoogleAIBackend | VertexAIBackend | Vertex AI requires a Blaze (paid) billing plan; GoogleAIBackend works on free Spark plan |
| firebase/ai | Direct Google AI API from browser | Direct call exposes the Gemini API key in the browser bundle — a hard no |
| Remote Config for model name | Hardcoded string | Hardcoded string requires a code deploy if Gemini Flash retires June 2026 |

**Installation:**
```bash
npm install firebase
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── firebase.ts          # App init, AI instance, Remote Config init (singleton)
├── hooks/
│   └── useCompliment.ts     # State machine + generateContent call (first custom hook)
├── screens/
│   └── MainScreen.tsx       # Name input, Boost Me/Again button, card/error area
└── components/
    └── Card/
        └── ComplimentCard.tsx   # Already exists — receives name + compliment props
```

### Pattern 1: Firebase Singleton Initialization

**What:** Initialize the Firebase app, AI instance, and Remote Config once in a dedicated module. Export reusable instances.

**When to use:** Any time multiple hooks or components would otherwise each call `initializeApp()`.

**Example:**
```typescript
// src/lib/firebase.ts
// Source: https://firebase.google.com/docs/ai-logic/get-started

import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

// Remote Config — fetch model name at startup
const remoteConfig = getRemoteConfig(firebaseApp);
remoteConfig.settings.minimumFetchIntervalMillis = 3_600_000; // 1 hour
remoteConfig.defaultConfig = { model_name: "gemini-2.5-flash" };

export async function getModelName(): Promise<string> {
  try {
    await fetchAndActivate(remoteConfig);
  } catch {
    // Silently fall back to default
  }
  return getValue(remoteConfig, "model_name").asString();
}

// AI instance — model name resolved at call time
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export async function createModel(modelName: string) {
  return getGenerativeModel(ai, {
    model: modelName,
    systemInstruction: `You are the Grand Compliment Oracle of EgoBoost 3000.
      Your sole purpose is to deliver absurdly dramatic, peak-hyperbole compliments
      about the person whose name you are given. Think borderline mythological —
      "The sun itself pauses each morning just to watch you rise."
      Write exactly 2-3 sentences. Weave the person's name naturally into the text.
      Never make specific assumptions about their traits (smart, funny, athletic).
      Keep it universal — every compliment works for any human alive.`,
    generationConfig: {
      temperature: 1.4,       // High creativity for dramatic flair
      maxOutputTokens: 120,   // 2-3 sentences max
    },
  });
}
```

### Pattern 2: useCompliment Hook — Four-State Machine

**What:** A custom React hook that owns the full generate-compliment lifecycle as a discriminated union state. Components read state, call `generate(name)`.

**When to use:** Any component needing to trigger generation and react to its status.

**Example:**
```typescript
// src/hooks/useCompliment.ts
// Source: https://firebase.google.com/docs/ai-logic/generate-text

import { useState, useCallback, useRef } from "react";
import { getModelName, createModel } from "../lib/firebase";

type ComplimentState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "result"; name: string; compliment: string }
  | { status: "error" };

export function useCompliment() {
  const [state, setState] = useState<ComplimentState>({ status: "idle" });
  const isFlyingRef = useRef(false); // debounce: prevents double-fire

  const generate = useCallback(async (name: string) => {
    if (isFlyingRef.current) return; // debounce guard
    isFlyingRef.current = true;
    setState({ status: "generating" });

    try {
      const modelName = await getModelName();
      const model = await createModel(modelName);
      const result = await model.generateContent(
        `Generate a compliment for: ${name}`
      );
      const compliment = result.response.text().trim();
      setState({ status: "result", name, compliment });
    } catch {
      // All errors map to single friendly message — no raw errors surface
      setState({ status: "error" });
    } finally {
      isFlyingRef.current = false;
    }
  }, []);

  return { state, generate };
}
```

### Pattern 3: MainScreen — Controlled Input + Conditional Render

**What:** MainScreen reads `useCompliment` state and renders the correct UI region based on `state.status`. The same `<button>` element changes label; no separate component instances.

**When to use:** Whenever state.status determines which UI region to show.

```typescript
// src/screens/MainScreen.tsx (sketch — exact styles TBD by planner)
export default function MainScreen() {
  const [name, setName] = useState("");
  const { state, generate } = useCompliment();
  const inputRef = useRef<HTMLInputElement>(null);

  // GEN-01: auto-focus on load
  useEffect(() => { inputRef.current?.focus(); }, []);

  const isGenerating = state.status === "generating";
  const hasResult = state.status === "result";
  const hasError = state.status === "error";
  const canGenerate = name.trim().length >= 3 && !isGenerating;

  return (
    <div>
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your cosmic name here..."
        maxLength={40}          // Claude's discretion — fits ComplimentCard layout
        autoComplete="off"
      />

      <button
        onClick={() => generate(name.trim())}
        disabled={!canGenerate}
      >
        {isGenerating ? "Boosting..." : hasResult ? "Boost Again" : "Boost Me"}
      </button>

      {/* Card area: hidden during idle/generating, shown after result */}
      {hasResult && (
        <ComplimentCard name={state.name} compliment={state.compliment} />
      )}

      {/* Error area: replaces card, never shows raw error */}
      {hasError && (
        <div>
          <p>Even the universe needs a coffee break. Try again?</p>
          <button onClick={() => generate(name.trim())}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Calling `initializeApp()` more than once:** Crashes with "Firebase App named '[DEFAULT]' already exists." Initialize in a module-level singleton, not inside a hook or component.
- **Reading `response.text()` before checking for errors:** The SDK throws on non-2xx responses; always wrap in try/catch and call `.text()` inside the try block.
- **Showing `error.message` to users:** Firebase AI Logic error messages include quota details and internal codes. Map all errors to a single user-friendly string.
- **Creating a new model instance on every render:** `getGenerativeModel` is cheap but `createModel` involves async work (Remote Config fetch). Either cache the model or resolve once on first call.
- **Resetting state on every name keystroke:** The card should stay visible when name is edited — don't call `setState({ status: "idle" })` inside the name input's `onChange`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gemini API proxy | Custom server or serverless function | Firebase AI Logic (GoogleAIBackend) | Firebase proxies the Gemini key; any hand-rolled proxy adds deployment complexity and is out of scope for v2.0 local-dev milestone |
| Model name config | Hard-coded string in source | Firebase Remote Config `model_name` param | Gemini 2.0 Flash retires June 1 2026; Remote Config enables swap without code deploy |
| Debounce utility | Custom timer/flag logic | `useRef(false)` isFlyingRef guard | Simple ref flag is sufficient for preventing double-fire on a single async call; no library needed |
| Error classification | Switch on error.code | Catch-all → single friendly message | All error types map to the same user message per locked decision |

**Key insight:** Firebase AI Logic exists precisely to solve the "AI in the browser without exposing keys" problem. Everything else (error handling, state management) is standard React — no extra libraries required.

---

## Common Pitfalls

### Pitfall 1: Firebase App Initialized Twice

**What goes wrong:** Calling `initializeApp(firebaseConfig)` in two places (e.g., both `firebase.ts` and a hook) throws `FirebaseError: Firebase: Firebase App named '[DEFAULT]' already exists`.

**Why it happens:** Module bundlers may import the same file multiple times, or developers copy-paste initialization code.

**How to avoid:** Keep one `initializeApp()` call in `src/lib/firebase.ts`. Export the `firebaseApp` instance. All other files import the instance.

**Warning signs:** "App named DEFAULT already exists" error in the console on first load.

---

### Pitfall 2: Gemini API Key Accidentally Committed

**What goes wrong:** The Gemini API key (from AI Studio / Google Cloud console) ends up in `.env` and gets committed to git. This is distinct from the Firebase `apiKey` — the Firebase config `apiKey` is intentionally public, but the **Gemini API key** must never leave Firebase's servers.

**Why it happens:** Developers confuse "Firebase API key" (safe to expose, used to identify the app) with "Gemini API key" (secret, used to bill for model calls). Firebase AI Logic with `GoogleAIBackend` handles the Gemini key on Firebase's servers — the app never needs it.

**How to avoid:** The app only stores the Firebase project config in `.env`. Never create a `VITE_GEMINI_API_KEY` variable. If you find yourself needing a Gemini key in the frontend, stop — use the Firebase AI Logic SDK instead.

**Warning signs:** A `GEMINI_API_KEY` or `GOOGLE_AI_KEY` variable appearing in `import.meta.env`.

---

### Pitfall 3: Model Name Retirement Causes Silent Failures

**What goes wrong:** `gemini-2.0-flash` retires June 1, 2026. A hardcoded model name string means the app breaks in production with a 404 model-not-found error.

**Why it happens:** Model names are hardcoded at build time.

**How to avoid:** Store model name in Firebase Remote Config parameter `model_name` with default `gemini-2.5-flash`. The app fetches this at startup. To swap models, update Remote Config in the console — no code deploy.

**Warning signs:** 404 errors from Firebase AI Logic with "model not found" message after a model retirement date passes.

---

### Pitfall 4: Infinite Re-render Loop Exhausts Quota

**What goes wrong:** A `useEffect` with the generate function in its dependency array triggers on every render, firing dozens of API calls.

**Why it happens:** `generate` is a new function reference on each render if defined without `useCallback`; `useEffect` detects a new reference and re-runs.

**How to avoid:** Always wrap `generate` in `useCallback` with a stable dependency array. Use `isFlyingRef.current` guard as a secondary safety.

**Warning signs:** Console flooded with API calls; 429 quota-exceeded errors immediately on page load.

---

### Pitfall 5: Vite Env Variables Not Available at Runtime

**What goes wrong:** `import.meta.env.VITE_FIREBASE_API_KEY` is `undefined`, causing Firebase initialization to fail with "invalid API key".

**Why it happens:** Vite only exposes variables prefixed with `VITE_`. Variables named `FIREBASE_API_KEY` (without prefix) are not injected into the client bundle.

**How to avoid:** All Firebase config vars must use the `VITE_` prefix in `.env`. Example: `VITE_FIREBASE_API_KEY=AIza...`. Access via `import.meta.env.VITE_FIREBASE_API_KEY`.

**Warning signs:** Firebase initialization error "API key not valid" even though the key is correct in `.env`.

---

## Code Examples

Verified patterns from official sources:

### generateContent (non-streaming, Phase 3)
```typescript
// Source: https://firebase.google.com/docs/ai-logic/generate-text
const result = await model.generateContent("Generate a compliment for: Jordan");
const text = result.response.text(); // string
```

### getGenerativeModel with systemInstruction and generationConfig
```typescript
// Source: https://firebase.google.com/docs/ai-logic/system-instructions
// Source: https://firebase.google.com/docs/ai-logic/model-parameters
const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  systemInstruction: "You are a dramatic compliment oracle...",
  generationConfig: {
    temperature: 1.4,
    maxOutputTokens: 120,
  },
});
```

### Remote Config model name fetch
```typescript
// Source: https://firebase.google.com/docs/ai-logic/solutions/remote-config
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const remoteConfig = getRemoteConfig(firebaseApp);
remoteConfig.defaultConfig = { model_name: "gemini-2.5-flash" };
await fetchAndActivate(remoteConfig);
const modelName = getValue(remoteConfig, "model_name").asString();
```

### Vite environment variables for Firebase config
```typescript
// Source: https://vite.dev/guide/env-and-mode
// .env file (never commit to git):
// VITE_FIREBASE_API_KEY=AIza...
// VITE_FIREBASE_PROJECT_ID=egoboost-3000

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... etc
};
```

### TypeScript env type augmentation (vite-env.d.ts)
```typescript
// src/vite-env.d.ts (add alongside existing declarations)
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vertex AI in Firebase (separate package) | Firebase AI Logic (`firebase/ai`) | May 2025 | Single package, cleaner API, same proxy behavior |
| `gemini-2.0-flash` | `gemini-2.5-flash` (stable) or `gemini-3-flash-preview` | July 2025 / Dec 2025 | 2.0 Flash retires June 1 2026; 2.5-flash stable with no-earlier-than June 2026 retirement |
| Hardcoded model string | Remote Config `model_name` param | Firebase recommendation (ongoing) | Zero-downtime model swaps |

**Deprecated / outdated:**
- `gemini-2.0-flash`: Retires June 1, 2026. Do not use as the default model name. Use `gemini-2.5-flash` instead.
- `@firebase/vertexai` (old separate package): Replaced by `firebase/ai` sub-path in the main `firebase` package.

---

## Open Questions

1. **Firebase project must exist before code is written**
   - What we know: A Firebase project with AI Logic enabled is a hard prerequisite (from STATE.md blockers)
   - What's unclear: This is a manual console step the developer must complete; it cannot be scripted
   - Recommendation: Plan 03-01 should begin with a manual checklist task: create Firebase project, enable AI Logic, copy firebaseConfig to `.env`

2. **Remote Config fetch on every app load vs. session caching**
   - What we know: `minimumFetchIntervalMillis = 3_600_000` (1 hour) prevents quota abuse; default values are used if fetch fails
   - What's unclear: Whether to await the fetch before showing the UI or fire-and-forget with a default
   - Recommendation: Fire-and-forget with fallback to default `gemini-2.5-flash`; the 1-hour cache means most sessions reuse the cached value anyway

3. **Model instance creation cost (per-generate vs. module-level)**
   - What we know: `getGenerativeModel` is synchronous and cheap; Remote Config fetch is async
   - What's unclear: Whether to create the model once at module level or lazily on first generate call
   - Recommendation: Lazy creation inside the hook on first call; cache in a ref to avoid re-creating on subsequent generates

---

## Validation Architecture

nyquist_validation is enabled in config.json.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 must add Vitest |
| Config file | `vitest.config.ts` — does not exist yet (Wave 0) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEN-01 | Name input enforces 3-char minimum; button disabled below threshold | unit | `npx vitest run src/hooks/useCompliment.test.ts` | Wave 0 |
| GEN-02 | generateContent called via Firebase AI Logic (not direct API) | unit (mock firebase/ai) | `npx vitest run src/hooks/useCompliment.test.ts` | Wave 0 |
| GEN-04 | Calling generate() again from result state produces new compliment | unit | `npx vitest run src/hooks/useCompliment.test.ts` | Wave 0 |
| GEN-05 | Thrown error transitions state to "error"; no raw error string exposed | unit | `npx vitest run src/hooks/useCompliment.test.ts` | Wave 0 |
| GEN-01 (UI) | "Boost Me" → "Boosting..." → "Boost Again" label transitions | integration (render) | `npx vitest run src/screens/MainScreen.test.tsx` | Wave 0 |
| GEN-05 (UI) | Error area renders with "Try Again" button; no API error text visible | integration (render) | `npx vitest run src/screens/MainScreen.test.tsx` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/hooks/useCompliment.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — Vitest configuration (jsdom environment for React)
- [ ] Install: `npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event jsdom`
- [ ] `src/hooks/useCompliment.test.ts` — covers GEN-01, GEN-02, GEN-04, GEN-05 (hook unit tests with firebase/ai mocked)
- [ ] `src/screens/MainScreen.test.tsx` — covers GEN-01 UI, GEN-05 UI (render tests with useCompliment mocked)

---

## Sources

### Primary (HIGH confidence)
- `https://firebase.google.com/docs/ai-logic/get-started` — SDK init, package install, generateContent
- `https://firebase.google.com/docs/ai-logic/generate-text` — generateContent and generateContentStream API
- `https://firebase.google.com/docs/ai-logic/models` — Current model names, retirement dates (gemini-2.5-flash, gemini-2.5-flash-lite, gemini-3-flash-preview)
- `https://firebase.google.com/docs/ai-logic/system-instructions` — systemInstruction parameter in getGenerativeModel
- `https://firebase.google.com/docs/ai-logic/solutions/remote-config` — Remote Config + AI Logic integration pattern
- `https://firebase.google.com/docs/ai-logic/faq-and-troubleshooting` — Error codes (400, 403, 404, 429) and resolutions
- `https://firebase.google.com/docs/remote-config/web/get-started` — Remote Config web setup
- `https://vite.dev/guide/env-and-mode` — VITE_ prefix requirement, import.meta.env

### Secondary (MEDIUM confidence)
- Firebase search results confirming GoogleAIBackend = free tier Spark plan; VertexAIBackend = Blaze plan required
- Multiple sources confirming Firebase `apiKey` is safe to expose in client; Gemini API key is NOT

### Tertiary (LOW confidence)
- Community patterns for useReducer state machines (discriminated union for idle/loading/result/error)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Verified via official Firebase AI Logic docs; package name and API confirmed
- Architecture: HIGH — Code patterns verified from official docs and Firebase SDK reference
- Pitfalls: HIGH — Quota/key confusion verified from official troubleshooting page; env var pattern verified from Vite docs
- Model names and retirement: HIGH — Verified directly from https://firebase.google.com/docs/ai-logic/models

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable APIs; check model retirement if used after June 2026)

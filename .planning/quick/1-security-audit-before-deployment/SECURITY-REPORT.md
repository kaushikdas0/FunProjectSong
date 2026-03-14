# Security Audit Report — EgoBoost 3000

## Audit Date: 2026-03-14

## Auditor: Claude Sonnet 4.6 (automated read-only review)

---

## Summary

| Category | Status | Notes |
|---|---|---|
| 1. Secrets & API Key Exposure | GREEN | No secrets in source; .env never committed |
| 2. Input Sanitization & XSS | GREEN | React escaping, no innerHTML, 40-char limit |
| 3. Dependency Security | GREEN | 0 vulnerabilities (npm audit) |
| 4. CORS & Network Security | YELLOW | No security headers configured in firebase.json |
| 5. Content Security Policy | YELLOW | No CSP set in index.html or hosting config |
| 6. Firebase-Specific Security | YELLOW | App Check not enabled; model_name manipulable via Remote Config |
| 7. OWASP Top 10 | GREEN | No critical OWASP issues for this app architecture |

**Overall verdict: YELLOW — Safe to deploy, with two recommended pre-deployment improvements (CSP headers, App Check).**

---

## Detailed Findings

### Category 1: Secrets and API Key Exposure

**Finding 1.1 — .env never committed to git history**
- Severity: Info
- Finding: `git log --all --diff-filter=A -- ".env"` returns no output. The .env file was never staged or committed in any branch. Git history containing the string `VITE_FIREBASE_API_KEY=` traces only to `.env.example`, README.md (documentation), and `src/vite-env.d.ts` (TypeScript type declarations) — none of which contain real values.
- Recommendation: None required. Confirmed clean.

**Finding 1.2 — .env correctly gitignored**
- Severity: Info
- Finding: `.gitignore` contains `.env` on line 5. The pattern is specific (exact match `.env`, not a glob), which is correct since `.env.example` must remain trackable.
- Recommendation: None required. Correct as-is.

**Finding 1.3 — .env.example contains only empty placeholder values**
- Severity: Info
- Finding: All six variables in `.env.example` have empty values (`VITE_FIREBASE_API_KEY=`, etc.). No real credentials present.
- Recommendation: None required.

**Finding 1.4 — Firebase API key exposed in browser bundle (by design)**
- Severity: Low (by design, not a defect)
- Finding: `src/lib/firebase.ts` reads all six Firebase config values from `import.meta.env.VITE_FIREBASE_*`. Vite inlines VITE_ prefixed env vars into the JS bundle at build time. Anyone who visits the deployed site can extract the API key from the bundle. This is intentional and expected behavior for Firebase browser SDKs.
- Context: Firebase browser API keys are not secrets. They identify your project (not authenticate you). Security is enforced by Firebase Security Rules, API key restrictions in Google Cloud Console, and optionally Firebase App Check. Firebase explicitly documents this in their architecture.
- Recommendation (Medium priority): Restrict the Firebase API key in Google Cloud Console to only the deployed hostname (e.g., `egoboost3000-a2cfc.web.app` and your custom domain if any). This is a single click in Google Cloud Console > Credentials. Prevents the key from being usable from unauthorized origins.

**Finding 1.5 — No hardcoded secrets in source files**
- Severity: Info
- Finding: Full grep of `src/` for patterns `AIza`, `sk-`, `secret`, `password`, `token`, `api_key`, `apikey` (case-insensitive) returned no matches on actual credential values. The matches were: config keys read from `import.meta.env`, a TypeScript type declaration, and code comments — all clean.
- Recommendation: None required.

---

### Category 2: Input Sanitization and XSS

**Finding 2.1 — No dangerouslySetInnerHTML anywhere in codebase**
- Severity: Info
- Finding: Full grep of `src/` for `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, and `document.write` returned zero matches. All user-provided content is rendered via JSX text nodes, which React auto-escapes.
- Recommendation: None required. Correct as-is.

**Finding 2.2 — Name input has maxLength=40 constraint**
- Severity: Info
- Finding: `MainScreen.tsx` line 87: `maxLength={40}` on the text input. This limits prompt injection attack surface in the browser, though it is a client-side control only.
- Note: The 40-character limit is enforced at the browser level only. A direct API call bypassing the UI would not be limited. However, this is acceptable because: (a) the Firebase AI Logic SDK authenticates with your Firebase project's credentials, and (b) even without the limit, the worst outcome is a modified AI prompt, not data exfiltration.
- Recommendation: None critical. The existing minimum-length validation (`name.trim().length >= 3`) also prevents empty submissions.

**Finding 2.3 — AI prompt injection risk (Low)**
- Severity: Low
- Finding: `useCompliment.ts` line 24: `` `Generate a compliment for: ${name}` `` — user-controlled text is interpolated directly into the AI prompt. A user could enter text like `"Ignore all previous instructions and..."` to attempt prompt injection.
- Assessment: This is a well-known class of risk for LLM applications. The practical impact here is low: the system instruction is strong and role-specific ("You are the Grand Compliment Oracle..."), the temperature is high (1.4 — creative, not instruction-following), and the app has no privileged actions to hijack (no data storage, no authentication, no side effects). The worst outcome of a successful injection is a weird compliment.
- Recommendation: No code change required for deployment. Future hardening option: add a user prompt wrapper like `` `The person's name is: ${name}. Write a compliment for them.` `` which makes injection harder without limiting legitimate use.

**Finding 2.4 — html-to-image renders DOM to canvas**
- Severity: Low
- Finding: `downloadCard.ts` uses `html-to-image` to capture a DOM node as PNG. The library clones the target node and serializes it to SVG/canvas. If the captured node contained unsanitized HTML, this could theoretically capture injected content. However, the `ComplimentCard` component only receives `name` (string) and `compliment` (AI-generated string), both rendered as JSX text nodes. No raw HTML is in the capture target.
- Recommendation: None required. Risk is theoretical given the current rendering pattern.

---

### Category 3: Dependency Security

**Finding 3.1 — npm audit: 0 vulnerabilities**
- Severity: Info
- Finding: `npm audit` run 2026-03-14 returned `found 0 vulnerabilities` across all production and development dependencies.
- Recommendation: Re-run `npm audit` before any future deployment after dependency updates.

**Finding 3.2 — Key dependency versions reviewed**
- Severity: Info
- Finding: All major dependencies are on current major versions as of audit date:
  - `firebase: ^12.10.0` — Firebase v12 is the current major, Firebase AI Logic was added in v12
  - `react: ^19.2.4` — React 19 (current stable)
  - `html-to-image: ^1.11.13` — No known CVEs
  - `vite: ^8.0.0` — Current major
  - `react-router-dom: ^7.13.1` — Current major
- Recommendation: None. All dependencies are current.

**Finding 3.3 — html-to-image known limitation (not a security issue)**
- Severity: Info
- Finding: GitHub issue #412 for html-to-image documents that self-hosted fonts may not embed when running on localhost (CORS restriction on font fetching). This is a localhost-only developer experience issue, not a security concern. The `downloadCard.ts` already wraps `getFontEmbedCSS` in a try/catch (line 14-18) so font fetch failure degrades gracefully.
- Recommendation: Test card download on the staging Firebase Hosting URL before promoting to production (already noted as a risk in STATE.md).

---

### Category 4: CORS and Network Security

**Finding 4.1 — No security headers in firebase.json (Medium)**
- Severity: Medium
- Finding: `firebase.json` configures only `rewrites` (SPA fallback to `index.html`). No `headers` block is present. Firebase Hosting serves no security headers by default: no `X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`.
- Impact: Without `X-Frame-Options: DENY`, the app can be embedded in an iframe on any domain (clickjacking risk). Without `X-Content-Type-Options: nosniff`, browsers may MIME-sniff responses.
- Recommendation (High priority): Add a security headers block to `firebase.json` (see Pre-Deployment Checklist for exact config).

**Finding 4.2 — No custom CORS headers needed**
- Severity: Info
- Finding: The app has no backend server and makes no same-origin API calls. All external requests go through the Firebase SDK to Google's infrastructure, which handles its own CORS. No custom CORS configuration is needed.
- Recommendation: None required.

---

### Category 5: Content Security Policy (CSP)

**Finding 5.1 — No CSP configured (Medium)**
- Severity: Medium
- Finding: `index.html` contains no `<meta http-equiv="Content-Security-Policy">` tag. `firebase.json` contains no `Content-Security-Policy` header. The app runs without any CSP restriction.
- Impact: Without CSP, if an XSS vulnerability were introduced in the future, there would be no browser-level mitigation. CSP is defense-in-depth.
- Mitigating factors: No `dangerouslySetInnerHTML` is used anywhere; React's JSX rendering auto-escapes all user content. The current XSS risk is very low, making CSP a hardening measure rather than an urgent fix.
- Recommendation (Medium priority): Add CSP via Firebase Hosting headers (preferred over meta tag, as meta tags cannot restrict `frame-ancestors`). See Pre-Deployment Checklist for a CSP suitable for this app's Firebase + Gemini architecture. Note: crafting a correct CSP for Firebase AI Logic requires allowing `https://*.googleapis.com` and `https://*.firebaseio.com`, which may require testing.

---

### Category 6: Firebase-Specific Security

**Finding 6.1 — Firebase App Check not enabled**
- Severity: Low
- Finding: No App Check configuration is present in `src/lib/firebase.ts`. App Check (using reCAPTCHA v3 or DeviceCheck) would allow Firebase to verify requests come from the legitimate web app, not from automated scripts or other origins using the extracted API key.
- Impact: Without App Check, anyone who extracts the API key from the bundle can make Gemini API calls that count against your Firebase AI Logic quota. Given Firebase's free tier limits (Gemini 2.5 Flash has generous free quotas), this is a low-cost abuse risk for this app.
- Recommendation (Low priority, post-launch): Enable Firebase App Check with reCAPTCHA v3 for web. This is a two-step addition: register the app in Firebase Console, add `initializeAppCheck()` to `firebase.ts`. Not required for initial deployment but recommended before any significant traffic.

**Finding 6.2 — Remote Config model_name is unauthenticated**
- Severity: Low
- Finding: `getRemoteConfig` fetches `model_name` from Firebase Remote Config. Remote Config fetch does not require authentication — any client with the API key can fetch Remote Config values. However, only users with Firebase Console access can write to Remote Config. The attack vector would be: attacker extracts API key → fetches Remote Config → cannot change `model_name` without Console access. The model_name value flows into `getGenerativeModel(ai, { model: modelName })` which would simply fail gracefully if given an invalid model name.
- Recommendation: None required. The write-side of Remote Config is properly protected by Firebase IAM.

**Finding 6.3 — No Firestore / Storage / Auth rules to review**
- Severity: Info
- Finding: The app uses only Firebase AI Logic and Remote Config. No Firestore, Realtime Database, Cloud Storage, or Firebase Auth is used. No Security Rules need review.
- Recommendation: None required.

**Finding 6.4 — System instruction provides some prompt injection resilience**
- Severity: Info
- Finding: The system instruction in `createModel()` is strongly role-constraining ("Your sole purpose is to deliver absurdly dramatic, peak-hyperbole compliments...") and uses a high temperature (1.4). The high temperature makes the model less instruction-following in general, which cuts both ways: it resists boring injections but is also more creative/unpredictable. For this app's use case (fun compliments, no sensitive data, no privileged actions), this is acceptable.
- Recommendation: None required for deployment.

---

### Category 7: OWASP Top 10 Relevance (2021)

| OWASP ID | Category | Relevance | Assessment |
|---|---|---|---|
| A01 | Broken Access Control | Low | No user accounts, no per-user data, no admin functions. No access control to break. |
| A02 | Cryptographic Failures | Low | No sensitive data stored or transmitted (only AI-generated compliments). HTTPS enforced by Firebase Hosting. No custom crypto. |
| A03 | Injection | Low | SQL injection N/A (no DB). AI prompt injection possible but low-impact (see Finding 2.3). No shell/command execution. |
| A04 | Insecure Design | Low | App is simple and single-purpose. No authentication flows, no payment flows, no sensitive user journeys to design securely. |
| A05 | Security Misconfiguration | Medium | Missing security headers in firebase.json (see Findings 4.1, 5.1). Firebase API key not restricted to deployment hostname (see Finding 1.4). |
| A06 | Vulnerable Components | Green | npm audit shows 0 vulnerabilities. All dependencies are current major versions. |
| A07 | Authentication Failures | N/A | No authentication in this app. Not applicable. |
| A08 | Data Integrity Failures | Low | No deserialization of untrusted data. Remote Config is the only remote data source and is Google-managed. |
| A09 | Logging Failures | Low | No server-side logging (no backend). Client-side errors are swallowed intentionally for UX (error state shows friendly message). No sensitive data to log. |
| A10 | SSRF | N/A | No backend server to make server-side requests. Client makes requests directly to Google APIs. Not applicable. |

---

## Recommendations Priority List

### High Priority (address before launch)

1. **Add security headers to firebase.json** (Findings 4.1)
   - Add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - Exact config provided in Pre-Deployment Checklist below.

### Medium Priority (address before or shortly after launch)

2. **Add Content Security Policy** (Finding 5.1)
   - Add `Content-Security-Policy` header to firebase.json hosting headers
   - Requires testing to ensure Firebase AI Logic's outbound domains are allowed
   - Starter policy provided in Pre-Deployment Checklist below.

3. **Restrict Firebase API key to deployment hostname** (Finding 1.4)
   - In Google Cloud Console > Credentials, restrict the API key to `https://egoboost3000-a2cfc.web.app` and any custom domain.

### Low Priority (post-launch hardening)

4. **Enable Firebase App Check** (Finding 6.1)
   - Prevents API quota abuse from bots using the extracted API key.
   - Use reCAPTCHA v3 for web.
   - Add after launch once you have a stable hostname.

5. **Harden AI prompt structure** (Finding 2.3)
   - Change `` `Generate a compliment for: ${name}` `` to `` `The person's name is: ${name}. Write a compliment for them.` ``
   - Minor injection hardening, no functional impact.

---

## Pre-Deployment Checklist

### Must-Do Before Going Live

- [x] `.env` file is gitignored — CONFIRMED CLEAN
- [x] `.env.example` contains only empty placeholder values — CONFIRMED CLEAN
- [x] No hardcoded secrets in `src/` — CONFIRMED CLEAN
- [x] No `dangerouslySetInnerHTML` in codebase — CONFIRMED CLEAN
- [x] `npm audit` passes with 0 vulnerabilities — CONFIRMED CLEAN
- [x] Firebase config reads from `import.meta.env` (not hardcoded) — CONFIRMED CLEAN
- [ ] **Add security headers to firebase.json** — ACTION REQUIRED

  Add to `firebase.json` inside the `"hosting"` block:
  ```json
  "headers": [
    {
      "source": "**",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
  ```

- [ ] **Restrict Firebase API key in Google Cloud Console** — RECOMMENDED
  - Google Cloud Console > APIs & Services > Credentials > select your API key > Application restrictions > HTTP referrers
  - Add: `https://egoboost3000-a2cfc.web.app/*` and `https://egoboost3000-a2cfc.firebaseapp.com/*`

### Post-Launch (When Ready)

- [ ] Add Content Security Policy header to firebase.json
- [ ] Enable Firebase App Check (reCAPTCHA v3)
- [ ] Test card download on staging URL for font embedding (html-to-image localhost CORS known issue)

---

## Notes on Scope

This audit covers the client-side codebase as deployed to Firebase Hosting. It does not cover:
- Firebase Console configuration (Firestore rules, Storage rules, Auth settings) — none of these services are used
- Google Cloud IAM configuration — outside scope of this repo
- Network-level security (DDoS protection, rate limiting) — provided by Firebase/Google infrastructure automatically
- Social engineering or phishing attacks

The app's security posture is appropriate for a client-side fun app with no user data storage. The two medium-priority items (security headers and CSP) are standard hygiene for any web deployment and should be addressed before launch.

---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: [".planning/quick/1-security-audit-before-deployment/SECURITY-REPORT.md"]
autonomous: true
must_haves:
  truths:
    - "All source files audited for hardcoded secrets"
    - "Git history verified clean of .env commits"
    - "Dependency vulnerabilities checked"
    - "Input handling and XSS vectors reviewed"
    - "Firebase configuration security assessed"
    - "OWASP Top 10 relevance evaluated"
  artifacts:
    - path: ".planning/quick/1-security-audit-before-deployment/SECURITY-REPORT.md"
      provides: "Complete security audit report with findings and recommendations"
---

<objective>
Perform a read-only security audit of the EgoBoost 3000 codebase before deployment.

Purpose: Identify security risks before the app goes live on Firebase Hosting (public repo, client-side Firebase AI app).
Output: A SECURITY-REPORT.md documenting all findings, risk levels, and recommendations.
</objective>

<context>
This is a client-side React app (Vite + React 19 + Tailwind v4) deployed to Firebase Hosting.
It uses Firebase AI Logic (Gemini) for AI generation and Firebase Remote Config for model selection.
The repo is PUBLIC on GitHub (kaushikdas0/FunProjectSong).
There is no backend server — all logic runs in the browser.

Key files to audit:
- src/lib/firebase.ts — Firebase init, AI model creation, Remote Config
- src/hooks/useCompliment.ts — AI prompt construction with user input
- src/lib/downloadCard.ts — DOM-to-PNG capture
- src/screens/MainScreen.tsx — User input handling
- src/components/Card/ComplimentCard.tsx — Renders user-provided text
- .env / .env.example — Environment variable handling
- .gitignore — Secret exclusion rules
- index.html — CSP headers, meta tags
- vite.config.ts — Build configuration
- firebase.json — Hosting configuration
- package.json — Dependencies

Known context from prior work:
- .env is in .gitignore and was never committed to git history
- .env.example exists with empty values (safe)
- Firebase API keys are designed to be public (restricted via Firebase Security Rules, not secrecy)
- npm audit shows 0 vulnerabilities
- Repo is public (confirmed via GitHub API)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Comprehensive security audit and report generation</name>
  <files>.planning/quick/1-security-audit-before-deployment/SECURITY-REPORT.md</files>
  <action>
READ-ONLY AUDIT. Do NOT modify any source files.

Perform a systematic security review covering all categories below, then write findings to SECURITY-REPORT.md.

**1. Secrets and API Key Exposure**
- Verify .env is gitignored and never committed (check git log --all -- ".env")
- Verify no hardcoded API keys, tokens, or secrets in any source file (grep for patterns like AIza, sk-, key=, secret, password, token across all src/ files)
- Assess Firebase API key exposure: Firebase browser API keys are intentionally public but must be restricted via Firebase Console (App Check, Security Rules, API restrictions). Document whether restrictions are configured or recommended.
- Check if .env.example leaks any real values

**2. Input Sanitization and XSS**
- Review MainScreen.tsx: user types a name, passed to useCompliment.generate()
- Review useCompliment.ts: name is interpolated into AI prompt string (line 23: `Generate a compliment for: ${name}`). Assess prompt injection risk — can a malicious name manipulate the AI prompt?
- Review ComplimentCard.tsx: name and compliment rendered as text content in `<p>` tags. React auto-escapes JSX text, so assess whether dangerouslySetInnerHTML is used anywhere (it should NOT be).
- Check input maxLength constraint (40 chars on the input)
- Check for any use of eval(), innerHTML, document.write, or other unsafe DOM APIs

**3. Dependency Security**
- Run and document `npm audit` results
- Check for any dependencies with known issues not caught by npm audit
- Review html-to-image usage for any known XSS vectors (it renders DOM to canvas)

**4. CORS and Network Security**
- Review firebase.json hosting config for security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- Check if any custom CORS headers are set in Vite config
- Note: no backend means no custom API CORS to configure

**5. Content Security Policy (CSP)**
- Check index.html for CSP meta tags
- Recommend CSP headers for Firebase Hosting if missing

**6. Firebase-Specific Security**
- Assess whether Firebase App Check should be enabled to prevent API abuse
- Review Remote Config usage — can a malicious actor manipulate model_name?
- Review AI prompt for jailbreak/injection resilience
- Check if any Firestore/Storage/Auth rules need review (or if those services are even enabled)

**7. OWASP Top 10 Relevance**
For each OWASP Top 10 (2021) category, briefly state relevance:
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Authentication Failures
- A08: Data Integrity Failures
- A09: Logging Failures
- A10: SSRF

**Report format:**
Use the following structure in SECURITY-REPORT.md:
```
# Security Audit Report — EgoBoost 3000
## Audit Date: {today}
## Summary (traffic light: GREEN/YELLOW/RED per category)
## Detailed Findings (one section per category above)
  - Finding, severity (Critical/High/Medium/Low/Info), recommendation
## Recommendations Priority List (ordered by severity)
## Pre-Deployment Checklist
```
  </action>
  <verify>
    <automated>test -f .planning/quick/1-security-audit-before-deployment/SECURITY-REPORT.md && grep -q "OWASP" .planning/quick/1-security-audit-before-deployment/SECURITY-REPORT.md && grep -q "Recommendations" .planning/quick/1-security-audit-before-deployment/SECURITY-REPORT.md && echo "PASS"</automated>
  </verify>
  <done>SECURITY-REPORT.md exists with all 7 audit categories covered, findings documented with severity levels, and a prioritized recommendations list.</done>
</task>

</tasks>

<verification>
- SECURITY-REPORT.md exists and is comprehensive
- All 7 audit categories addressed
- No source files were modified (read-only audit)
- Findings include severity ratings and actionable recommendations
</verification>

<success_criteria>
- Complete security report covering secrets, XSS, dependencies, CORS, CSP, Firebase security, and OWASP Top 10
- Each finding has a severity level and recommendation
- Pre-deployment checklist included
- Zero source code modifications
</success_criteria>

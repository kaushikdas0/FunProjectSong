<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="EgoBoost 3000" />
</p>

<h1 align="center">EgoBoost 3000</h1>

<p align="center">
  <em>Absurdly dramatic, AI-generated compliments that make anyone's day.</em>
</p>

<p align="center">
  <a href="https://egoboost3000-a2cfc.web.app"><img src="https://img.shields.io/badge/Try_it_live-egoboost3000-E8A598?style=for-the-badge&logoColor=white" alt="Try it live" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/React_19-5A4A6F?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Gemini_AI-7A97BE?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Firebase-D98A7A?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase" />
</p>

---

<p align="center">
  <img src="docs/preview.png" width="360" alt="EgoBoost 3000 — type a name, get an AI compliment, download as a card" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/tuomas_boost_card.png" width="240" alt="Example downloadable compliment card" />
</p>

---

## What is this?

Type a name. Tap **Boost Me**. Watch an over-the-top compliment stream in letter by letter on a beautiful card. Download it as a PNG and share it.

That's it. One screen, one button, one smile.

## Try it

**[egoboost3000-a2cfc.web.app](https://egoboost3000-a2cfc.web.app)**

## Run it yourself

### 1. Clone and install

```bash
git clone https://github.com/anthropics/FunProjectSong.git
cd FunProjectSong
npm install
```

### 2. Create a Firebase project

You need a free Firebase project to power the AI compliments:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Click the **web icon** (`</>`) to register a web app
3. In the sidebar, click **AI Logic** and enable it (free Spark plan works)

### 3. Set up your `.env` file

```bash
cp .env.example .env
```

Fill in the values from your Firebase project config:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

> The Firebase `apiKey` just identifies your project — it's not a secret. The Gemini API key stays on Firebase's servers.

### 4. Run it

```bash
npm run dev
```

## Deploy your own

```bash
npm run build
firebase deploy --only hosting
```

Uses Firebase Hosting free tier.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run test` | Run test suite |
| `npm run lint` | ESLint check |

## Built with

<table>
  <tr>
    <td align="center" width="140"><strong>React 19</strong><br/><sub>UI framework</sub></td>
    <td align="center" width="140"><strong>TypeScript</strong><br/><sub>Type safety</sub></td>
    <td align="center" width="140"><strong>Tailwind CSS 4</strong><br/><sub>Styling</sub></td>
    <td align="center" width="140"><strong>Vite 8</strong><br/><sub>Bundler</sub></td>
  </tr>
  <tr>
    <td align="center" width="140"><strong>Firebase AI Logic</strong><br/><sub>Gemini AI (free)</sub></td>
    <td align="center" width="140"><strong>Firebase Hosting</strong><br/><sub>Free hosting</sub></td>
    <td align="center" width="140"><strong>Pixelarticons</strong><br/><sub>Icon set</sub></td>
    <td align="center" width="140"><strong>Caveat</strong><br/><sub>Handwriting font</sub></td>
  </tr>
</table>

---

<p align="center">
  <sub>Made with <img src="https://img.shields.io/badge/Claude_Code-5A4A6F?style=flat&logoColor=white" alt="Claude Code" align="center" /> by Anthropic</sub>
</p>

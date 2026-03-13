# EgoBoost 3000

A fun app that generates absurdly dramatic, over-the-top compliments for anyone. Type a name, tap a button, and let AI make someone's day.

Built with React, TypeScript, Tailwind CSS, and Firebase AI Logic (Gemini).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd FunProjectSong
npm install
```

### 2. Create a Firebase project

You need a free Firebase project to power the AI compliments. Here's how:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and give it a name (anything you like)
3. Once the project is created, click the **web icon** (`</>`) on the project overview page to register a web app
4. Give your web app a nickname (e.g. "EgoBoost 3000") and click **Register app**
5. Firebase will show you a config object with values like `apiKey`, `authDomain`, etc. — keep this page open, you'll need these in step 4

### 3. Enable AI Logic (Gemini)

Still in the Firebase Console:

1. In the left sidebar, click **AI Logic**
2. Click **Get started** and follow the prompts to enable it
3. That's it — this turns on the Gemini API for your project. No billing required, the free Spark plan works

### 4. Set up your `.env` file

Copy the example file and fill in your Firebase config values:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholders with the values from step 2:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

> **Is this safe?** Yes — the Firebase `apiKey` just identifies your project. It's not a secret. The actual Gemini API key stays on Firebase's servers and never touches your code.

### 5. Run it

```bash
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

## Deploying

This project uses Firebase Hosting (free tier). To deploy your own copy:

1. Install the [Firebase CLI](https://firebase.google.com/docs/cli) if you haven't already
2. Log in: `firebase login`
3. Build and deploy:

```bash
npm run build
firebase deploy --only hosting
```

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the local development server       |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run ESLint to check for code issues      |

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Utility-first styling
- **Vite 8** — Dev server and bundler
- **React Router** — Client-side routing
- **Firebase AI Logic** — Gemini AI via `firebase/ai` (free tier)
- **Firebase Hosting** — Free static hosting

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

// Remote Config — fetch model name at startup, with 1-hour cache
const remoteConfig = getRemoteConfig(firebaseApp);
remoteConfig.settings.minimumFetchIntervalMillis = 3_600_000;
remoteConfig.defaultConfig = { model_name: "gemini-2.5-flash" };

export async function getModelName(): Promise<string> {
  try {
    await fetchAndActivate(remoteConfig);
  } catch {
    // Silently fall back to default model name
  }
  return getValue(remoteConfig, "model_name").asString();
}

// AI instance — initialized once as singleton
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export function createModel(modelName: string) {
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
      temperature: 1.4,
      maxOutputTokens: 120,
    },
  });
}

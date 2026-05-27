// Client Firebase initialization — singleton across HMR reloads.
// Used by client components only. For server-side (API routes), use lib/firebase-admin.ts
// (will be added in Phase 4 when we need to verify ID tokens on the chat endpoint).

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fail loudly if env vars are missing — clearer than Firebase's downstream error.
function assertConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Firebase env vars missing: ${missing.join(', ')}. ` +
        `Fill them in zora-app/.env.local (see SETUP_GUIDE.md).`,
    );
  }
}

let _app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (_app) return _app;
  assertConfig();
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return _app;
}

export const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    return Reflect.get(getApp(), prop);
  },
});

export function getFirebaseAuth(): Auth {
  return getAuth(getApp());
}

export function getDb(): Firestore {
  return getFirestore(getApp());
}

export function getBucket(): FirebaseStorage {
  return getStorage(getApp());
}

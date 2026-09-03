// Mobile override for @/lib/auth — native sign-in instead of browser popups.
//
// WHY THIS FILE EXISTS
// Google blocks OAuth inside embedded WebViews (the "disallowed_useragent"
// error), so the web app's `signInWithPopup` cannot work in a Capacitor shell.
// The native @capacitor-firebase/authentication plugin runs the real Android
// account picker instead, then we hand the resulting credential to the Firebase
// JS SDK so `onAuthStateChanged` — and therefore every shared component — sees
// the signed-in user exactly as it does on the web.
//
// Everything that already works in a WebView (email magic-link, sign-out,
// display-name update) is re-exported unchanged from the web app. Only the three
// popup-based functions are replaced.

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithCredential,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  deleteUser,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import { getFirebaseAuth, getDb } from '../../zora-app/lib/firebase';
import { deleteAllUserData } from '../../zora-app/lib/account';

// ── Unchanged on mobile: these already work inside a WebView ──
export {
  createRecaptchaVerifier,
  sendPhoneOtp,
  verifyPhoneOtp,
  completeEmailLinkSignIn,
  signOutUser,
  updateDisplayName,
} from '../../zora-app/lib/auth';
export type { AuthMethod } from '../../zora-app/lib/auth';

import type { AuthMethod } from '../../zora-app/lib/auth';

// ─────────────────────────────────────────────────────────────
// Email magic-link — must not point at https://localhost
// ─────────────────────────────────────────────────────────────

const EMAIL_FOR_SIGNIN_KEY = 'zora.emailForSignIn';

/**
 * The web app builds the sign-in link from `window.location.origin`
 * (zora-app/lib/auth.ts:104). Inside the APK that origin is `https://localhost`,
 * so the emailed link would be unopenable. Point it at the deployed site
 * instead, which is a real, reachable URL that Android App Links then hands
 * back to this app (see AndroidManifest.xml's autoVerify intent-filter and
 * zora-app/public/.well-known/assetlinks.json).
 */
export async function sendEmailSignInLink(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (typeof window === 'undefined') throw new Error('sendEmailSignInLink must run in the browser');

  const base = (process.env.NEXT_PUBLIC_ZORA_API_BASE ?? 'https://zora-chatbot.vercel.app').replace(
    /\/$/,
    '',
  );

  await sendSignInLinkToEmail(auth, email, {
    url: `${base}/login`,
    handleCodeInApp: true,
    android: {
      packageName: 'com.xorvion.zora',
      installApp: false,
    },
  });
  window.localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, email);
}

/**
 * Complete a magic-link sign-in from a deep-linked URL.
 *
 * The web app's `completeEmailLinkSignIn` reads `window.location.href`, which is
 * correct in a browser tab. On Android the link arrives through Capacitor's
 * `appUrlOpen` event while the page URL stays `https://localhost/...`, so the
 * URL has to be passed in explicitly. Called by CapacitorBootstrap.
 *
 * Returns null when the URL is not a Firebase sign-in link, so the caller can
 * ignore unrelated deep links.
 */
export async function completeEmailLinkFromUrl(url: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!isSignInWithEmailLink(auth, url)) return null;

  let email = window.localStorage.getItem(EMAIL_FOR_SIGNIN_KEY);
  if (!email) {
    // The link was requested on another device, so the address was never stashed
    // on this one. Firebase requires it to complete the sign-in.
    email = window.prompt('Confirm your email to finish signing in:');
    if (!email) return null;
  }

  const result = await signInWithEmailLink(auth, email, url);
  window.localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
  await ensureUserDoc(result.user, 'email');
  return result.user;
}

// ─────────────────────────────────────────────────────────────
// /users/{uid} doc on first sign-in
//
// The web app's ensureUserDoc is module-private, so it is reproduced here. Keep
// the written shape identical to zora-app/lib/auth.ts — the same Firestore doc
// is read by the web app's profile screen for the same account.
// ─────────────────────────────────────────────────────────────

async function ensureUserDoc(user: User, authMethod: AuthMethod): Promise<void> {
  const ref = doc(getDb(), 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    displayName: user.displayName || user.email || user.phoneNumber || 'New user',
    email: user.email,
    phone: user.phoneNumber,
    photoURL: user.photoURL,
    plan: 'free',
    authMethod,
    createdAt: serverTimestamp(),
    settings: {},
  });
}

// ─────────────────────────────────────────────────────────────
// Google — native Android account picker
// ─────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  // Native sheet. Requires the app's SHA-1/SHA-256 fingerprints to be registered
  // on the Firebase Android app, and google-services.json in android/app/.
  const native = await FirebaseAuthentication.signInWithGoogle();

  const idToken = native.credential?.idToken;
  if (!idToken) throw new Error('Google sign-in returned no ID token');

  // Mirror the native session into the JS SDK so the shared AuthProvider,
  // Firestore rules, and every `useAuth()` consumer see the same user.
  const auth = getFirebaseAuth();
  const credential = GoogleAuthProvider.credential(idToken, native.credential?.accessToken);
  const result = await signInWithCredential(auth, credential);

  await ensureUserDoc(result.user, 'google');
  return result.user;
}

// ─────────────────────────────────────────────────────────────
// GitHub — native Custom Tab (no WebView restriction)
// ─────────────────────────────────────────────────────────────

export async function signInWithGithub(): Promise<User> {
  const native = await FirebaseAuthentication.signInWithGithub();

  const accessToken = native.credential?.accessToken;
  if (!accessToken) throw new Error('GitHub sign-in returned no access token');

  const auth = getFirebaseAuth();
  const credential = GithubAuthProvider.credential(accessToken);
  const result = await signInWithCredential(auth, credential);

  await ensureUserDoc(result.user, 'github');
  return result.user;
}

// ─────────────────────────────────────────────────────────────
// Account deletion — native re-auth instead of reauthenticateWithPopup
// ─────────────────────────────────────────────────────────────

/**
 * Delete the signed-in user. Firebase requires a recent login before
 * `deleteUser`, which on the web is a popup. Here we re-run the native sign-in
 * for the user's provider to refresh the credential, then delete.
 *
 * Mobile stores no conversations, so `deleteAllUserData` effectively just
 * removes the /users/{uid} doc — but it is reused unchanged so that an account
 * which ALSO has web chat history gets that history deleted too.
 */
export async function deleteAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  const providerId = user.providerData[0]?.providerId;

  if (providerId === 'google.com') {
    await signInWithGoogle();
  } else if (providerId === 'github.com') {
    await signInWithGithub();
  }
  // Email-link users rely on a recent login; if it is stale, deleteUser throws
  // auth/requires-recent-login and the profile screen surfaces that code.

  const current = auth.currentUser;
  if (!current) throw new Error('Not signed in');

  await deleteAllUserData(current.uid);
  try {
    await deleteUser(current);
  } catch (e) {
    console.error('[deleteAccount] deleteUser failed:', e);
    throw e;
  }
  // Clear the native session too, or the plugin would still report a user.
  await FirebaseAuthentication.signOut().catch(() => {
    /* best effort */
  });
}

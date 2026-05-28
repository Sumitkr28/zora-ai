// Firebase Auth helpers — Google popup, Phone OTP (SMS + reCAPTCHA), Email link (passwordless).
// On first successful sign-in, creates the /users/{uid} Firestore doc (plan §3.6).

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  updateProfile,
  reauthenticateWithPopup,
  deleteUser,
  type AuthProvider,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getDb } from './firebase';
import { deleteAllUserData } from './account';

const EMAIL_FOR_SIGNIN_KEY = 'zora.emailForSignIn';

export type AuthMethod = 'phone' | 'email' | 'google' | 'github';

// ─────────────────────────────────────────────────────────────
// Google
// ─────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user, 'google');
  return result.user;
}

// ─────────────────────────────────────────────────────────────
// GitHub — OAuth popup (free, works on Spark)
// ─────────────────────────────────────────────────────────────

export async function signInWithGithub(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user, 'github');
  return result.user;
}

// ─────────────────────────────────────────────────────────────
// Phone OTP — requires an invisible reCAPTCHA verifier
// ─────────────────────────────────────────────────────────────

/**
 * Create an invisible reCAPTCHA verifier bound to a DOM element.
 * Call once per LoginScreen mount; reuse across OTP attempts.
 * The container element must exist in the DOM at call time.
 */
export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
}

/**
 * Send a 6-digit SMS code to the given phone number.
 * `phone` must be E.164 format (e.g., "+919876543210").
 * Returns a ConfirmationResult to pass to verifyPhoneOtp().
 */
export async function sendPhoneOtp(
  phone: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  return signInWithPhoneNumber(auth, phone, verifier);
}

export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<User> {
  const result = await confirmation.confirm(code);
  await ensureUserDoc(result.user, 'phone');
  return result.user;
}

// ─────────────────────────────────────────────────────────────
// Email link (passwordless)
// ─────────────────────────────────────────────────────────────

/**
 * Send a magic-link sign-in email. The link points back to /login on this origin.
 * We stash the email in localStorage so we can complete sign-in when the user
 * clicks back from their inbox.
 */
export async function sendEmailSignInLink(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (typeof window === 'undefined') throw new Error('sendEmailSignInLink must run in the browser');
  await sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, email);
}

/**
 * Called on app mount: if the current URL is a Firebase email-link sign-in URL,
 * complete the sign-in. Returns the signed-in User, or null if there's no pending
 * email link.
 */
export async function completeEmailLinkSignIn(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  const auth = getFirebaseAuth();
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;

  let email = window.localStorage.getItem(EMAIL_FOR_SIGNIN_KEY);
  if (!email) {
    // The localStorage entry can be missing if the user opened the email on a
    // different device. Ask them to re-enter their email.
    email = window.prompt('Please confirm your email to finish signing in:');
    if (!email) return null;
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
  await ensureUserDoc(result.user, 'email');

  // Clean the magic-link query params from the URL so refresh doesn't re-trigger.
  window.history.replaceState({}, document.title, window.location.pathname);

  return result.user;
}

// ─────────────────────────────────────────────────────────────
// Sign out
// ─────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

// ─────────────────────────────────────────────────────────────
// Profile: update display name
// ─────────────────────────────────────────────────────────────

/**
 * Update the signed-in user's display name in both Firebase Auth and the
 * /users/{uid} Firestore doc. Throws if there's no current user.
 */
export async function updateDisplayName(name: string): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Name cannot be empty');
  await updateProfile(user, { displayName: trimmed });
  await updateDoc(doc(getDb(), 'users', user.uid), { displayName: trimmed });
}

// ─────────────────────────────────────────────────────────────
// Account deletion (cascade Firestore data, then the Auth user)
// ─────────────────────────────────────────────────────────────

/**
 * Permanently delete the signed-in user: re-authenticate (for OAuth providers, via
 * popup), cascade-delete their Firestore data, then delete the Auth user itself.
 *
 * For email-link / phone users we can't silently re-auth, so we skip the popup and rely
 * on a recent login — if it's too old, deleteUser throws `auth/requires-recent-login`,
 * which the caller surfaces as a "sign out and back in" message.
 */
export async function deleteAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  const providerId = user.providerData[0]?.providerId;
  const reauthProvider: AuthProvider | null =
    providerId === 'google.com'
      ? new GoogleAuthProvider()
      : providerId === 'github.com'
        ? new GithubAuthProvider()
        : null;

  if (reauthProvider) {
    await reauthenticateWithPopup(user, reauthProvider);
  }

  // Delete data first (still authenticated), then the Auth user.
  await deleteAllUserData(user.uid);
  await deleteUser(user);
}

// ─────────────────────────────────────────────────────────────
// /users/{uid} doc creation on first sign-in (plan §3.6)
// ─────────────────────────────────────────────────────────────

async function ensureUserDoc(user: User, authMethod: AuthMethod): Promise<void> {
  const db = getDb();
  const ref = doc(db, 'users', user.uid);
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

// Route targets for full page loads inside the APK.
//
// Capacitor's asset server cannot resolve a directory to its index.html
// (/chat/ serves the ROOT page), so any navigation that is a real page load —
// as opposed to a next/link client transition — has to name the file. See
// lib/nav-shim.ts for the measurements behind this.

import { toAssetPath } from './nav-shim';

export const CHAT_PATH = toAssetPath('/chat');
export const HOME_PATH = toAssetPath('/');

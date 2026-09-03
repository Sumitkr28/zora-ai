'use client';

// Native-shell wiring. Renders nothing — it exists for its side effects.
//
// Every Capacitor plugin call is guarded so this component is also harmless in a
// plain browser (`npm run dev` at localhost:3100), which is how the UI is
// iterated on without an emulator.

import React from 'react';
import { installApiShim } from '../lib/api-shim';
import { installNavShim } from '../lib/nav-shim';
import { CHAT_PATH } from '../lib/routes';

// Installed at module evaluation, before React mounts, so the very first
// fetch('/api/...') from any screen is already rewritten and the first link tap
// is already routed to a path the asset server can resolve.
installApiShim();
installNavShim();

export function CapacitorBootstrap() {
  React.useEffect(() => {
    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform() || disposed) return;

      // Status bar: match the app's near-black background with light icons.
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#060607' });
      } catch {
        /* status bar unavailable on this device */
      }

      // Let the composer stay above the on-screen keyboard.
      try {
        const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');
        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      } catch {
        /* keyboard plugin unavailable */
      }

      // Android hardware back: navigate back through app history, and only exit
      // from the root screen. Without this, back closes the app from anywhere.
      try {
        const { App } = await import('@capacitor/app');
        const handle = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack && window.history.length > 1) window.history.back();
          else App.exitApp();
        });
        cleanups.push(() => {
          handle.remove();
        });
      } catch {
        /* app plugin unavailable */
      }

      // Email magic-link. Android App Links hand the emailed URL to the app
      // instead of the browser; it arrives here, not in window.location.
      try {
        const { App } = await import('@capacitor/app');
        const { completeEmailLinkFromUrl } = await import('../lib/auth');

        const handleLink = async (url: string) => {
          try {
            const user = await completeEmailLinkFromUrl(url);
            // Signed in — land on the chat rather than the login screen.
            // toAssetPath because Capacitor's asset server cannot resolve
            // '/chat/' to its index.html (see lib/nav-shim.ts).
            if (user) window.location.replace(CHAT_PATH);
          } catch (err) {
            console.error('[deep-link] email sign-in failed:', err);
          }
        };

        // App already running when the link is tapped.
        const linkHandle = await App.addListener('appUrlOpen', ({ url }) => {
          void handleLink(url);
        });
        cleanups.push(() => {
          linkHandle.remove();
        });

        // App was launched cold BY the link — no event fires for that.
        const launch = await App.getLaunchUrl();
        if (launch?.url) await handleLink(launch.url);
      } catch {
        /* app plugin unavailable */
      }
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}

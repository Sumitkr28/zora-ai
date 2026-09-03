import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_APP = path.resolve(__dirname, '../zora-app');

/**
 * Static export of the SAME React UI that ships on the web.
 *
 * Nothing in ../zora-app is modified. This config re-points a handful of `@/…`
 * imports at mobile-only replacements, and lets every other `@/…` fall through
 * to the real web app — so the design is not a copy, it IS the web app's code.
 *
 * Alias order matters: webpack resolves the FIRST matching key, so the three
 * specific overrides must be listed before the catch-all `@`.
 */
const nextConfig = {
  reactStrictMode: true,

  // Capacitor serves the app from the filesystem — no Node server, no Image
  // Optimization API, and relative asset URLs so file:// lookups resolve.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,

  // `next build` type-checks ../zora-app too, which already passes its own
  // typecheck in its own project. Keep this project's check to its own files.
  typescript: { ignoreBuildErrors: false },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,

      // ── DO NOT alias react / react-dom here ──
      // It is tempting, because ../zora-app has its own node_modules and a
      // second React copy would break hooks. But Next.js already aliases both
      // to the React it vendors internally (next/dist/compiled/react), so every
      // file — this project's and zora-app's — shares that one copy already.
      //
      // Adding a hard alias to the plain react package instead breaks the App
      // Router at runtime, because Next's client runtime calls React.use(),
      // which exists only in Next's patched build:
      //     TypeError: (0 , s.use) is not a function
      //     Minified React error #423   (blank white screen)
      // and on the server compile it bypasses the "react-server" export
      // condition:
      //     TypeError: r.cache is not a function
      //
      // The duplicate @types/react problem this was meant to solve is a
      // TYPE-only issue, handled by the "react" entry in tsconfig.json paths.

      // ── Mobile-only overrides (must precede the catch-all) ──
      // No chat history on mobile: these are no-op stubs.
      '@/lib/conversations': path.resolve(__dirname, 'lib/conversations.ts'),
      '@/lib/cleanup': path.resolve(__dirname, 'lib/cleanup.ts'),
      // WebViews block OAuth popups: native Google/GitHub sign-in instead.
      '@/lib/auth': path.resolve(__dirname, 'lib/auth.ts'),

      // ── Everything else comes straight from the web app ──
      '@': WEB_APP,
    };
    return config;
  },
};

export default nextConfig;

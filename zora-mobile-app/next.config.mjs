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

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,

      // ── One React, one ReactDOM — CLIENT BUNDLE ONLY ──
      // The shared components live under ../zora-app, which has its own
      // node_modules. Without this, webpack loads a second copy of React for
      // them, which breaks hooks at runtime ("invalid hook call").
      //
      // It must NOT apply to the server compile: during prerender Next resolves
      // React through the "react-server" export condition to get the RSC build,
      // and a hard path alias bypasses that — the symptom is
      // `TypeError: r.cache is not a function` on every page.
      ...(isServer
        ? {}
        : {
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
          }),

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

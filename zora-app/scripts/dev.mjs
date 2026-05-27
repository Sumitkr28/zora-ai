// Local dev launcher for `npm run dev`.
//
// Sets NODE_TLS_REJECT_UNAUTHORIZED=0 in the environment BEFORE spawning `next dev`, so Node's
// fetch (undici) reads it at startup. This is needed on Windows dev machines where antivirus /
// corporate-firewall HTTPS inspection (or an unreachable cert-revocation server) makes Node's
// outbound TLS handshake to the Gemini API fail with "fetch failed" / CRYPT_E_NO_REVOCATION_CHECK.
//
// Why a launcher instead of setting the env var inside the route: undici caches its TLS config
// before route code runs, so mutating process.env at request time is too late. It must be set
// before the Next process starts — which is exactly what spawning a child with this env does.
//
// SAFETY: this only runs for `npm run dev`. Production (`next build` + `next start`, e.g. on
// Vercel) never executes this file, so the deployed app keeps full TLS certificate validation.

import { spawn } from 'node:child_process';

const child = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' },
});

child.on('exit', (code) => process.exit(code ?? 0));

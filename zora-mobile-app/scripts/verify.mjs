// Two things in this project can break silently. This checks both.
// Run with `npm run verify` (after a build, so `out/` exists).
//
//   1. The pricing removal is a CSS attribute selector keyed on href="/pricing".
//      If a web-app change ever routes pricing through a button or a new path,
//      the selector stops matching and prices reappear in a Play Store build —
//      which is a policy violation, not just a cosmetic bug.
//   2. The API shim's URL rewriting decides what reaches the backend. Getting it
//      wrong either 404s every chat or leaks unrelated requests to Vercel.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures++;
    console.error(`FAIL  ${name}\n      ${err.message}`);
  }
}

// ── 1. API shim URL rewriting ────────────────────────────────────────────────
// Mirrors resolveApiUrl in lib/api-shim.ts. Kept as a literal copy because the
// TS source can't be imported by plain node without a build step.
function resolveApiUrl(rawUrl, origin, base) {
  let url;
  try {
    url = new URL(rawUrl, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  if (!url.pathname.startsWith('/api/')) return null;
  return base + url.pathname + url.search;
}

const ORIGIN = 'https://localhost';
const BASE = 'https://zora-chatbot.vercel.app';

console.log('\nAPI shim rewriting:');

check('rewrites the chat endpoint', () => {
  assert.equal(resolveApiUrl('/api/chat', ORIGIN, BASE), `${BASE}/api/chat`);
});

check('rewrites the upload endpoint', () => {
  assert.equal(resolveApiUrl('/api/upload', ORIGIN, BASE), `${BASE}/api/upload`);
});

check('preserves the query string', () => {
  assert.equal(resolveApiUrl('/api/chat?x=1&y=2', ORIGIN, BASE), `${BASE}/api/chat?x=1&y=2`);
});

check('leaves Firebase and other absolute URLs alone', () => {
  for (const u of [
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup',
    'https://firestore.googleapis.com/v1/projects/zora-prod-8eed5/databases',
    'https://api.web3forms.com/submit',
    'https://zora-chatbot.vercel.app/api/chat',
  ]) {
    assert.equal(resolveApiUrl(u, ORIGIN, BASE), null, `should not rewrite ${u}`);
  }
});

check('leaves bundled assets alone', () => {
  for (const u of ['/_next/static/chunk.js', '/icon.svg', '/chat/', '/']) {
    assert.equal(resolveApiUrl(u, ORIGIN, BASE), null, `should not rewrite ${u}`);
  }
});

check('does not rewrite a path merely containing "api"', () => {
  assert.equal(resolveApiUrl('/rapid/thing', ORIGIN, BASE), null);
});

// ── 2. No pricing / subscription surface in the built app ────────────────────
const OUT = path.join(ROOT, 'out');

if (!existsSync(OUT)) {
  console.log('\nBuilt output: out/ not found — run `npm run build` first to check pricing.\n');
  process.exit(failures > 0 ? 1 : 0);
}

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

console.log('\nPlay Store policy (no subscriptions in the build):');

const pages = await htmlFiles(OUT);

check('a /pricing route was not exported', () => {
  const priced = pages.filter((p) => p.includes(`${path.sep}pricing${path.sep}`));
  assert.equal(priced.length, 0, `found exported pricing page(s): ${priced.join(', ')}`);
});

const withLinks = [];
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  if (/href="\/pricing\/?"/.test(html)) withLinks.push(path.relative(OUT, file));
}

check('every /pricing link is covered by the hiding rule', () => {
  // Links may still be present in the markup (they come from shared components);
  // what matters is that mobile-overrides.css hides them. Assert the rule exists.
  const css = path.join(ROOT, 'app', 'mobile-overrides.css');
  const rule = readFileSync(css, 'utf8');
  assert.match(rule, /a\[href="\/pricing"\]/, 'mobile-overrides.css lost its /pricing rule');
  assert.match(rule, /a\[href="\/pricing\/"\]/, 'missing the trailing-slash variant');
  if (withLinks.length) {
    console.log(`      (${withLinks.length} page(s) contain a /pricing link, hidden by CSS: ${withLinks.join(', ')})`);
  }
});

// ── 3. Phone sign-in is gone from the mobile login ───────────────────────────
console.log('\nNo phone sign-in on mobile:');

const loginHtml = path.join(OUT, 'login', 'index.html');

check('the login route passes hidePhone', () => {
  const page = readFileSync(path.join(ROOT, 'app', 'login', 'page.tsx'), 'utf8');
  assert.match(page, /hidePhone/, 'app/login/page.tsx stopped passing hidePhone');
});

check('no phone markup reaches the built login page', () => {
  assert.ok(existsSync(loginHtml), 'login/index.html was not exported');
  const html = readFileSync(loginHtml, 'utf8');
  for (const needle of [
    'Phone sign-in coming soon', // the disabled row's title
    'Coming soon', // its caption
    'STEP 1 OF 2', // the phone → OTP step eyebrow
    'OR CONTINUE WITH', // divider that only reads right after the phone block
    '6-digit code', // the phone-flow subtitle
    'flagcdn.com', // country-picker flag images
  ]) {
    assert.ok(
      !html.includes(needle),
      `built login page still contains phone content: "${needle}"`,
    );
  }
});

console.log(
  failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`,
);
process.exit(failures > 0 ? 1 : 0);

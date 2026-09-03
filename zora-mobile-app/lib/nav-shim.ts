// Makes plain <a href="/route"> links work inside the APK.
//
// THE PROBLEM
// Capacitor's local asset server does not resolve a directory to its
// index.html. Measured on device:
//   /login/index.html -> correct login page
//   /login/           -> falls back to the ROOT index.html
//   /login            -> falls back to the ROOT index.html
// Next's static export (trailingSlash: true) writes login/index.html, so any
// FULL page load of /login lands on the landing page instead. The shared
// components contain 18 such plain anchors (/login, /chat, /account, /contact,
// /terms, /privacy), and a magic-link deep link is a full load too.
//
// THE FIX
// Intercept same-origin anchor clicks and navigate to the explicit
// ".../index.html" form, which the asset server does resolve.
//
// Why the BUBBLE phase and the defaultPrevented check: next/link renders a real
// <a href> but calls preventDefault() in its own handler to route client-side.
// Listening on document during bubbling means Next's handler has already run,
// so a prevented event tells us Next owns that click and we leave it alone.
// Only unhandled plain anchors get rewritten.

/**
 * Map a route path to the file the asset server can actually serve.
 * '/login' and '/login/' both become '/login/index.html'. Paths that already
 * point at a file (.html, .png, .js …) are returned unchanged.
 */
export function toAssetPath(pathname: string): string {
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${withSlash}index.html`;
}

let installed = false;

export function installNavShim(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', (e) => {
    // next/link already handled it (it prevents default to route client-side).
    if (e.defaultPrevented) return;
    // Let modified clicks fall through to default behaviour.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const anchor = (e.target as Element | null)?.closest?.('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('/')) return; // external, hash, or relative
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    const url = new URL(href, window.location.origin);
    const target = toAssetPath(url.pathname);
    if (target === url.pathname) return; // already a real file

    e.preventDefault();
    window.location.assign(target + url.search + url.hash);
  });
}

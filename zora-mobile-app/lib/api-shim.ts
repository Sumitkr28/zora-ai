// Routes the shared components' relative API calls to the live Vercel backend.
//
// THE PROBLEM
// The web app calls fetch('/api/chat') and fetch('/api/upload')
// (zora-app/components/screens/chat-screen.tsx:387 and :290). On the web those
// resolve against https://zora-chatbot.vercel.app and hit the Next.js route
// handlers. Inside the APK the page origin is https://localhost, the API routes
// are not bundled (a static export has no server), and both calls 404.
//
// THE FIX
// Patch window.fetch once to rewrite same-origin /api/* URLs to the deployed
// backend. This lives entirely in the mobile project: the shared chat component
// is untouched and still just calls fetch('/api/chat').
//
// Streaming is preserved because this is still the platform fetch — the shim
// only rewrites the URL and returns the real Response, so the chat's
// ReadableStream reader keeps working chunk by chunk. (This is why the app does
// NOT enable Capacitor's CapacitorHttp plugin, which buffers whole responses and
// would kill token-by-token streaming.)

export const API_BASE = (
  process.env.NEXT_PUBLIC_ZORA_API_BASE ?? 'https://zora-chatbot.vercel.app'
).replace(/\/$/, '');

/**
 * Decide the rewritten URL for one request.
 *
 * Returns the absolute backend URL for a same-origin `/api/*` request, or `null`
 * for anything that must be left alone (Firebase, Google, Web3Forms, bundled
 * assets). Pure and origin-injected so it is testable without a browser —
 * see scripts/verify.mjs.
 */
export function resolveApiUrl(rawUrl: string, origin: string, base: string = API_BASE): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  if (!url.pathname.startsWith('/api/')) return null;
  return base + url.pathname + url.search;
}

let installed = false;

export function installApiShim(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const nativeFetch = window.fetch.bind(window);
  const origin = window.location.origin;

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      if (input instanceof Request) {
        const target = resolveApiUrl(input.url, origin);
        // Rebuild against the remote URL, preserving method, headers and body.
        return target ? nativeFetch(new Request(target, input)) : nativeFetch(input, init);
      }
      const target = resolveApiUrl(String(input), origin);
      if (target) return nativeFetch(target, init);
    } catch {
      // Any surprise falls through to the untouched fetch below.
    }
    return nativeFetch(input as RequestInfo, init);
  }) as typeof window.fetch;
}

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Play Store package name. This is PERMANENT once the app is published —
  // it cannot be changed later without shipping a different listing.
  appId: 'com.xorvion.zora',
  appName: 'Zora',

  // `next build` with output:'export' writes the static site here.
  webDir: 'out',

  server: {
    // Serve bundled assets over https://localhost rather than http://, so the
    // WebView treats the app as a secure context. Firebase Auth, crypto.subtle
    // and clipboard access all require that.
    androidScheme: 'https',
  },

  plugins: {
    // NO SplashScreen plugin, on purpose.
    //
    // Capacitor scaffolds a splash image, but the app does not need one. The
    // launch window is painted a flat #060607 (values/styles.xml ->
    // windowBackground), the same colour as the app's own background, so
    // tapping the icon goes straight into Zora with no logo screen in between
    // and no visible handover.
    //
    // This also deletes a whole class of bugs: the scaffolded splash stretched
    // the circular Zora mark into an oval, because the bitmap was scaled to the
    // window bounds. Every "fix" was really just choosing a different scaling
    // mode. No image, nothing to distort.

    FirebaseAuthentication: {
      // Native Google + GitHub. Phone is absent on purpose: Firebase Spark
      // blocks SMS, and the login screen shows "Coming soon" for it.
      skipNativeAuth: false,
      providers: ['google.com', 'github.com'],
    },
  },

  // NOTE: CapacitorHttp is deliberately NOT enabled. It proxies fetch through
  // native HTTP and buffers the entire response, which would break the chat's
  // token-by-token streaming. Requests reach the backend via the fetch shim in
  // lib/api-shim.ts instead — see that file, and the CORS note in README.md.
};

export default config;

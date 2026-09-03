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
    SplashScreen: {
      // The web layer hides the splash itself (CapacitorBootstrap) once the
      // first screen has painted, so autohide is off to avoid a white flash.
      launchAutoHide: false,
      backgroundColor: '#060607',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },

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

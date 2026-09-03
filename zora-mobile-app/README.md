# Zora for Android

The Zora Android app. It is **not a rewrite** — it compiles the exact React
components that ship on the web, so the design is identical by construction
rather than by careful copying.

- **Package:** `com.xorvion.zora`
- **Web app:** `../zora-app` — **never modified by this project**
- **Backend:** the live Vercel deployment (`https://zora-chatbot.vercel.app`)

---

## How it works

```
zora-mobile-app/
├── app/              thin route files — `export { default } from '@/app/…'`
├── lib/              the three mobile-only overrides
├── components/       native shell wiring
├── android/          the Capacitor Android project
└── out/              static export, copied into the APK by `cap sync`
```

`next.config.mjs` aliases `@/…` to `../zora-app`, so every screen, style token
and icon comes from the web app's own source. Only **three modules** are
swapped, plus one stylesheet:

| Override | Why |
|---|---|
| `lib/auth.ts` | Google blocks OAuth popups in WebViews. Uses the native Android account picker, then mirrors the credential into the Firebase JS SDK so `useAuth()` is unchanged. |
| `lib/conversations.ts` | **No chat history on mobile.** Every read returns empty and every write is a no-op, so the shared chat screen runs unmodified but stores nothing. |
| `lib/cleanup.ts` | Nothing is stored, so there is nothing to expire. |
| `app/mobile-overrides.css` | Hides the four `/pricing` links and adds native polish (no text selection, safe-area padding). |

Plus `lib/api-shim.ts`, which rewrites the shared components'
`fetch('/api/chat')` calls to the deployed backend — the APK has no server of
its own.

### What is deliberately different from the web

- **No pricing or subscriptions.** There is no `/pricing` route and every link
  to it is hidden. Google Play requires digital subscriptions to use Play
  Billing, so the app offers none.
- **No chat history.** Conversations live in memory only and are gone when the
  screen closes. The sidebar list is always empty.
- **No Vercel Analytics.**

Everything else — landing, intro splash, chat, streaming, Markdown rendering,
file uploads, account, about/contact/terms/privacy — is the same code.

---

## Build

```bash
npm install
cp .env.local.example .env.local     # same Firebase values as the web app
npm run build                        # static export → out/
npm run verify                       # policy + shim checks
npx cap sync android                 # copy out/ into the native project
npx cap open android                 # opens Android Studio
```

`npm run sync` does build → verify → sync in one step.
`npm run dev` serves the UI at <http://localhost:3100> for fast iteration
(native plugins no-op in a desktop browser).

---

## Before it runs on a device

These four need your Firebase/Google accounts and cannot be done from the repo.

### 1. Deploy the web app — **required, or chat will not work**

Two changes were made in `zora-app` for the mobile app, and both must be live
on Vercel before the app works:

- **CORS headers** on `app/api/chat/route.ts` and `app/api/upload/route.ts`,
  allowing origin `https://localhost`. Additive — the web app's own
  same-origin requests behave exactly as before.
- **`public/.well-known/assetlinks.json`** — the Android App Links proof that
  makes email magic-links open the app.

```bash
cd ../zora-app && git push origin main    # Vercel auto-deploys
curl https://zora-chatbot.vercel.app/.well-known/assetlinks.json   # must return JSON
```

### 2. `google-services.json`

Firebase Console → Project settings → **Add app → Android** →
package `com.xorvion.zora`. Add your signing fingerprints:

```bash
# debug (for development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey \
        -storepass android -keypass android
# release (after step 3)
keytool -list -v -keystore android/zora-upload.jks -alias zora
```

Paste **both SHA-1 and SHA-256** into the Firebase Android app, then download
`google-services.json` to `android/app/`. Google sign-in fails with
`DEVELOPER_ERROR` until the fingerprint matches.

Also add `localhost` to **Firebase → Auth → Settings → Authorized domains**.

### 3. Signing

```bash
cd android
keytool -genkey -v -keystore zora-upload.jks -keyalg RSA -keysize 2048 \
        -validity 10000 -alias zora
cp key.properties.example key.properties   # fill in your passwords
```

Back up the `.jks` somewhere safe. Losing it means you cannot ship updates.

### 4. Icons and splash

Replace the placeholder launcher icons using Android Studio's
**Image Asset** tool (right-click `app/res` → New → Image Asset) with the Zora
mark from `../zora-app/app/icon.svg` on `#060607`.

---

## Play Store submission

```bash
npm run sync
cd android && ./gradlew bundleRelease     # → app/build/outputs/bundle/release/
```

Upload the `.aab` at [play.google.com/console](https://play.google.com/console)
(one-time $25 registration).

Checklist the console will ask for:

- **Privacy policy URL** — `https://zora-chatbot.vercel.app/privacy` ✅ live
- **Data safety form** — declare: email + name (account), and that chat messages
  are sent to Google Gemini for processing. The app itself stores no chat history.
- **Target API 35** ✅ set in `android/variables.gradle`
- **Content rating** questionnaire
- **App access** — give Google reviewers a test account, or note that guest mode
  works with no login
- **AI-generated content** — declare it; Play requires disclosure for generative
  AI apps, and a way to report offensive output. The contact form covers this.
- **Screenshots** — at least 2 phone screenshots, 1080×1920 or similar

---

## Email magic-link

Wired end to end via Android App Links:

1. `lib/auth.ts` sends the link with `url: https://zora-chatbot.vercel.app/login`
   (the web app's `window.location.origin` would be `https://localhost` here) and
   `android.packageName`.
2. `AndroidManifest.xml` claims that URL with an `autoVerify` intent-filter.
3. Android checks `/.well-known/assetlinks.json` on the domain against the
   installed build's signing certificate.
4. On a match the link opens the app; Capacitor delivers it as `appUrlOpen`, and
   `CapacitorBootstrap` calls `completeEmailLinkFromUrl()` and lands on `/chat/`.
   Cold starts are covered by `App.getLaunchUrl()`.

**The fingerprint must match the cert that signed the installed build.**
`assetlinks.json` currently lists the **debug** SHA-256 from this machine, so it
works for `npx cap run android`. Before release, add two more entries:

```bash
# your upload key
keytool -list -v -keystore android/zora-upload.jks -alias zora
```

…plus the **Play App Signing** SHA-256 from Play Console → Setup → App signing
(Google re-signs your upload, so its certificate is what users actually get).
All three can live in the `sha256_cert_fingerprints` array at once. Verify with:

```bash
adb shell pm get-app-links com.xorvion.zora     # want: verified
```

If it says `unverified`, the fingerprint does not match and the link opens in
the browser instead — sign-in still succeeds there, just on the web.

## Known gaps

**Microsoft** behaves as on the web: a simulated error pointing at Google/Email.
Unchanged on purpose.

**Phone sign-in is hidden** on mobile (the web shows a dimmed "Coming soon"
row). Firebase Spark blocks SMS regardless.

**Two copy nits the phone removal leaves behind**, both in shared components so
they were not touched: the login subtitle still says *"We'll send a 6-digit code
to verify it's you"*, and the `OR CONTINUE WITH` divider now sits above the
first option with nothing before it. Changing either affects the web design too
— say the word and they can be overridden for mobile only.

**`/api/chat` is unauthenticated.** Same exposure as the web app; shipping an
APK makes the endpoint easier to find. Worth adding a Firebase ID-token check
before a public launch.

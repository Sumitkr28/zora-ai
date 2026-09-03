// /login — the same LoginScreen as the web, trimmed for the Android app:
//
//   hidePhone          no country-picker row, no "Coming soon" caption, no
//                      "STEP 1 OF 2" eyebrow, no "OR CONTINUE WITH" divider
//                      (Firebase Spark blocks SMS).
//   hideMicrosoft      Microsoft sign-in is a simulated error on web; pointless
//                      in a Play Store build.
//   hideGithub         GitHub sign-in is not offered on mobile.
//   redirectOnSuccess  skip the "You're in." screen and land on the chat.
//
// Leaves Google (native Android account picker) and Email magic-link.
// All four props default to false/undefined in the shared component, so the web
// login is unchanged. @/lib/auth resolves to this project's native sign-in.

import { LoginScreen } from '@/components/screens/login';
import { CHAT_PATH } from '../../lib/routes';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <LoginScreen
        width="100vw"
        height="100dvh"
        hidePhone
        hideMicrosoft
        hideGithub
        redirectOnSuccess={CHAT_PATH}
      />
    </div>
  );
}

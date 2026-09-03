// /login — the same LoginScreen as the web, with `hidePhone` so the phone row,
// its "Coming soon" caption, the "STEP 1 OF 2" eyebrow and the "OR CONTINUE
// WITH" divider are not rendered at all (Firebase Spark blocks SMS, so a Play
// Store build should not ship a dead control).
//
// This is the one route that is not a plain re-export, because it passes a prop.
// Everything else about the screen — layout, styles, providers — is the shared
// component. @/lib/auth still resolves to this project's native sign-in.

import { LoginScreen } from '@/components/screens/login';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <LoginScreen width="100vw" height="100dvh" hidePhone />
    </div>
  );
}

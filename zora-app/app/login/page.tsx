// /login — auth method picker → OTP. Phase 3 replaces the state-machine with real Firebase Auth.

import { LoginScreen } from '@/components/screens/login';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <LoginScreen width="100vw" height="100dvh" />
    </div>
  );
}

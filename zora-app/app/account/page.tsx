// /account — profile + privacy + data export. Phase 7 wires the buttons.

import { ProfileScreen } from '@/components/screens/profile';

export default function AccountPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <ProfileScreen width="100vw" height="100dvh" />
    </div>
  );
}

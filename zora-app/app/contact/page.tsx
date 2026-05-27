// /contact — contact form + direct email + social links.
// Phase 7 wires the form to Firestore /feedback collection.

import { ContactScreen } from '@/components/screens/about-contact-terms';

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }}>
      <ContactScreen width="100vw" height="100dvh" />
    </div>
  );
}

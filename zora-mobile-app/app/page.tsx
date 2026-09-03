'use client';

// / — landing page only.
//
// The web homepage (zora-app/app/page.tsx) overlays a cinematic IntroSplash on
// the first visit of a session. In an app that reads as a loading screen between
// the icon tap and the product, so this route renders Landing on its own and the
// intro is never mounted. `hideIntroCta` also drops the "Watch the intro" button,
// which would otherwise point at an animation this build does not ship.
//
// Both props default to the web behaviour in the shared component, so
// zora-chatbot.vercel.app keeps its intro and its original CTA wording.

import { Landing } from '@/components/screens/landing';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', position: 'relative' }}>
      <Landing width="100vw" height="100dvh" hideIntroCta chatCtaLabel="Start chatting" noHistory />
    </div>
  );
}

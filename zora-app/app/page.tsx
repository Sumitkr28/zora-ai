'use client';

// / — homepage: Landing page with an Intro splash overlay on the first visit per session
// (or when navigated to with ?intro=1, which the "Watch the intro" CTA uses).
// sessionStorage flag matches plan §2.1 ("Show on every fresh visit, suppress within a session").

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Landing } from '@/components/screens/landing';
import { IntroSplash } from '@/components/screens/intro';

const INTRO_SEEN_KEY = 'zora.seenIntro';

function HomeContent() {
  const search = useSearchParams();
  const forceIntro = search.get('intro') === '1';

  // Start with showIntro=true so the splash covers the first paint. The effect below
  // dismisses it immediately for returning users (sessionStorage flag set). This prevents
  // the "landing flashes, then intro appears 1s later" bug.
  const [showIntro, setShowIntro] = React.useState(true);
  const [vp, setVp] = React.useState<{ w: number; h: number } | null>(null);

  React.useEffect(() => {
    const updateVp = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    updateVp();
    window.addEventListener('resize', updateVp);
    return () => window.removeEventListener('resize', updateVp);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (forceIntro) {
      setShowIntro(true);
      sessionStorage.removeItem(INTRO_SEEN_KEY);
    } else if (sessionStorage.getItem(INTRO_SEEN_KEY) === '1') {
      // Returning visitor in this session — skip the intro instantly.
      setShowIntro(false);
    }
    // Otherwise keep showIntro=true so the splash plays on first visit.
  }, [forceIntro]);

  function dismissIntro() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
      // Strip the ?intro=1 param so refresh doesn't re-trigger.
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    setShowIntro(false);
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', position: 'relative' }}>
      <Landing width="100vw" height="100dvh" />
      {showIntro && vp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <IntroSplash width={vp.w} height={vp.h} onDone={dismissIntro} />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  // useSearchParams() requires a Suspense boundary during static generation (Next.js 14).
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--bg-0)' }} />}>
      <HomeContent />
    </Suspense>
  );
}

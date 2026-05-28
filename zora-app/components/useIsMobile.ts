'use client';

// Tiny breakpoint hook used by all screens to branch their inline styles for mobile.
// Returns false on the server / first client paint to match SSR exactly (no hydration
// mismatch), then updates after mount via matchMedia. Default breakpoint = 768px.
// Pass a different value (e.g. 480) for a narrower secondary breakpoint.

import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    // Safari < 14 used the deprecated addListener / removeListener.
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, [breakpoint]);

  return isMobile;
}

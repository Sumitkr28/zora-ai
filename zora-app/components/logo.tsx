'use client';

// Zora logo + icon set. Ported verbatim from design_handoff_zora/design_files/logo.jsx.
// No visual change — exports the same components (ZoraMark, ZoraWordmark, XorvionTag, Icon)
// that the rest of the screens import.

import React from 'react';

export function ZoraMark({ size = 36 }: { size?: number; animated?: boolean }) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`mark-${id}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="1" stopColor="#b8bcc4" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="none" stroke={`url(#mark-${id})`} strokeWidth="2" />
      <path
        d="M 11 13 L 37 13 L 11 35 L 37 35"
        fill="none"
        stroke={`url(#mark-${id})`}
        strokeWidth="2.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <circle cx="24" cy="24" r="1.8" fill="#f4f5f7" />
    </svg>
  );
}

export function ZoraWordmark({
  size = 28,
  tagline = false,
  color = '#ececec',
}: {
  size?: number;
  tagline?: boolean;
  color?: string;
}) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
      <ZoraMark size={size * 1.25} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: size,
            letterSpacing: '0.08em',
            color,
          }}
        >
          ZORA
        </span>
        {tagline && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: size * 0.32,
              letterSpacing: '0.22em',
              color: 'var(--t-3)',
              marginTop: size * 0.18,
              textTransform: 'uppercase',
            }}
          >
            by Xorvion
          </span>
        )}
      </div>
    </div>
  );
}

export function XorvionTag({ size = 11 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: size,
        letterSpacing: '0.2em',
        color: 'var(--t-3)',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span style={{ width: 18, height: 1, background: 'linear-gradient(90deg, transparent, var(--t-3))' }} />
      a Xorvion product
    </span>
  );
}

export function Icon({
  name,
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.6,
}: {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const M: Record<string, React.ReactNode> = {
    send: <path d="M3 12l18-9-6 18-3-7-9-2z" />,
    mic: (
      <>
        <rect x="9" y="3" width="6" height="13" rx="3" />
        <path d="M5 11a7 7 0 0014 0M12 18v3" />
      </>
    ),
    paperclip: <path d="M21 11.5L12 20.5a5 5 0 11-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 11-3-3l8-8" />,
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5-5L5 21" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chat: <path d="M21 12a8 8 0 01-12.5 6.6L3 20l1.4-5.4A8 8 0 1121 12z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0116 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15V5a2 2 0 012-2h10" />
      </>
    ),
    refresh: (
      <>
        <path d="M3 12a9 9 0 0115-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 01-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
    thumbUp: <path d="M7 22V11M2 13v7a2 2 0 002 2h13a2 2 0 002-1.7l1.4-7A2 2 0 0018.5 11H13l1-4.5a2 2 0 00-2-2.5L7 11" />,
    thumbDown: <path d="M17 2v11M22 11V4a2 2 0 00-2-2H7a2 2 0 00-2 1.7L3.6 10.7A2 2 0 005.5 13H11l-1 4.5a2 2 0 002 2.5l5-6.5" />,
    trash: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <path d="M19 6l-1.5 14a2 2 0 01-2 2h-7a2 2 0 01-2-2L5 6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    sparkle: <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z M5 16l.7 2.1 2.3.9-2.3.9L5 22l-.7-2.1L2 19l2.3-.9z" />,
    file: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </>
    ),
    phone: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.3-1.3a2 2 0 012-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />,
    google: (
      <>
        <path d="M21.8 10.2H12v3.9h5.6a4.8 4.8 0 01-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.7 0-.7-.1-1.3-.2-1.9z" fill="#4285F4" stroke="none" />
        <path d="M12 22c2.7 0 5-1 6.9-2.4l-3.4-2.6c-1 .6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2H2.6v2.6A10 10 0 0012 22z" fill="#34A853" stroke="none" />
        <path d="M6.2 13.8a6 6 0 010-3.6V7.6H2.6a10 10 0 000 8.8z" fill="#FBBC05" stroke="none" />
        <path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 002.6 7.6l3.6 2.6C7 7.6 9.3 5.8 12 5.8z" fill="#EA4335" stroke="none" />
      </>
    ),
    microsoft: (
      <>
        <rect x="2" y="2" width="9.2" height="9.2" fill="#F25022" stroke="none" />
        <rect x="12.8" y="2" width="9.2" height="9.2" fill="#7FBA00" stroke="none" />
        <rect x="2" y="12.8" width="9.2" height="9.2" fill="#00A4EF" stroke="none" />
        <rect x="12.8" y="12.8" width="9.2" height="9.2" fill="#FFB900" stroke="none" />
      </>
    ),
    check: <path d="M5 12l5 5L20 7" />,
    x: <path d="M6 6l12 12M6 18L18 6" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    home: <path d="M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v5h1" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.2 1.2" />
        <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.2-1.2" />
      </>
    ),
    play: <path d="M6 4l14 8-14 8z" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </>
    ),
    shield: <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </>
    ),
    pin: (
      <>
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    code: <path d="M16 18l6-6-6-6M8 6L2 12l6 6" />,
    video: (
      <>
        <path d="M22 8l-6 4 6 4z" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
      </>
    ),
    audio: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
    github: (
      <path
        d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0022 12c0-5.52-4.48-10-10-10z"
        fill="currentColor"
        stroke="none"
      />
    ),
  };
  return (
    <svg {...p} style={{ display: 'inline-block', flexShrink: 0 }}>
      {M[name] || null}
    </svg>
  );
}

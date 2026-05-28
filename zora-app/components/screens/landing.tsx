'use client';

// Landing page. Ported verbatim from design_handoff_zora/design_files/screens/landing.jsx.
// CTAs and nav buttons are wired to navigate (/chat, /login, /about, /contact).

import React from 'react';
import Link from 'next/link';
import { ZoraMark, ZoraWordmark, Icon } from '../logo';
import { SiteFooter } from './about-contact-terms';
import { useAuth } from '../AuthProvider';
import { useIsMobile } from '../useIsMobile';
import { MobileDrawer } from '../mobile-drawer';

export function Landing({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        width,
        minHeight: height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="no-scrollbar"
    >
      <LandingNav />
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
          gap: isMobile ? 0 : 32,
          padding: isMobile ? '20px 20px 0' : '32px 64px 0',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 60% 40%, black 0%, transparent 90%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {isMobile && (
            <div style={{ position: 'relative', marginTop: 12, marginBottom: 18 }}>
              <ZoraMark size={88} />
              <div
                style={{
                  position: 'absolute',
                  inset: -14,
                  border: '1px dashed rgba(200,204,210,0.2)',
                  borderRadius: '50%',
                  animation: 'spin-slow 30s linear infinite',
                }}
              />
            </div>
          )}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid var(--bd-2)',
              background: 'var(--bg-2)',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.2em',
              color: 'var(--t-2)',
              width: 'max-content',
              textTransform: 'uppercase',
              marginBottom: isMobile ? 18 : 28,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#28c840',
                boxShadow: '0 0 8px rgba(40, 200, 64, 0.75)',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            />
            v1.0 · NOW AVAILABLE
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: isMobile ? 42 : 78,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              color: 'var(--t-1)',
            }}
          >
            Intelligence,
            <br />
            <span
              style={{
                background: 'linear-gradient(180deg, #f5f6f8 0%, #6a6f78 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              beyond chat.
            </span>
          </h1>
          <p
            style={{
              marginTop: isMobile ? 16 : 24,
              maxWidth: 480,
              fontSize: isMobile ? 14 : 17,
              lineHeight: 1.55,
              color: 'var(--t-2)',
            }}
          >
            Meet <strong style={{ color: 'var(--t-1)', fontWeight: 600 }}>Zora</strong> — Xorvion&apos;s flagship assistant for thinking, building, and shipping. Upload anything, reason through anything, and pick up where you left off.
          </p>
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 10 : 12,
              marginTop: isMobile ? 22 : 36,
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Link
              href="/chat"
              className="btn primary"
              style={{
                fontSize: 15,
                padding: isMobile ? '14px 22px' : '14px 22px',
                textDecoration: 'none',
                justifyContent: 'center',
              }}
            >
              Start chatting free
              <Icon name="arrow" size={16} color="#0a0a0a" />
            </Link>
            <Link
              href="/?intro=1"
              className="btn ghost"
              style={{
                fontSize: 15,
                padding: '14px 22px',
                textDecoration: 'none',
                justifyContent: 'center',
              }}
            >
              <Icon name="play" size={14} /> Watch the intro
            </Link>
          </div>
          <div
            style={{
              display: isMobile ? 'grid' : 'flex',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
              gap: isMobile ? 16 : 24,
              marginTop: isMobile ? 22 : 24,
              paddingTop: 16,
              borderTop: '1px solid var(--bd-1)',
              maxWidth: 520,
              width: isMobile ? '100%' : undefined,
            }}
          >
            {([
              ['1M+', 'context window'],
              ['12+', 'languages'],
              ['7d', 'history retention'],
              ['<300ms', 'first token'],
            ] as const).map(([n, l]) => (
              <div key={l}>
                <div className="mono" style={{ fontSize: isMobile ? 18 : 22, color: 'var(--t-1)', fontWeight: 500 }}>
                  {n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--t-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginTop: 4,
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
        {!isMobile && <HeroPreview />}
      </div>
      <FeatureStrip />
      <div style={{ padding: isMobile ? '24px 18px 0' : '32px 64px 0' }}>
        <SiteFooter />
      </div>
    </div>
  );
}

export function LandingNav() {
  const { user } = useAuth();
  const loggedIn = !!user;
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks: ReadonlyArray<readonly [string, string]> = [
    ['Product', '/chat'],
    ['About', '/about'],
    ['Pricing', '/pricing'],
    ['Contact', '/contact'],
  ];

  return (
    <div
      style={{
        padding: isMobile ? '14px 18px' : '20px 64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--bd-1)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <ZoraWordmark size={isMobile ? 14 : 20} tagline />
      </Link>

      {!isMobile && (
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {navLinks.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{ color: 'var(--t-2)', fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {!isMobile && (
        <div style={{ display: 'flex', gap: 10 }}>
          {!loggedIn && (
            <Link
              href="/login"
              className="btn ghost"
              style={{ fontSize: 13, padding: '8px 14px', textDecoration: 'none' }}
            >
              Log in
            </Link>
          )}
          <Link
            href="/chat"
            className="btn primary"
            style={{ fontSize: 13, padding: '8px 16px', textDecoration: 'none' }}
          >
            Open Zora →
          </Link>
        </div>
      )}

      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!loggedIn && (
            <Link
              href="/login"
              className="btn ghost"
              style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
            >
              Log in
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--bd-2)',
              borderRadius: 8,
              cursor: 'pointer',
              padding: 8,
              color: 'var(--t-2)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="menu" size={18} />
          </button>
        </div>
      )}

      {isMobile && (
        <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
          <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--bd-1)' }}>
            <ZoraWordmark size={16} tagline />
          </div>
          <div style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column' }}>
            {navLinks.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: 'var(--t-1)',
                  fontSize: 15,
                  padding: '11px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ padding: '14px 14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!loggedIn && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn ghost"
                style={{ fontSize: 14, padding: '12px 16px', textDecoration: 'none', justifyContent: 'center' }}
              >
                Log in
              </Link>
            )}
            <Link
              href="/chat"
              onClick={() => setMenuOpen(false)}
              className="btn primary"
              style={{ fontSize: 14, padding: '12px 16px', textDecoration: 'none', justifyContent: 'center' }}
            >
              Open Zora →
            </Link>
          </div>
        </MobileDrawer>
      )}
    </div>
  );
}

function HeroPreview() {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <div style={{ position: 'absolute', right: 40, top: 40, filter: 'drop-shadow(0 8px 40px rgba(200,204,210,0.3))' }}>
        <div style={{ position: 'relative' }}>
          <ZoraMark size={120} />
          <div
            style={{
              position: 'absolute',
              inset: -20,
              border: '1px dashed rgba(200,204,210,0.2)',
              borderRadius: '50%',
              animation: 'spin-slow 30s linear infinite',
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: 460,
          background: 'var(--brushed)',
          border: '1px solid var(--bd-2)',
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingBottom: 14,
            borderBottom: '1px solid var(--bd-1)',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span
            className="mono"
            style={{ fontSize: 10, color: 'var(--t-2)', letterSpacing: '0.15em', marginLeft: 'auto' }}
          >
            ZORA · chat.zora.ai
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <div
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--bd-2)',
              padding: '10px 14px',
              borderRadius: '14px 14px 4px 14px',
              fontSize: 13,
              maxWidth: '78%',
              color: 'var(--t-1)',
            }}
          >
            Draft a launch email for our enterprise tier — tone: confident, not corporate.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <ZoraMark size={28} />
          <div style={{ background: 'transparent', padding: '4px 0', fontSize: 13, color: 'var(--t-2)', lineHeight: 1.6, flex: 1 }}>
            Sure — here&apos;s a draft. Subject line first, then body.
            <br />
            <span
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: 'linear-gradient(90deg, var(--t-3), var(--t-1), var(--t-3))',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 2s linear infinite',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
              }}
            >
              ◐ thinking through tone…
            </span>
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            padding: '10px 12px',
            background: 'var(--bg-1)',
            border: '1px solid var(--bd-2)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="paperclip" size={16} color="#7a7f87" />
          <span style={{ fontSize: 12, color: 'var(--t-4)', flex: 1 }}>Ask Zora anything…</span>
          <Icon name="mic" size={16} color="#7a7f87" />
          <div
            style={{
              background: 'var(--steel-shine)',
              width: 28,
              height: 28,
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="send" size={14} color="#0a0a0a" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureStrip() {
  const isMobile = useIsMobile();
  const features = [
    { icon: 'bolt', label: 'Streaming reasoning', sub: 'See thoughts as they form' },
    { icon: 'image', label: 'Multimodal input', sub: 'Images · PDFs · audio · code' },
    { icon: 'shield', label: '7-day auto-delete', sub: 'History wipes itself clean' },
    { icon: 'sparkle', label: 'Three minds', sub: 'Lite · Pro · Max routing' },
  ];
  return (
    <div
      style={{
        borderTop: '1px solid var(--bd-1)',
        padding: isMobile ? '20px 18px' : '24px 64px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 14 : 24,
        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.015))',
      }}
    >
      {features.map((f) => (
        <div key={f.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--bg-2)',
              border: '1px solid var(--bd-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--steel-200)',
              flexShrink: 0,
            }}
          >
            <Icon name={f.icon} size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t-1)' }}>{f.label}</div>
            <div style={{ fontSize: 12, color: 'var(--t-3)', marginTop: 2 }}>{f.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

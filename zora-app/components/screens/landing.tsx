'use client';

// Landing page. Ported verbatim from design_handoff_zora/design_files/screens/landing.jsx.
// CTAs and nav buttons are wired to navigate (/chat, /login, /about, /contact).

import React from 'react';
import Link from 'next/link';
import { ZoraMark, ZoraWordmark, Icon } from '../logo';
import { SiteFooter } from './about-contact-terms';
import { useAuth } from '../AuthProvider';

export function Landing({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
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
          gridTemplateColumns: '1.1fr 1fr',
          gap: 32,
          padding: '32px 64px 0',
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
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
              marginBottom: 28,
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
              fontSize: 78,
              lineHeight: 1.02,
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
          <p style={{ marginTop: 24, maxWidth: 480, fontSize: 17, lineHeight: 1.55, color: 'var(--t-2)' }}>
            Meet <strong style={{ color: 'var(--t-1)', fontWeight: 600 }}>Zora</strong> — Xorvion&apos;s flagship assistant for thinking, building, and shipping. Upload anything, reason through anything, and pick up where you left off.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
            <Link
              href="/chat"
              className="btn primary"
              style={{ fontSize: 15, padding: '14px 22px', textDecoration: 'none' }}
            >
              Start chatting free
              <Icon name="arrow" size={16} color="#0a0a0a" />
            </Link>
            <Link
              href="/?intro=1"
              className="btn ghost"
              style={{ fontSize: 15, padding: '14px 22px', textDecoration: 'none' }}
            >
              <Icon name="play" size={14} /> Watch the intro
            </Link>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--bd-1)',
              maxWidth: 520,
            }}
          >
            {([
              ['1M+', 'context window'],
              ['12+', 'languages'],
              ['7d', 'history retention'],
              ['<300ms', 'first token'],
            ] as const).map(([n, l]) => (
              <div key={l}>
                <div className="mono" style={{ fontSize: 22, color: 'var(--t-1)', fontWeight: 500 }}>
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
        <HeroPreview />
      </div>
      <FeatureStrip />
      <div style={{ padding: '32px 64px 0' }}>
        <SiteFooter />
      </div>
    </div>
  );
}

export function LandingNav() {
  const { user } = useAuth();
  const loggedIn = !!user;
  return (
    <div
      style={{
        padding: '20px 64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--bd-1)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <ZoraWordmark size={20} tagline />
      </Link>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {(
          [
            ['Product', '/chat'],
            ['About', '/about'],
            ['Pricing', '/pricing'],
            ['Contact', '/contact'],
          ] as const
        ).map(([label, href]) => (
          <Link
            key={label}
            href={href}
            style={{ color: 'var(--t-2)', fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}
          >
            {label}
          </Link>
        ))}
      </div>
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
            style={{ fontSize: 10, color: 'var(--t-4)', letterSpacing: '0.15em', marginLeft: 'auto' }}
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
        padding: '24px 64px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24,
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

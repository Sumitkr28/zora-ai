'use client';

// Intro splash — cinematic boot sequence ~4.2s.
// Ported verbatim from design_handoff_zora/design_files/screens/intro.jsx.
// Phase 7 will add sessionStorage suppression and route-to-/ on completion.

import React from 'react';
import { ZoraMark } from '../logo';

interface IntroSplashProps {
  width?: number;
  height?: number;
  onDone?: () => void;
  autoplay?: boolean;
}

export function IntroSplash({ width = 1280, height = 720, onDone, autoplay = true }: IntroSplashProps) {
  const [t, setT] = React.useState(0);
  const [replay, setReplay] = React.useState(0);
  const isMobile = width < 768;

  React.useEffect(() => {
    if (!autoplay) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const dur = 4200;
      const p = Math.min(100, (elapsed / dur) * 100);
      setT(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else if (onDone) setTimeout(onDone, 500);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [replay, autoplay, onDone]);

  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

  const gridIn = ease(clamp01(t / 18));
  const logoIn = ease(clamp01((t - 12) / 22));
  const ringsT = clamp01((t - 28) / 50);
  const sweepT = clamp01((t - 32) / 22);
  const wordIn = clamp01((t - 36) / 18);
  const barT = clamp01((t - 50) / 14);
  const tagT = clamp01((t - 60) / 20);
  const attribT = clamp01((t - 78) / 18);
  const fadeOut = clamp01((t - 92) / 8);

  const tagline = 'INTELLIGENCE BEYOND CHAT';
  const tagChars = Math.floor(tagline.length * tagT);

  const particles = React.useMemo(() => {
    const arr: { x: number; y: number; size: number; delay: number; drift: number }[] = [];
    for (let i = 0; i < 36; i++) {
      arr.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 1.5,
        delay: Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 30,
      });
    }
    return arr;
  }, [replay]);

  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at center, #16181c 0%, #060607 55%, #000 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - fadeOut,
        transition: 'opacity .3s',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          opacity: gridIn,
          maskImage: 'radial-gradient(ellipse 60% 50% at center, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at center, black 0%, transparent 75%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${clamp01(t / 60) * 100}%`,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(200,204,210,0.5), transparent)',
          opacity: t < 60 ? 0.5 : 0,
          boxShadow: '0 0 24px rgba(200,204,210,0.3)',
        }}
      />
      {particles.map((p, i) => {
        const phase = clamp01(t / 100 - p.delay);
        const cx = width / 2;
        const cy = height / 2;
        const startX = p.x * width;
        const startY = p.y * height;
        const x = startX + (cx - startX) * phase * 0.7 + Math.sin(t / 20 + i) * p.drift * 0.3;
        const y = startY + (cy - startY) * phase * 0.7;
        const op = phase > 0.85 ? (1 - (phase - 0.85) / 0.15) * 0.6 : phase * 0.6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: '#c8ccd2',
              opacity: op * gridIn,
              boxShadow: '0 0 4px rgba(200,204,210,0.6)',
              pointerEvents: 'none',
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,186,196,0.22) 0%, rgba(180,186,196,0.04) 40%, transparent 70%)',
          filter: 'blur(30px)',
          opacity: logoIn,
        }}
      />
      {[0, 1, 2, 3].map((i) => {
        const local = ringsT * 2 - i * 0.28;
        if (local <= 0 || local >= 1.3) return null;
        const p = Math.min(1, local);
        const ringEase = 1 - Math.pow(1 - p, 2.2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 180 + ringEase * 520,
              height: 180 + ringEase * 520,
              borderRadius: '50%',
              border: '1px solid rgba(200,204,210,0.55)',
              opacity: (1 - p) * 0.7,
              pointerEvents: 'none',
            }}
          />
        );
      })}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <div
          style={{
            position: 'relative',
            transform: `scale(${0.7 + logoIn * 0.3}) rotate(${(1 - logoIn) * -8}deg)`,
            opacity: logoIn,
            filter: `drop-shadow(0 0 40px rgba(232,234,238,${0.25 + logoIn * 0.2})) drop-shadow(0 12px 24px rgba(0,0,0,0.6))`,
            transition: 'filter .2s',
          }}
        >
          <ZoraMark size={isMobile ? 88 : 132} />
          <div
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: 22,
              border: '1px solid rgba(232,234,238,0.6)',
              transform: `scale(${1 + clamp01((t - 30) / 12) * 0.4})`,
              opacity: t > 30 && t < 50 ? 1 - clamp01((t - 30) / 18) : 0,
              pointerEvents: 'none',
            }}
          />
        </div>
        <div style={{ position: 'relative', opacity: wordIn, transform: `translateY(${(1 - wordIn) * 10}px)` }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? 40 : 68,
              letterSpacing: '0.34em',
              color: '#ececec',
              textTransform: 'uppercase',
              background: 'transparent',
              backgroundImage: `linear-gradient(105deg,
                #6a6f78 0%,
                #6a6f78 ${Math.max(0, sweepT * 100 - 18)}%,
                #ffffff ${sweepT * 100}%,
                #d4d6da ${Math.min(100, sweepT * 100 + 10)}%,
                #9aa0a8 ${Math.min(100, sweepT * 100 + 30)}%,
                #9aa0a8 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              paddingLeft: '0.34em',
            }}
          >
            ZORA
          </div>
        </div>
        <div style={{ width: isMobile ? 200 : 260, height: 1, background: 'rgba(255,255,255,0.06)', marginTop: -12, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: `${50 - barT * 50}%`,
              width: `${barT * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #c8ccd2 50%, transparent)',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            letterSpacing: '0.42em',
            color: '#9aa0a8',
            height: 16,
            minHeight: 16,
            marginTop: -8,
          }}
        >
          {tagline.slice(0, tagChars)}
          {tagT > 0 && tagT < 1 && (
            <span style={{ animation: 'typewriter-blink 0.6s steps(1) infinite', color: '#c8ccd2' }}>▎</span>
          )}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 36,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: '#50545b',
          textTransform: 'uppercase',
          opacity: gridIn,
          lineHeight: 1.8,
        }}
      >
        <div>SYS · zora.core</div>
        <div style={{ color: '#7a7f87' }}>node 04 · {t > 50 ? 'ready' : 'init'}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 28,
          right: 36,
          fontSize: 10,
          letterSpacing: '0.25em',
          color: '#7a7f87',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: gridIn,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: t > 80 ? '#a4d8a8' : '#c8ccd2',
            boxShadow: `0 0 8px ${t > 80 ? '#a4d8a8' : '#c8ccd2'}`,
            animation: 'pulse-glow 1.2s ease-in-out infinite',
          }}
        />
        {t > 80 ? 'ONLINE' : 'HANDSHAKE'}
      </div>
      {[
        { top: 28, left: 28, rot: 0 },
        { top: 28, right: 28, rot: 90 },
        { bottom: 28, right: 28, rot: 180 },
        { bottom: 28, left: 28, rot: 270 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 18,
            height: 18,
            borderTop: '1px solid rgba(200,204,210,0.35)',
            borderLeft: '1px solid rgba(200,204,210,0.35)',
            transform: `rotate(${pos.rot}deg)`,
            opacity: gridIn,
            ...pos,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? 56 : 70,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? Math.min(260, width - 40) : 320,
          height: 2,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 1,
          overflow: 'hidden',
          opacity: gridIn,
        }}
      >
        <div
          style={{
            width: `${t}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(200,204,210,0.2), #e4e6ea, rgba(200,204,210,0.2))',
            transition: 'width .12s linear',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 10,
          letterSpacing: '0.34em',
          color: '#50545b',
          textTransform: 'uppercase',
          opacity: attribT,
        }}
      >
        <span style={{ color: '#7a7f87' }}>a </span>
        <span style={{ color: '#9aa0a8' }}>XORVION</span>
        <span style={{ color: '#7a7f87' }}> product · v1.0</span>
      </div>
      {t >= 100 && (
        <button
          onClick={() => setReplay((r) => r + 1)}
          style={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#9aa0a8',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            padding: '8px 18px',
            letterSpacing: '0.22em',
            cursor: 'pointer',
            borderRadius: 6,
          }}
        >
          ↻ REPLAY
        </button>
      )}
      {t < 100 && (
        <button
          onClick={onDone}
          style={{
            position: 'absolute',
            bottom: 28,
            right: 28,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#9aa0a8',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            padding: '7px 14px',
            letterSpacing: '0.25em',
            cursor: 'pointer',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          SKIP <span style={{ opacity: 0.5 }}>→</span>
        </button>
      )}
    </div>
  );
}

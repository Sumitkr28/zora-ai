'use client';

// Mobile screens — for iOS frame embedding (390x844 content area).
// Ported verbatim from design_handoff_zora/design_files/screens/mobile.jsx.

import React from 'react';
import { ZoraMark, ZoraWordmark, Icon } from '../logo';

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 7,
  borderRadius: 7,
  color: 'var(--t-2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function MobileLanding({ width = 390, height = 844 }: { width?: number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at top, #1b1d22 0%, #060607 60%)',
        color: 'var(--t-1)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ZoraWordmark size={13} tagline={false} />
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--t-2)',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
          }}
        >
          <Icon name="menu" size={20} />
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '30px 24px 0',
          position: 'relative',
        }}
      >
        <div style={{ filter: 'drop-shadow(0 8px 40px rgba(200,204,210,0.25))', marginBottom: 28 }}>
          <ZoraMark size={88} />
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>
          v1.0 · NOW AVAILABLE
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: '-0.035em',
            textAlign: 'center',
            lineHeight: 1.05,
            marginBottom: 16,
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
            margin: 0,
            fontSize: 14,
            color: 'var(--t-3)',
            textAlign: 'center',
            maxWidth: 300,
            lineHeight: 1.55,
          }}
        >
          Meet Zora — your assistant for thinking, building, and shipping.
        </p>
      </div>

      <div
        style={{
          padding: '28px 24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
        }}
      >
        <button
          className="btn primary"
          style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14 }}
        >
          Start chatting <Icon name="arrow" size={14} color="#0a0a0a" />
        </button>
        <button className="btn ghost" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14 }}>
          Log in
        </button>
      </div>

      <div style={{ padding: '28px 20px 100px', display: 'grid', gap: 10, position: 'relative' }}>
        {[
          { icon: 'bolt', label: 'Streaming answers', sub: 'See it think in real time' },
          { icon: 'image', label: 'Upload anything', sub: 'Images · PDFs · audio' },
          { icon: 'shield', label: '7-day auto-delete', sub: 'Your history stays yours' },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              background: 'var(--bg-1)',
              border: '1px solid var(--bd-2)',
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--bg-3)',
                border: '1px solid var(--bd-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c8ccd2',
              }}
            >
              <Icon name={f.icon} size={17} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--t-1)' }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'var(--t-3)', marginTop: 2 }}>{f.sub}</div>
            </div>
            <Icon name="arrow" size={14} color="#7a7f87" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileChat({ width = 390, height = 844 }: { width?: number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--bd-1)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button style={iconBtn}>
          <Icon name="menu" size={18} />
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Zora{' '}
            <span
              style={{
                fontSize: 10,
                color: 'var(--t-3)',
                marginLeft: 4,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.1em',
                padding: '2px 6px',
                border: '1px solid var(--bd-2)',
                borderRadius: 4,
              }}
            >
              PRO
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--t-3)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.1em',
              marginTop: 2,
            }}
          >
            online · 12k tokens left
          </div>
        </div>
        <button style={iconBtn}>
          <Icon name="plus" size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 12px' }} className="no-scrollbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              textAlign: 'center',
              fontSize: 10,
              color: 'var(--t-4)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.2em',
            }}
          >
            TODAY · 2:14 PM
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--bd-2)',
                padding: '10px 14px',
                borderRadius: '14px 14px 4px 14px',
                fontSize: 13.5,
                maxWidth: '80%',
                lineHeight: 1.5,
              }}
            >
              What&apos;s a virtualized list and when do I need one?
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <ZoraMark size={26} />
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ fontSize: 13.5, color: 'var(--t-2)', lineHeight: 1.6 }}>
                Only render the rows that are currently visible. You need one whenever you have{' '}
                <strong style={{ color: 'var(--t-1)' }}>1,000+ items</strong> in a scrolling list — otherwise
                React&apos;s reconciler eats a lot of memory and the scroll feels chunky.
              </div>
              <div
                style={{
                  marginTop: 10,
                  background: '#0a0b0d',
                  border: '1px solid var(--bd-1)',
                  borderRadius: 10,
                  padding: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  lineHeight: 1.6,
                  color: '#c8ccd2',
                }}
              >
                <div style={{ color: '#9bb6ff' }}>const</div> start = scrollTop / rowHeight;
                <br />
                <div style={{ color: '#9bb6ff' }}>const</div> visible = items.slice(start, end);
              </div>
              <div style={{ display: 'flex', gap: 2, marginTop: 10, color: 'var(--t-3)' }}>
                {(['copy', 'refresh', 'thumbUp'] as const).map((i) => (
                  <button key={i} style={{ ...iconBtn, padding: 5 }}>
                    <Icon name={i} size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 6,
                maxWidth: '80%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--bd-2)',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 5,
                    background: 'linear-gradient(135deg, #43474e, #1a1c20)',
                    border: '1px solid var(--bd-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="image" size={13} color="#9aa0a8" />
                </div>
                <div>
                  <div style={{ fontSize: 12 }}>list-mock.png</div>
                  <div
                    style={{ fontSize: 9, color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    PNG · 248kb
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--bd-2)',
                  padding: '10px 14px',
                  borderRadius: '14px 14px 4px 14px',
                  fontSize: 13.5,
                }}
              >
                Now apply it to this mock.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <ZoraMark size={26} />
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                  fontSize: 10,
                  color: '#9aa0a8',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.1em',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#c8ccd2',
                    animation: 'pulse-glow 1.2s infinite',
                  }}
                />
                STREAMING
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--t-2)', lineHeight: 1.6 }}>
                Looking at your mock — rows wrap to different heights, so you&apos;ll need a measurement cache
                <span
                  style={{
                    background: '#c8ccd2',
                    width: 7,
                    height: 12,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginLeft: 3,
                    animation: 'typewriter-blink 0.7s steps(1) infinite',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 12px 14px', borderTop: '1px solid var(--bd-1)', background: 'var(--bg-0)' }}>
        <div
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--bd-2)',
            borderRadius: 22,
            padding: '8px 8px 8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <button style={iconBtn}>
            <Icon name="plus" size={18} />
          </button>
          <input
            placeholder="Ask Zora…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--t-1)',
              fontFamily: 'inherit',
              fontSize: 14,
              padding: '6px 4px',
            }}
          />
          <button style={iconBtn}>
            <Icon name="mic" size={18} />
          </button>
          <button
            style={{
              background: 'var(--steel-shine)',
              border: 'none',
              cursor: 'pointer',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0a',
            }}
          >
            <Icon name="send" size={14} color="#0a0a0a" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileLogin({ width = 390, height = 844 }: { width?: number; height?: number }) {
  const [otp] = React.useState<string[]>(['1', '4', '2', '', '', '']);
  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(154,160,168,0.2), transparent 60%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <button
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--t-3)',
          cursor: 'pointer',
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
          fontSize: 13,
          fontFamily: 'inherit',
        }}
      >
        <Icon name="arrowLeft" size={14} /> back
      </button>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <ZoraMark size={64} />
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ZoraWordmark size={14} tagline={false} />
        </div>
        <h2
          style={{
            margin: '24px 0 8px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            textAlign: 'center',
          }}
        >
          Enter the code
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--t-3)',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Sent to{' '}
          <span style={{ color: 'var(--t-1)', fontFamily: "'JetBrains Mono', monospace" }}>+91 98765 43210</span>
        </p>

        <div style={{ display: 'flex', gap: 7, marginBottom: 24, width: '100%', maxWidth: 320 }}>
          {otp.map((d, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                aspectRatio: '1',
                background: d ? 'var(--bg-3)' : 'var(--bg-2)',
                border: '1px solid ' + (d ? 'var(--bd-bright)' : 'var(--bd-2)'),
                borderRadius: 10,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                fontWeight: 500,
                color: 'var(--t-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <button
          className="btn primary"
          style={{ width: '100%', maxWidth: 320, justifyContent: 'center', padding: 14, fontSize: 14 }}
        >
          Verify <Icon name="check" size={14} color="#0a0a0a" />
        </button>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--t-3)' }}>
          Didn&apos;t get it?{' '}
          <span style={{ color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}>
            resend in 24s
          </span>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: 9,
          color: 'var(--t-4)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          paddingTop: 16,
          borderTop: '1px solid var(--bd-1)',
        }}
      >
        XORVION · END-TO-END ENCRYPTED
      </div>
    </div>
  );
}

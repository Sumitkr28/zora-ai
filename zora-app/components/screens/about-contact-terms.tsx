'use client';

// About / Contact / Terms + shared SiteFooter.
// Contact form writes to the Firestore /feedback collection (security rule allows public create).

import React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { ZoraMark, ZoraWordmark, Icon } from '../logo';
import { LandingNav } from './landing';

export function AboutScreen({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        overflow: 'auto',
        position: 'relative',
      }}
      className="no-scrollbar"
    >
      <LandingNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 56px' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          ABOUT
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 64,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          Built by{' '}
          <span
            style={{
              background: 'linear-gradient(180deg, #f5f6f8 0%, #6a6f78 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            Xorvion
          </span>{' '}
          — for thinkers, makers, and the slightly impatient.
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 48,
            marginBottom: 56,
            alignItems: 'start',
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--t-2)' }}>
            <p style={{ marginTop: 0 }}>
              Zora is Xorvion&apos;s flagship assistant. We started with one question:{' '}
              <em style={{ color: 'var(--t-1)' }}>why does most AI feel like a search bar with manners?</em> We
              wanted something that thinks alongside you — reads what you upload, remembers the context you&apos;ve
              built up over the day, and quietly forgets when you&apos;d rather it didn&apos;t.
            </p>
            <p>
              So we built it that way. Three model tiers — Lite, Pro, Max — auto-route by complexity. Your chats
              save for seven days unless you say otherwise. Upload images, PDFs, audio, code. Sign in once;
              everything syncs. Don&apos;t sign in; it forgets you the moment you leave.
            </p>
            <p>
              Xorvion is a small team in Noida building tools we want to use ourselves. Zora is our first
              product. We&apos;re shipping fast and reading every email.
            </p>
          </div>

          <div
            style={{
              background: 'var(--brushed)',
              border: '1px solid var(--bd-2)',
              borderRadius: 18,
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(60% 80% at 30% 0%, rgba(200,204,210,0.12), transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <ZoraMark size={64} />
              <div className="eyebrow" style={{ margin: '20px 0 6px' }}>
                THE PRODUCT
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  marginBottom: 16,
                }}
              >
                Zora v1.0
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {(
                  [
                    ['NAME', 'Zora'],
                    ['MAKER', 'Xorvion Pvt Ltd'],
                    ['RELEASE', 'May 2026'],
                    ['MODELS', 'Lite · Pro · Max'],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span
                      style={{
                        width: 80,
                        color: 'var(--t-3)',
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '0.15em',
                      }}
                    >
                      {k}
                    </span>
                    <span style={{ color: 'var(--t-1)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 18 }}>
          OUR PRINCIPLES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            {
              n: '01',
              title: 'Forget by default',
              desc:
                "Seven days of memory is plenty. Logged-out chats vanish on refresh. You shouldn't have to ask.",
            },
            {
              n: '02',
              title: 'Useful first, clever second',
              desc:
                'Streaming, code blocks, file reading, real reasoning — not chrome and animations. Well, mostly not.',
            },
            {
              n: '03',
              title: 'Pick your weight class',
              desc:
                "Lite answers fast. Pro is the daily driver. Max thinks before it types. You're always in control of the trade.",
            },
          ].map((p) => (
            <div
              key={p.n}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--bd-2)',
                borderRadius: 14,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--t-4)',
                  letterSpacing: '0.2em',
                  marginBottom: 14,
                }}
              >
                {p.n}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 8,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.01em',
                }}
              >
                {p.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--t-3)', lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

export function ContactScreen({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
  const [form, setForm] = React.useState({ name: '', email: '', topic: 'General', message: '' });
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setError(null);
    setBusy(true);

    // 1) Write to Firestore /feedback as the durable backup record (works on Spark).
    const firestorePromise = addDoc(collection(getDb(), 'feedback'), {
      name: form.name.trim(),
      email: form.email.trim(),
      topic: form.topic,
      message: form.message.trim(),
      createdAt: serverTimestamp(),
    });

    // 2) Forward to xorvion.ai@gmail.com via the most reliable email forwarder we have:
    //    - If NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is set → use Web3Forms (recommended; 250/mo free,
    //      no spam-folder problem, no activation step).
    //    - Otherwise → fall back to FormSubmit.co (free, no key, but the activation email it
    //      sends on first use almost always lands in Gmail spam).
    const w3fKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    const emailPromise: Promise<Response> = w3fKey
      ? fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: w3fKey,
            subject: `Zora contact — ${form.topic} from ${form.name.trim()}`,
            from_name: 'Zora contact form',
            name: form.name.trim(),
            email: form.email.trim(),
            topic: form.topic,
            message: form.message.trim(),
            replyto: form.email.trim(),
          }),
        })
      : fetch('https://formsubmit.co/ajax/xorvion.ai@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            topic: form.topic,
            message: form.message.trim(),
            _subject: `Zora contact — ${form.topic} from ${form.name.trim()}`,
            _captcha: 'false',
            _replyto: form.email.trim(),
          }),
        });

    try {
      const [firestoreResult, emailResult] = await Promise.allSettled([
        firestorePromise,
        emailPromise,
      ]);
      if (firestoreResult.status === 'rejected' && emailResult.status === 'rejected') {
        throw new Error('Both Firestore and email forwarder failed. Please try again.');
      }
      if (firestoreResult.status === 'rejected') {
        console.warn('Firestore write failed (email still forwarded):', firestoreResult.reason);
      }
      if (emailResult.status === 'rejected') {
        console.warn('Email forwarder failed (Firestore record saved):', emailResult.reason);
      } else if (emailResult.value.status >= 400) {
        const body = await emailResult.value.text().catch(() => '');
        console.warn(`Email forwarder returned HTTP ${emailResult.value.status}:`, body);
      }
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        overflow: 'auto',
        position: 'relative',
      }}
      className="no-scrollbar"
    >
      <LandingNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 56px' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          SAY HELLO
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 60,
            letterSpacing: '-0.035em',
            marginBottom: 12,
          }}
        >
          Contact us
        </h1>
        <p style={{ fontSize: 16, color: 'var(--t-3)', maxWidth: 540, marginBottom: 40 }}>
          Questions, feedback, partnership ideas, bug reports — we read everything that lands in our inbox.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, alignItems: 'start' }}>
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--bd-2)',
              borderRadius: 16,
              padding: 28,
            }}
          >
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    margin: '0 auto 18px',
                    borderRadius: '50%',
                    background: 'var(--steel-shine)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="check" size={28} color="#0a0a0a" strokeWidth={3} />
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                >
                  Message sent.
                </div>
                <p style={{ fontSize: 13, color: 'var(--t-3)', margin: '0 0 14px' }}>
                  We&apos;ll get back to you within 24 hours.
                </p>
                <a
                  href={`mailto:xorvion.ai@gmail.com?subject=${encodeURIComponent(
                    `Zora contact: ${form.topic} from ${form.name}`,
                  )}&body=${encodeURIComponent(
                    `From: ${form.name} <${form.email}>\nTopic: ${form.topic}\n\n${form.message}`,
                  )}`}
                  style={{
                    fontSize: 12,
                    color: 'var(--t-3)',
                    textDecoration: 'underline',
                    display: 'inline-block',
                  }}
                >
                  Or open your email app to send directly
                </a>
                <div>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ name: '', email: '', topic: 'General', message: '' });
                    }}
                    type="button"
                    className="btn ghost"
                    style={{ marginTop: 20 }}
                  >
                    Send another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <FormField label="Name">
                    <input
                      className="input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Email">
                    <input
                      className="input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </FormField>
                </div>
                <FormField label="Topic" style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['General', 'Bug', 'Feedback', 'Partnership', 'Press'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, topic: t })}
                        style={{
                          background: form.topic === t ? 'var(--bg-3)' : 'transparent',
                          border: '1px solid ' + (form.topic === t ? 'var(--bd-bright)' : 'var(--bd-2)'),
                          color: form.topic === t ? 'var(--t-1)' : 'var(--t-3)',
                          fontFamily: 'inherit',
                          fontSize: 12,
                          padding: '6px 12px',
                          borderRadius: 7,
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Message" style={{ marginBottom: 18 }}>
                  <textarea
                    className="input"
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ resize: 'vertical', fontFamily: 'inherit', minHeight: 120 }}
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: 13,
                    opacity: busy ? 0.6 : 1,
                    cursor: busy ? 'wait' : 'pointer',
                  }}
                >
                  {busy ? 'Sending…' : 'Send message'} <Icon name="send" size={14} color="#0a0a0a" />
                </button>
                {error && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: '#d97064',
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </div>
                )}
              </>
            )}
          </form>

          <div>
            <div
              style={{
                background: 'var(--brushed)',
                border: '1px solid var(--bd-2)',
                borderRadius: 16,
                padding: 24,
                marginBottom: 14,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                DIRECT
              </div>
              <a
                href="mailto:xorvion.ai@gmail.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--bd-1)',
                  color: 'var(--t-1)',
                  textDecoration: 'none',
                }}
              >
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
                  }}
                >
                  <Icon name="mail" size={16} color="#c8ccd2" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--t-3)',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    EMAIL US
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: 'var(--t-1)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    xorvion.ai@gmail.com
                  </div>
                </div>
                <Icon name="arrow" size={14} color="#7a7f87" />
              </a>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--bd-1)',
                }}
              >
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
                  }}
                >
                  <Icon name="pin" size={16} color="#c8ccd2" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--t-3)',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    HEADQUARTERS
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--t-1)' }}>Noida, India</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 0' }}>
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
                  }}
                >
                  <Icon name="clock" size={16} color="#c8ccd2" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--t-3)',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    RESPONSE TIME
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--t-1)' }}>Within 24 hours</div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--bd-2)',
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                FOLLOW XORVION
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SocialRow icon="globe" name="xorvion-ai.vercel.app" handle="company website" />
                <SocialRow icon="link" name="linkedin.com/company/xorvion" handle="LinkedIn" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

function SocialRow({ icon, name, handle }: { icon: string; name: string; handle: string }) {
  return (
    <a
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: 'var(--bg-2)',
        border: '1px solid var(--bd-1)',
        borderRadius: 10,
        cursor: 'pointer',
        color: 'var(--t-1)',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: 'var(--bg-3)',
          border: '1px solid var(--bd-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={14} color="#c8ccd2" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: 'var(--t-1)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--t-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginTop: 1,
          }}
        >
          {handle}
        </div>
      </div>
      <Icon name="arrow" size={13} color="#7a7f87" />
    </a>
  );
}

function FormField({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 11,
          color: 'var(--t-3)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function TermsScreen({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
  const sections = [
    {
      n: '01',
      title: 'Using Zora',
      body:
        'Zora is provided by Xorvion Pvt Ltd. You may use Zora for personal, business, and educational purposes. You agree not to abuse, reverse-engineer, or use the service to generate content that violates applicable law.',
    },
    {
      n: '02',
      title: 'Accounts & login',
      body:
        "You can use Zora without an account in guest mode. Account creation requires verification via phone OTP, email OTP, or Google sign-in. You're responsible for keeping your access credentials secure.",
    },
    {
      n: '03',
      title: 'Chat history & retention',
      body:
        'Chats stored against your account auto-delete 7 days after your last reply in that thread. Guest-mode chats are not stored at all — they disappear when you refresh or close the tab.',
    },
    {
      n: '04',
      title: 'Media uploads',
      body:
        'Media uploads (images, PDFs, audio, files) require a verified account. Uploads are processed for your prompt and discarded shortly afterward. We do not train on Pro or Max conversations.',
    },
    {
      n: '05',
      title: 'Limits & fair use',
      body:
        'Free and Pro tiers carry token and rate limits to keep the service fast for everyone. Excessive automated use may be rate-limited or paused.',
    },
    {
      n: '06',
      title: 'Liability',
      body:
        "Zora can make mistakes. Don't rely on outputs for medical, legal, or financial decisions without independent verification. Xorvion provides Zora \"as is\" without warranties.",
    },
    {
      n: '07',
      title: 'Changes',
      body:
        'We may update these terms. Material changes will be announced at least 14 days in advance via email and in-product banner.',
    },
  ];

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        overflow: 'auto',
        position: 'relative',
      }}
      className="no-scrollbar"
    >
      <LandingNav />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 56px' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          LEGAL
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 60,
            letterSpacing: '-0.035em',
            marginBottom: 12,
          }}
        >
          Terms & conditions
        </h1>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 40,
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--t-3)',
          }}
        >
          <span className="mono">Last updated: May 12, 2026</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--t-4)' }} />
          <span className="mono">v1.0.2</span>
          <span style={{ flex: 1 }} />
          <button className="btn ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Icon name="file" size={12} /> Download PDF
          </button>
        </div>

        <div
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--bd-2)',
            borderRadius: 14,
            padding: 22,
            marginBottom: 36,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <Icon name="info" size={20} color="#c8ccd2" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>The plain-language version</div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--t-3)', lineHeight: 1.6 }}>
              Be decent. Don&apos;t break the law. Your chats save for 7 days. Uploads need an account. We won&apos;t
              train on your Pro/Max chats. Zora can be wrong; double-check important stuff.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 }}>
          {sections.map((s) => (
            <div
              key={s.n}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr',
                gap: 24,
                paddingBottom: 24,
                borderBottom: '1px solid var(--bd-1)',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--t-4)',
                  letterSpacing: '0.2em',
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--t-2)', lineHeight: 1.65 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

export function PricingScreen({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
  const plans = [
    {
      key: 'free',
      eyebrow: 'STARTER',
      name: 'Free',
      price: '$0',
      cadence: '/ month',
      tagline: 'For exploring Zora.',
      features: [
        '50 messages per day',
        'Lite model — fast, lightweight answers',
        'No chat history (guest mode)',
        'Image uploads up to 10 MB',
        'Sign in any time to upgrade',
      ],
      cta: 'Start free',
      ctaHref: '/chat',
      ctaEnabled: true,
      highlight: false,
      shine: false,
    },
    {
      key: 'lite',
      eyebrow: 'MOST POPULAR',
      name: 'Lite',
      price: '$2',
      cadence: '/ month',
      tagline: 'For everyday use.',
      features: [
        '500 messages per day',
        'Pro model — deeper reasoning',
        '7-day chat history',
        'PDF, audio, and video uploads',
        'Priority response queue',
        'Email support',
      ],
      cta: 'Coming soon',
      ctaHref: '#',
      ctaEnabled: false,
      highlight: true,
      shine: false,
    },
    {
      key: 'pro',
      eyebrow: 'MAX TIER',
      name: 'Pro',
      price: '$5',
      cadence: '/ month',
      tagline: 'For power users & teams.',
      features: [
        'Unlimited messages',
        'Max model — best of Zora',
        'Unlimited chat history',
        'Unlimited file uploads, any type',
        'Priority support · early access',
        'No training on your conversations',
      ],
      cta: 'Coming soon',
      ctaHref: '#',
      ctaEnabled: false,
      highlight: false,
      shine: true,
    },
  ] as const;

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        overflow: 'auto',
        position: 'relative',
      }}
      className="no-scrollbar"
    >
      <LandingNav />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 56px' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          PRICING
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 60,
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            marginBottom: 16,
            maxWidth: 760,
          }}
        >
          Choose your{' '}
          <span
            style={{
              background: 'linear-gradient(180deg, #f5f6f8 0%, #6a6f78 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            plan.
          </span>
        </h1>
        <p style={{ margin: '0 0 48px', fontSize: 16, color: 'var(--t-3)', lineHeight: 1.6, maxWidth: 640 }}>
          Start free. Upgrade when you outgrow the limits. Every plan ships with the same brushed-steel
          Zora you already know — only the capacity changes.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginBottom: 56,
            alignItems: 'stretch',
          }}
        >
          {plans.map((p) => (
            <div
              key={p.key}
              style={{
                background: p.shine
                  ? 'linear-gradient(115deg, var(--bg-2) 0%, var(--bg-2) 38%, rgba(255,255,255,0.10) 50%, var(--bg-2) 62%, var(--bg-2) 100%)'
                  : p.highlight
                  ? 'var(--bg-2)'
                  : 'var(--bg-1)',
                backgroundSize: p.shine ? '220% 100%' : undefined,
                animation: p.shine ? 'shimmer 5s linear infinite' : undefined,
                border: p.highlight || p.shine ? '1px solid var(--bd-3)' : '1px solid var(--bd-2)',
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: p.highlight
                  ? '0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.4), 0 0 60px rgba(200,204,210,0.15)'
                  : p.shine
                  ? '0 0 0 1px rgba(255,255,255,0.08), 0 18px 48px rgba(0,0,0,0.45)'
                  : 'none',
              }}
            >
              <div
                className="eyebrow"
                style={{
                  marginBottom: 14,
                  color: p.highlight || p.shine ? 'var(--t-1)' : 'var(--t-4)',
                }}
              >
                {p.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 500,
                  fontSize: 28,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                {p.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                    fontSize: 44,
                    letterSpacing: '-0.03em',
                    color: 'var(--t-1)',
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 13, color: 'var(--t-3)' }}>{p.cadence}</span>
              </div>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--t-3)', lineHeight: 1.5 }}>
                {p.tagline}
              </p>

              <div
                style={{
                  borderTop: '1px solid var(--bd-1)',
                  paddingTop: 18,
                  marginBottom: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  flex: 1,
                }}
              >
                {p.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 13,
                      color: 'var(--t-2)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: p.highlight ? 'var(--steel-shine)' : 'var(--bg-3)',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Icon
                        name="check"
                        size={11}
                        color={p.highlight ? '#0a0a0a' : 'var(--t-1)'}
                        strokeWidth={3}
                      />
                    </span>
                    {f}
                  </div>
                ))}
              </div>

              <a
                href={p.ctaEnabled ? p.ctaHref : undefined}
                className={`btn ${p.highlight || p.shine ? 'primary' : ''}`}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: 12,
                  fontSize: 14,
                  textDecoration: 'none',
                  opacity: p.ctaEnabled ? 1 : 0.55,
                  cursor: p.ctaEnabled ? 'pointer' : 'not-allowed',
                }}
                onClick={p.ctaEnabled ? undefined : (e) => e.preventDefault()}
                aria-disabled={!p.ctaEnabled}
              >
                {p.cta}
                {p.ctaEnabled && (
                  <Icon name="arrow" size={14} color={p.highlight ? '#0a0a0a' : 'currentColor'} />
                )}
              </a>
            </div>
          ))}
        </div>

        <div
          style={{
            border: '1px solid var(--bd-2)',
            borderRadius: 14,
            padding: 22,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            background: 'var(--bg-1)',
            marginBottom: 48,
          }}
        >
          <Icon name="info" size={20} color="#c8ccd2" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Need something custom?</div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--t-3)', lineHeight: 1.6 }}>
              Teams, agencies, and educational use cases can request a tailored quote. Email{' '}
              <a href="mailto:xorvion.ai@gmail.com" style={{ color: 'var(--t-2)' }}>
                xorvion.ai@gmail.com
              </a>{' '}
              or use the{' '}
              <a href="/contact" style={{ color: 'var(--t-2)' }}>
                contact form
              </a>{' '}
              and we&apos;ll get back to you.
            </p>
          </div>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

const socialIconStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'var(--bg-2)',
  border: '1px solid var(--bd-2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--t-2)',
  cursor: 'pointer',
  textDecoration: 'none',
};

export function SiteFooter() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--bd-1)',
        paddingTop: 32,
        paddingBottom: 24,
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 32,
        marginTop: 8,
      }}
    >
      <div>
        <ZoraWordmark size={16} tagline />
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--t-3)', maxWidth: 280, lineHeight: 1.6 }}>
          Intelligence beyond chat. Built by Xorvion in Noida, India.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <a
            href="https://xorvion-ai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            title="xorvion-ai.vercel.app"
            aria-label="Xorvion website"
            style={socialIconStyle}
          >
            <Icon name="globe" size={14} />
          </a>
          <a
            href="https://linkedin.com/company/xorvion"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            aria-label="LinkedIn"
            style={socialIconStyle}
          >
            <Icon name="link" size={14} />
          </a>
          <a
            href="/contact"
            title="Contact us"
            aria-label="Contact us"
            style={socialIconStyle}
          >
            <Icon name="mail" size={14} />
          </a>
        </div>
      </div>
      <FooterCol
        title="Product"
        links={[
          ['Chat', '/chat'],
          ['Pricing', '/pricing'],
        ]}
      />
      <FooterCol
        title="Company"
        links={[
          ['About', '/about'],
          ['Contact', '/contact'],
          ['Careers', '/contact'],
        ]}
      />
      <FooterCol
        title="Legal"
        links={[
          ['Terms', '/terms'],
          ['Privacy', '/terms'],
          ['Data deletion', '/account'],
        ]}
      />
      <div
        style={{
          gridColumn: '1 / -1',
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--bd-1)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--t-4)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.1em',
        }}
      >
        <span>© 2026 XORVION PVT LTD · ALL RIGHTS RESERVED</span>
        <span>XORVION.AI@GMAIL.COM</span>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map(([label, href]) => (
          <a
            key={label}
            href={href}
            style={{ fontSize: 13, color: 'var(--t-2)', cursor: 'pointer', textDecoration: 'none' }}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

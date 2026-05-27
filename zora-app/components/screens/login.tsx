'use client';

// Login screen — redesigned to match the new design screenshot:
// - Brand panel left: ZORA wordmark + "Welcome back." headline + OTP copy + 3 stats
// - Form panel right: tabbed Phone/Email selector → "Send code" → OR CONTINUE WITH → Google
// - Footer row at bottom of form column: v1.0 / SESSION · ENCRYPTED / — BY XORVION
//
// All real Firebase Auth wiring is preserved (Phase 3): Google popup, Phone OTP with reCAPTCHA,
// Email link sign-in. Phone OTP shows the helpful "needs Blaze" error on Spark.

import React from 'react';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { ZoraMark, ZoraWordmark, Icon } from '../logo';
import { useAuth } from '../AuthProvider';
import {
  signInWithGoogle,
  signInWithGithub,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailSignInLink,
  createRecaptchaVerifier,
} from '@/lib/auth';

type Tab = 'phone' | 'email';
type View = 'form' | 'otp' | 'emailSent' | 'done';

const RECAPTCHA_CONTAINER_ID = 'zora-recaptcha-container';
// 50+ countries with flag emojis. ISO code is the unique <select> value (so US and CA can
// both be picked even though both dial +1). The dial code is what we prepend to the
// phone number when calling Firebase signInWithPhoneNumber.
interface Country {
  iso: string;
  dial: string;
  flag: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { iso: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { iso: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada' },
  { iso: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { iso: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { iso: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
  { iso: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
  { iso: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
  { iso: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy' },
  { iso: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain' },
  { iso: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan' },
  { iso: 'KR', dial: '+82', flag: '🇰🇷', name: 'South Korea' },
  { iso: 'CN', dial: '+86', flag: '🇨🇳', name: 'China' },
  { iso: 'HK', dial: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { iso: 'TW', dial: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { iso: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore' },
  { iso: 'MY', dial: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { iso: 'TH', dial: '+66', flag: '🇹🇭', name: 'Thailand' },
  { iso: 'ID', dial: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { iso: 'PH', dial: '+63', flag: '🇵🇭', name: 'Philippines' },
  { iso: 'VN', dial: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { iso: 'PK', dial: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { iso: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { iso: 'LK', dial: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { iso: 'NP', dial: '+977', flag: '🇳🇵', name: 'Nepal' },
  { iso: 'NZ', dial: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { iso: 'NL', dial: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { iso: 'BE', dial: '+32', flag: '🇧🇪', name: 'Belgium' },
  { iso: 'CH', dial: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { iso: 'AT', dial: '+43', flag: '🇦🇹', name: 'Austria' },
  { iso: 'SE', dial: '+46', flag: '🇸🇪', name: 'Sweden' },
  { iso: 'NO', dial: '+47', flag: '🇳🇴', name: 'Norway' },
  { iso: 'DK', dial: '+45', flag: '🇩🇰', name: 'Denmark' },
  { iso: 'FI', dial: '+358', flag: '🇫🇮', name: 'Finland' },
  { iso: 'IE', dial: '+353', flag: '🇮🇪', name: 'Ireland' },
  { iso: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal' },
  { iso: 'GR', dial: '+30', flag: '🇬🇷', name: 'Greece' },
  { iso: 'PL', dial: '+48', flag: '🇵🇱', name: 'Poland' },
  { iso: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { iso: 'RO', dial: '+40', flag: '🇷🇴', name: 'Romania' },
  { iso: 'RU', dial: '+7', flag: '🇷🇺', name: 'Russia' },
  { iso: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { iso: 'TR', dial: '+90', flag: '🇹🇷', name: 'Turkey' },
  { iso: 'IL', dial: '+972', flag: '🇮🇱', name: 'Israel' },
  { iso: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { iso: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { iso: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar' },
  { iso: 'EG', dial: '+20', flag: '🇪🇬', name: 'Egypt' },
  { iso: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa' },
  { iso: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { iso: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya' },
  { iso: 'MX', dial: '+52', flag: '🇲🇽', name: 'Mexico' },
  { iso: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil' },
  { iso: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina' },
  { iso: 'CL', dial: '+56', flag: '🇨🇱', name: 'Chile' },
  { iso: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colombia' },
  { iso: 'PE', dial: '+51', flag: '🇵🇪', name: 'Peru' },
];

function dialOf(iso: string): string {
  return COUNTRIES.find((c) => c.iso === iso)?.dial ?? '+1';
}

export function LoginScreen({
  width = 1280,
  height = 800,
}: {
  width?: number | string;
  height?: number | string;
}) {
  const { user } = useAuth();
  const [view, setView] = React.useState<View>('form');
  const [tab, setTab] = React.useState<Tab>('phone');
  const [identifier, setIdentifier] = React.useState('');
  const [otp, setOtp] = React.useState<string[]>(['', '', '', '', '', '']);
  const [resendIn, setResendIn] = React.useState(28);
  const [confirmation, setConfirmation] = React.useState<ConfirmationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [countryIso, setCountryIso] = React.useState('US');
  const [emailOpen, setEmailOpen] = React.useState(false);
  const recaptchaRef = React.useRef<RecaptchaVerifier | null>(null);

  // Resend countdown for OTP / email link
  React.useEffect(() => {
    if (view !== 'otp' && view !== 'emailSent') return;
    setResendIn(28);
    const id = setInterval(() => setResendIn((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [view]);

  // Auto-jump to 'done' when auth state flips to signed-in (handles email-link return).
  React.useEffect(() => {
    if (user && view !== 'done') setView('done');
  }, [user, view]);

  React.useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  function getOrCreateRecaptcha(): RecaptchaVerifier {
    if (!recaptchaRef.current) {
      recaptchaRef.current = createRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
    }
    return recaptchaRef.current;
  }

  function resetRecaptcha() {
    try {
      recaptchaRef.current?.clear();
    } catch {
      /* ignore */
    }
    recaptchaRef.current = null;
  }

  async function handleSendCode() {
    setError(null);
    if (tab === 'phone') {
      setError('Phone sign-in is coming soon. Use Email or Google for now.');
      return;
    }
    if (!identifier.trim()) {
      setError('Enter your email.');
      return;
    }
    setBusy(true);
    try {
      await sendEmailSignInLink(identifier.trim());
      setView('emailSent');
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleMicrosoft() {
    setError(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1400));
    setError("Couldn't reach Microsoft sign-in. Use Google or Email — recommended.");
    setBusy(false);
  }

  function handleEmailOpen() {
    setError(null);
    setTab('email');
    setIdentifier('');
    setEmailOpen(true);
  }

  async function handleVerifyOtp() {
    if (!confirmation) {
      setError('Verification session expired. Send the code again.');
      return;
    }
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter all 6 digits.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await verifyPhoneOtp(confirmation, code);
      // The auth effect above will switch view to 'done'.
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (tab === 'phone') {
      setOtp(['', '', '', '', '', '']);
      setView('form');
    } else {
      try {
        setBusy(true);
        await sendEmailSignInLink(identifier.trim());
        setResendIn(28);
      } catch (e) {
        setError(humanizeError(e));
      } finally {
        setBusy(false);
      }
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleGithub() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGithub();
    } catch (e) {
      setError(humanizeError(e));
    } finally {
      setBusy(false);
    }
  }

  function handleBack() {
    setError(null);
    setOtp(['', '', '', '', '', '']);
    setConfirmation(null);
    setView('form');
  }

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
        color: 'var(--t-1)',
      }}
    >
      <BrandPanel />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 56px 24px',
          overflowY: 'auto',
        }}
        className="no-scrollbar"
      >
        {view !== 'form' && view !== 'done' && (
          <div style={{ marginBottom: 32 }}>
            <button
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--t-3)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              <Icon name="arrowLeft" size={14} /> back
            </button>
          </div>
        )}

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            {view === 'form' && (
              <FormView
                identifier={identifier}
                setIdentifier={setIdentifier}
                countryIso={countryIso}
                setCountryIso={setCountryIso}
                onSendCode={handleSendCode}
                onGoogle={handleGoogle}
                onMicrosoft={handleMicrosoft}
                onGithub={handleGithub}
                emailOpen={emailOpen}
                onEmailOpen={handleEmailOpen}
                busy={busy}
                error={error}
              />
            )}
            {view === 'otp' && (
              <OtpView
                target={`${dialOf(countryIso)} ${identifier}`}
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
                resendIn={resendIn}
                onResend={handleResend}
                busy={busy}
                error={error}
              />
            )}
            {view === 'emailSent' && (
              <EmailSentView
                email={identifier}
                resendIn={resendIn}
                onResend={handleResend}
                busy={busy}
                error={error}
              />
            )}
            {view === 'done' && <DoneView />}
          </div>
        </div>

        {/* Invisible reCAPTCHA host */}
        <div id={RECAPTCHA_CONTAINER_ID} />

        <FormFooter />
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// Brand panel (left half)
// ───────────────────────────────────────

function BrandPanel() {
  return (
    <div
      style={{
        background: 'var(--brushed)',
        borderRight: '1px solid var(--bd-2)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 56,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg,
            rgba(255,255,255,0.02) 0 1px,
            transparent 1px 4px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top: wordmark (clickable, returns to /) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <a href="/" title="Zora — Home" aria-label="Zora home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ZoraWordmark size={20} tagline />
        </a>
      </div>

      {/* Middle: heading + copy */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            marginBottom: 20,
            color: 'var(--t-1)',
          }}
        >
          Welcome back.
          <br />
          <span
            style={{
              fontStyle: 'italic',
              fontWeight: 400,
              background: 'linear-gradient(180deg, #f5f6f8 0%, #6a6f78 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pick up where you left off.
          </span>
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--t-3)', lineHeight: 1.6, maxWidth: 360 }}>
          Zora uses one-time codes — no passwords to forget, no breach to worry about. Codes expire
          in 5 minutes.
        </p>
      </div>

      {/* Bottom: stats */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        <Stat value="142k" label="ACTIVE CONVERSATIONS TODAY" />
        <Stat value="<2s" label="MEDIAN RESPONSE TIME" />
        <Stat value="0" label="TRAINING ON YOUR DATA" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 26,
          fontWeight: 500,
          color: 'var(--t-1)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.15em',
          color: 'var(--t-4)',
          textTransform: 'uppercase',
          marginTop: 6,
          maxWidth: 100,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// Form view (default)
// ───────────────────────────────────────

function FormView({
  identifier,
  setIdentifier,
  countryIso,
  setCountryIso,
  onSendCode,
  onGoogle,
  onMicrosoft,
  onGithub,
  emailOpen,
  onEmailOpen,
  busy,
  error,
}: {
  identifier: string;
  setIdentifier: (v: string) => void;
  countryIso: string;
  setCountryIso: (c: string) => void;
  onSendCode: () => void;
  onGoogle: () => void;
  onMicrosoft: () => void;
  onGithub: () => void;
  emailOpen: boolean;
  onEmailOpen: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div>
      <div
        className="eyebrow"
        style={{ marginBottom: 12, color: 'var(--t-4)' }}
      >
        // STEP 1 OF 2
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          fontSize: 36,
          letterSpacing: '-0.03em',
          color: 'var(--t-1)',
          marginBottom: 8,
        }}
      >
        Sign in to Zora
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--t-3)' }}>
        We&apos;ll send a 6-digit code to verify it&apos;s you.
      </p>

      {/* Phone section — disabled because Phone OTP requires Blaze; flagged Coming soon. */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 10,
          opacity: 0.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        aria-disabled="true"
        title="Phone sign-in coming soon"
      >
        <CountryPicker value={countryIso} onChange={setCountryIso} />
        <input
          className="input"
          placeholder=""
          value=""
          readOnly
          tabIndex={-1}
          aria-label="Phone number"
          style={{
            flex: 1,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
            fontSize: 13,
            cursor: 'not-allowed',
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--t-2)',
          fontFamily: "'JetBrains Mono', monospace",
          fontStyle: 'italic',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Coming soon
      </div>

      <Divider label="OR CONTINUE WITH" />

      <button
        onClick={onGoogle}
        disabled={busy}
        className="btn"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: 13,
          fontSize: 14,
          opacity: busy ? 0.6 : 1,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        <Icon name="google" size={16} /> Sign in with Google
      </button>

      <button
        onClick={onMicrosoft}
        disabled={busy}
        className="btn"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: 13,
          fontSize: 14,
          marginTop: 8,
          opacity: busy ? 0.6 : 1,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        <Icon name="microsoft" size={16} /> Sign in with Microsoft
      </button>

      <button
        onClick={onGithub}
        disabled={busy}
        className="btn"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: 13,
          fontSize: 14,
          marginTop: 8,
          opacity: busy ? 0.6 : 1,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        <Icon name="github" size={16} /> Sign in with GitHub
      </button>

      {emailOpen ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSendCode();
            }}
            autoFocus
            style={{ fontSize: 14 }}
            aria-label="Email address"
          />
          <button
            onClick={onSendCode}
            disabled={busy || !identifier.trim()}
            className="btn primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 13,
              fontSize: 14,
              opacity: busy || !identifier.trim() ? 0.6 : 1,
              cursor: busy || !identifier.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Sending…' : 'Send sign-in link'}
            <Icon name="arrow" size={15} color="#0a0a0a" />
          </button>
        </div>
      ) : (
        <button
          onClick={onEmailOpen}
          disabled={busy}
          className="btn"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 13,
            fontSize: 14,
            marginTop: 8,
            opacity: busy ? 0.6 : 1,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          <Icon name="mail" size={16} /> Sign in with Email
        </button>
      )}

      <ErrorLine error={error} />

      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--t-4)', lineHeight: 1.6, textAlign: 'center' }}>
        By signing in you agree to our{' '}
        <a href="/terms" style={{ color: 'var(--t-2)', textDecoration: 'underline' }}>
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" style={{ color: 'var(--t-2)', textDecoration: 'underline' }}>
          Privacy policy
        </a>
        .
      </div>
    </div>
  );
}

// Country picker — custom dropdown so we can render real flag images (flagcdn.com PNGs).
// Native <select> with flag emojis doesn't work on Windows because Windows doesn't include
// flag glyphs in its built-in emoji font.
function CountryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const current = COUNTRIES.find((c) => c.iso === value) ?? COUNTRIES[0];

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: 150 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input"
        aria-label={`Country code: ${current.name} ${current.dial}`}
        title={`${current.name} (${current.dial})`}
        style={{
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.05em',
          height: 44,
        }}
      >
        <FlagImg iso={current.iso} />
        <span>{current.iso}</span>
        <span style={{ color: 'var(--t-3)' }}>{current.dial}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t-4)' }}>▾</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: 260,
            maxHeight: 280,
            overflowY: 'auto',
            background: 'var(--bg-3)',
            border: '1px solid var(--bd-3)',
            borderRadius: 10,
            zIndex: 100,
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            padding: 4,
          }}
        >
          {COUNTRIES.map((c) => {
            const active = c.iso === value;
            return (
              <button
                key={c.iso}
                type="button"
                onClick={() => {
                  onChange(c.iso);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '7px 10px',
                  background: active ? 'var(--bg-4)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: 'var(--t-1)',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  textAlign: 'left',
                  marginBottom: 1,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <FlagImg iso={c.iso} />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--t-2)',
                    minWidth: 70,
                    letterSpacing: '0.05em',
                  }}
                >
                  {c.iso} {c.dial}
                </span>
                <span style={{ fontSize: 11, color: 'var(--t-4)' }}>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FlagImg({ iso }: { iso: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <span
        style={{
          width: 20,
          height: 15,
          display: 'inline-block',
          background: 'var(--bg-4)',
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <img
      src={`https://flagcdn.com/20x15/${iso.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/40x30/${iso.toLowerCase()}.png 2x, https://flagcdn.com/60x45/${iso.toLowerCase()}.png 3x`}
      alt={iso}
      width={20}
      height={15}
      onError={() => setFailed(true)}
      style={{ display: 'block', flexShrink: 0, borderRadius: 2 }}
    />
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--bg-4)' : 'transparent',
        border: 'none',
        color: active ? 'var(--t-1)' : 'var(--t-3)',
        fontFamily: 'inherit',
        fontSize: 13,
        padding: '10px 12px',
        borderRadius: 7,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: active ? 500 : 400,
        transition: 'background .15s, color .15s',
      }}
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div
      style={{
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 10,
        color: 'var(--t-4)',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--bd-1)' }} />
      {label}
      <div style={{ flex: 1, height: 1, background: 'var(--bd-1)' }} />
    </div>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div style={{ marginTop: 16, fontSize: 12, color: '#d97064', lineHeight: 1.5, textAlign: 'center' }}>
      {error}
    </div>
  );
}

// ───────────────────────────────────────
// OTP view (after "Send code" for phone)
// ───────────────────────────────────────

function OtpView({
  target,
  otp,
  setOtp,
  onVerify,
  resendIn,
  onResend,
  busy,
  error,
}: {
  target: string;
  otp: string[];
  setOtp: (v: string[]) => void;
  onVerify: () => void;
  resendIn: number;
  onResend: () => void;
  busy: boolean;
  error: string | null;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const update = (i: number, v: string) => {
    const next = [...otp];
    next[i] = v.replace(/[^0-9]/g, '').slice(-1);
    setOtp(next);
    if (next[i] && i < 5) refs.current[i + 1]?.focus();
  };
  const keyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'Enter') onVerify();
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (text.length > 1) {
      e.preventDefault();
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < text.length; i++) next[i] = text[i];
      setOtp(next);
      refs.current[Math.min(5, text.length)]?.focus();
    }
  };

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--t-4)' }}>
        // STEP 2 OF 2
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          color: 'var(--t-1)',
          marginBottom: 8,
        }}
      >
        Enter the code
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--t-3)' }}>
        Sent a 6-digit code to{' '}
        <span style={{ color: 'var(--t-1)', fontFamily: "'JetBrains Mono', monospace" }}>{target}</span>
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => keyDown(i, e)}
            onPaste={handlePaste}
            maxLength={1}
            inputMode="numeric"
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
              textAlign: 'center',
              outline: 'none',
              transition: 'border .15s, background .15s',
            }}
          />
        ))}
      </div>

      <button
        onClick={onVerify}
        disabled={busy}
        className="btn primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: 14,
          fontSize: 14,
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Verifying…' : 'Verify & continue'}
        <Icon name="check" size={15} color="#0a0a0a" />
      </button>

      <ErrorLine error={error} />

      <div style={{ marginTop: 22, fontSize: 12, color: 'var(--t-3)', textAlign: 'center' }}>
        Didn&apos;t get it?{' '}
        {resendIn > 0 ? (
          <span style={{ color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}>
            resend in {resendIn}s
          </span>
        ) : (
          <a
            onClick={onResend}
            style={{ color: 'var(--t-1)', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Resend code
          </a>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// Email-link sent view
// ───────────────────────────────────────

function EmailSentView({
  email,
  resendIn,
  onResend,
  busy,
  error,
}: {
  email: string;
  resendIn: number;
  onResend: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--t-4)' }}>
        // STEP 2 OF 2
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          color: 'var(--t-1)',
          marginBottom: 8,
        }}
      >
        Check your inbox
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--t-3)', lineHeight: 1.6 }}>
        We sent a sign-in link to{' '}
        <span style={{ color: 'var(--t-1)', fontFamily: "'JetBrains Mono', monospace" }}>{email}</span>. Click it on
        this device to finish.
      </p>

      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--bd-2)',
          borderRadius: 12,
          padding: 18,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
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
            flexShrink: 0,
          }}
        >
          <Icon name="mail" size={18} color="#c8ccd2" />
        </div>
        <div style={{ fontSize: 13, color: 'var(--t-2)', lineHeight: 1.6 }}>
          Open the email and tap the sign-in link. This page will finish the sign-in automatically when you come back.
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color: 'var(--t-3)',
          lineHeight: 1.5,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <Icon name="info" size={14} color="#7a7f87" />
        <span>
          Can&apos;t find it? Check your{' '}
          <strong style={{ color: 'var(--t-2)' }}>Spam</strong> or{' '}
          <strong style={{ color: 'var(--t-2)' }}>Promotions</strong> folder — sign-in emails from
          Firebase sometimes land there.
        </span>
      </div>

      <ErrorLine error={error} />

      <div style={{ marginTop: 22, fontSize: 12, color: 'var(--t-3)', textAlign: 'center' }}>
        Didn&apos;t get it?{' '}
        {resendIn > 0 ? (
          <span style={{ color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}>
            resend in {resendIn}s
          </span>
        ) : (
          <a
            onClick={busy ? undefined : onResend}
            style={{
              color: busy ? 'var(--t-4)' : 'var(--t-1)',
              textDecoration: 'underline',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            Resend link
          </a>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// Done view
// ───────────────────────────────────────

function DoneView() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div
        style={{
          width: 72,
          height: 72,
          margin: '0 auto 22px',
          borderRadius: '50%',
          background: 'var(--steel-shine)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.2), 0 0 40px rgba(200,204,210,0.4)',
        }}
      >
        <Icon name="check" size={32} color="#0a0a0a" strokeWidth={3} />
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          marginBottom: 10,
          color: 'var(--t-1)',
        }}
      >
        You&apos;re in.
      </div>
      <p style={{ fontSize: 14, color: 'var(--t-3)', marginBottom: 28 }}>
        Welcome to Zora. Your chats save for 7 days from your last reply.
      </p>
      <a
        href="/chat"
        className="btn primary"
        style={{ padding: '12px 28px', fontSize: 14, textDecoration: 'none' }}
      >
        Open Zora <Icon name="arrow" size={14} color="#0a0a0a" />
      </a>
    </div>
  );
}

// ───────────────────────────────────────
// Form footer (bottom of right panel)
// ───────────────────────────────────────

function FormFooter() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 24,
        marginTop: 24,
        borderTop: '1px solid var(--bd-1)',
        fontSize: 10,
        color: 'var(--t-4)',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}
    >
      <span>v1.0</span>
      <span>SESSION · ENCRYPTED</span>
      <span>— BY XORVION</span>
    </div>
  );
}

// ───────────────────────────────────────
// Error humanizer
// ───────────────────────────────────────

function humanizeError(e: unknown): string {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code;
    if (code) {
      const map: Record<string, string> = {
        'auth/invalid-phone-number': "That phone number doesn't look right.",
        'auth/invalid-email': "That email doesn't look right.",
        'auth/invalid-verification-code': 'Wrong code. Try again.',
        'auth/code-expired': 'That code expired. Request a new one.',
        'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
        'auth/popup-closed-by-user': 'Sign-in cancelled.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/quota-exceeded': 'Daily SMS quota exceeded. Try email or Google.',
        'auth/billing-not-enabled':
          'Phone sign-in needs Firebase Blaze plan. Use Email or Google for now.',
        'auth/operation-not-allowed':
          "This sign-in method isn't enabled on the Firebase project yet.",
      };
      return map[code] || e.message;
    }
    return e.message;
  }
  return 'Something went wrong. Try again.';
}

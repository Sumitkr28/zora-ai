'use client';

// Profile / Account page — driven by real Firebase Auth + Firestore /users/{uid} data.

import React from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { ZoraWordmark, Icon } from '../logo';
import { useAuth } from '../AuthProvider';
import { listConversations } from '@/lib/conversations';

interface UserDoc {
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  plan?: string;
  authMethod?: 'phone' | 'email' | 'google';
  createdAt?: Timestamp;
}

function initialsFrom(name: string | null | undefined, fallback: string | null | undefined): string {
  const text = (name || fallback || '').trim();
  if (!text) return '··';
  const parts = text.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function shortId(uid: string): string {
  return 'zr_' + uid.slice(0, 8);
}

function formatDate(ts: Timestamp | undefined, fallback: number): string {
  const ms = ts?.toMillis?.() ?? fallback;
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProfileScreen({ width = 1280, height = 800 }: { width?: number | string; height?: number | string }) {
  const { user, loading, signOut } = useAuth();
  const [userDoc, setUserDoc] = React.useState<UserDoc | null>(null);
  const [chatCount, setChatCount] = React.useState<number | null>(null);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      setUserDoc(null);
      setChatCount(null);
      return;
    }
    getDoc(doc(getDb(), 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) setUserDoc(snap.data() as UserDoc);
      })
      .catch((e) => console.warn('user doc load failed', e));
    listConversations(user.uid)
      .then((convs) => setChatCount(convs.length))
      .catch(() => setChatCount(0));
  }, [user]);

  const onSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (e) {
      console.warn('signOut failed', e);
    }
  };

  // Not signed in → render a friendly empty state with a sign-in CTA.
  if (!loading && !user) {
    return (
      <div
        style={{
          width,
          height,
          background: 'var(--bg-0)',
          color: 'var(--t-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 18,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 32, letterSpacing: '-0.02em' }}>
          You&apos;re signed out.
        </div>
        <p style={{ color: 'var(--t-3)', fontSize: 14, maxWidth: 380, margin: 0 }}>
          Sign in to view your account, manage your data, and save chats for 7 days.
        </p>
        <a href="/login" className="btn primary" style={{ padding: '12px 28px', textDecoration: 'none', fontSize: 14 }}>
          Sign in <Icon name="arrow" size={14} color="#0a0a0a" />
        </a>
        <a href="/" style={{ color: 'var(--t-3)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}>
          Back to home
        </a>
      </div>
    );
  }

  // Loading skeleton
  if (loading || !user) {
    return <div style={{ width, height, background: 'var(--bg-0)' }} />;
  }

  const displayName =
    userDoc?.displayName ||
    user.displayName ||
    user.email ||
    user.phoneNumber ||
    'New user';
  const email = userDoc?.email || user.email || '—';
  const phone = userDoc?.phone || user.phoneNumber || '—';
  const photoURL = userDoc?.photoURL || user.photoURL || null;
  const plan = userDoc?.plan || 'Free';
  const memberSince = formatDate(userDoc?.createdAt, user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now());
  const authMethodLabel =
    userDoc?.authMethod === 'phone'
      ? 'Phone OTP'
      : userDoc?.authMethod === 'email'
        ? 'Email link'
        : userDoc?.authMethod === 'google'
          ? 'Google'
          : '—';

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        overflow: 'hidden',
      }}
    >
      <ProfileSidebar active="account" onSignOut={onSignOut} />

      <div style={{ overflow: 'auto', padding: '40px 56px' }} className="no-scrollbar">
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          ACCOUNT · /me
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: '-0.03em',
            marginBottom: 6,
          }}
        >
          {displayName}
        </h1>
        <div style={{ color: 'var(--t-3)', fontSize: 14, marginBottom: 32 }}>
          Member since{' '}
          <span className="mono" style={{ color: 'var(--t-2)' }}>
            {memberSince}
          </span>{' '}
          · ID{' '}
          <span className="mono" style={{ color: 'var(--t-2)' }}>
            {shortId(user.uid)}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            gap: 28,
            padding: 28,
            background: 'var(--bg-1)',
            border: '1px solid var(--bd-2)',
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ position: 'relative' }}>
            {photoURL && !imgError ? (
              <img
                src={photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 0 0 4px var(--bg-1), 0 0 0 5px var(--bd-2)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: 'var(--steel-shine)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 56,
                  color: '#0a0a0a',
                  fontWeight: 700,
                  boxShadow: '0 0 0 4px var(--bg-1), 0 0 0 5px var(--bd-2)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {initialsFrom(displayName, email)}
              </div>
            )}
            <button
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--bg-3)',
                border: '1px solid var(--bd-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--t-2)',
              }}
            >
              <Icon name="image" size={16} />
            </button>
          </div>

          <div>
            <ProfileRow label="Full name" value={displayName} editable />
            <ProfileRow
              label="Email"
              value={email !== '—' ? email : <span style={{ color: 'var(--t-4)' }}>—</span>}
              verified={email !== '—' && !!user.emailVerified}
            />
            <ProfileRow
              label="Phone"
              value={phone !== '—' ? phone : <span style={{ color: 'var(--t-4)' }}>—</span>}
              verified={phone !== '—'}
            />
            <ProfileRow
              label="Plan"
              value={
                <>
                  Zora {plan.charAt(0).toUpperCase() + plan.slice(1)}{' '}
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--steel-shine)',
                      color: '#0a0a0a',
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                    }}
                  >
                    ACTIVE
                  </span>
                </>
              }
            />
            <ProfileRow label="Sign-in method" value={authMethodLabel} last />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Conversations', value: chatCount === null ? '…' : String(chatCount) },
            { label: 'Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1) },
            { label: 'Retention', value: '7 days' },
            { label: 'Storage cost', value: '$0' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--bd-1)',
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--t-3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--t-1)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--bd-2)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Icon name="shield" size={18} color="#c8ccd2" />
            <div style={{ fontSize: 16, fontWeight: 500 }}>Privacy & data</div>
          </div>

          <SettingRow
            title="7-day auto-delete"
            desc="Chats wipe themselves 7 days after your last reply."
            toggle
          />
          <SettingRow
            title="Include chats in training"
            desc="Off by default. We never use Pro/Max chats."
            toggle={false}
          />
          <SettingRow
            title="Cross-device sync"
            desc="Pick up where you left off on any device."
            toggle
            last
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn ghost">
              <Icon name="file" size={14} /> Export my data
            </button>
            <button
              className="btn ghost"
              style={{ color: '#d97064', borderColor: 'rgba(217,112,100,0.3)' }}
            >
              <Icon name="trash" size={14} /> Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSidebar({ active, onSignOut }: { active: string; onSignOut: () => void }) {
  const items: { id: string; icon: string; label: string; href: string }[] = [
    { id: 'account', icon: 'user', label: 'Account', href: '/account' },
    { id: 'chats', icon: 'chat', label: 'Chats', href: '/chat' },
    { id: 'billing', icon: 'bolt', label: 'Billing', href: '/pricing' },
    { id: 'privacy', icon: 'shield', label: 'Privacy', href: '/privacy' },
    { id: 'about', icon: 'info', label: 'About Zora', href: '/about' },
    { id: 'contact', icon: 'mail', label: 'Contact', href: '/contact' },
  ];
  return (
    <div
      style={{
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--bd-1)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '6px 8px 22px' }}>
        <a
          href="/"
          title="Zora — Home"
          aria-label="Zora home"
          style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
        >
          <ZoraWordmark size={15} tagline />
        </a>
      </div>

      <a
        href="/chat"
        className="btn ghost"
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'flex-start',
          padding: '8px 10px',
          fontSize: 12,
          color: 'var(--t-3)',
          textDecoration: 'none',
        }}
      >
        <Icon name="arrowLeft" size={14} /> Back to chat
      </a>

      {items.map((i) => (
        <a
          key={i.id}
          href={i.href}
          style={{
            background: active === i.id ? 'var(--bg-3)' : 'transparent',
            border: '1px solid ' + (active === i.id ? 'var(--bd-2)' : 'transparent'),
            color: active === i.id ? 'var(--t-1)' : 'var(--t-2)',
            fontFamily: 'inherit',
            fontSize: 13,
            padding: '9px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginBottom: 2,
            textAlign: 'left',
            textDecoration: 'none',
          }}
        >
          <Icon name={i.icon} size={15} />
          {i.label}
        </a>
      ))}

      <div style={{ flex: 1 }} />
      <button
        onClick={onSignOut}
        className="btn ghost"
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          color: 'var(--t-3)',
          fontSize: 12,
          padding: '8px 12px',
        }}
      >
        <Icon name="logout" size={14} /> Log out
      </button>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  editable,
  verified,
  last,
}: {
  label: string;
  value: React.ReactNode;
  editable?: boolean;
  verified?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: last ? 'none' : '1px solid var(--bd-1)',
      }}
    >
      <div
        style={{
          width: 110,
          flexShrink: 0,
          fontSize: 11,
          color: 'var(--t-3)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 14,
          color: 'var(--t-1)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {value}
        {verified && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#9aa0a8',
              letterSpacing: '0.1em',
              padding: '2px 6px',
              border: '1px solid var(--bd-2)',
              borderRadius: 4,
            }}
          >
            <Icon name="check" size={10} /> VERIFIED
          </span>
        )}
      </div>
      {editable && (
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--t-3)',
            fontSize: 12,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          Edit
        </button>
      )}
    </div>
  );
}

function SettingRow({
  title,
  desc,
  toggle,
  last,
}: {
  title: string;
  desc: string;
  toggle: boolean;
  last?: boolean;
}) {
  const [on, setOn] = React.useState(toggle);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 0',
        borderBottom: last ? 'none' : '1px solid var(--bd-1)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--t-1)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--t-3)' }}>{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: on ? 'var(--steel-shine)' : 'var(--bg-4)',
          border: '1px solid ' + (on ? 'rgba(255,255,255,0.2)' : 'var(--bd-2)'),
          cursor: 'pointer',
          position: 'relative',
          padding: 0,
          transition: 'background .15s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 20 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: on ? '#0a0a0a' : '#9aa0a8',
            transition: 'left .15s',
          }}
        />
      </button>
    </div>
  );
}

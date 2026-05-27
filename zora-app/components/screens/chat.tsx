'use client';

// Chat screen — Phase 2c port from design_handoff_zora/design_files/screens/chat.jsx.
// All visuals preserved verbatim. Phase 4 will replace the hardcoded thread + ZoraReply1/2
// with a real Gemini-streamed conversation backed by Firestore.

import React from 'react';
import { ZoraMark, Icon } from '../logo';
import { signInWithGoogle, signInWithGithub } from '@/lib/auth';

interface Thread {
  id: string;
  title: string;
  group: string;
  expiresIn: string;
  last: string;
  pinned?: boolean;
  expiring?: boolean;
}

export function ChatApp({
  width = 1280,
  height = 800,
  loggedIn = true,
}: {
  width?: number | string;
  height?: number | string;
  loggedIn?: boolean;
}) {
  const [model, setModel] = React.useState('Pro');
  const [composer, setComposer] = React.useState('');
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [activeThread, setActiveThread] = React.useState('react-perf');

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        overflow: 'hidden',
      }}
    >
      <ChatSidebar loggedIn={loggedIn} active={activeThread} onSelect={setActiveThread} />
      <ChatMain
        model={model}
        setModel={setModel}
        composer={composer}
        setComposer={setComposer}
        loggedIn={loggedIn}
        onUploadAttempt={() => !loggedIn && setShowUploadModal(true)}
      />
      {showUploadModal && <LoginRequiredModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
}

export function ChatSidebar({
  loggedIn,
  active,
  onSelect,
  threads,
  onNewChat,
}: {
  loggedIn: boolean;
  active: string | null;
  onSelect: (id: string) => void;
  threads?: Thread[];
  onNewChat?: () => void;
}) {
  // For backwards-compat with the original design-canvas mock, fall back to demo threads
  // when none are passed. Phase 4 passes real conversations from Firestore.
  const demoThreads: Thread[] = [
    { id: 'react-perf', title: 'React perf — virtualized lists', group: 'Today', expiresIn: 'in 7d', last: '2m ago' },
    { id: 'sql-query', title: 'Optimizing this SQL JOIN', group: 'Today', expiresIn: 'in 6d', last: '1h ago' },
    { id: 'launch-email', title: 'Launch email draft', group: 'Yesterday', expiresIn: 'in 6d', last: 'yesterday', pinned: true },
    { id: 'pricing-page', title: 'Pricing page copy iteration', group: 'Yesterday', expiresIn: 'in 5d', last: '2d ago' },
    { id: 'algo', title: 'Explain Dijkstra step by step', group: 'Last 7 days', expiresIn: 'in 3d', last: '4d ago' },
    { id: 'budget', title: '2026 marketing budget split', group: 'Last 7 days', expiresIn: 'in 1d', last: '6d ago' },
    { id: 'recipe', title: 'Vegetarian thali for 6', group: 'Last 7 days', expiresIn: '< 24h', last: '6d ago', expiring: true },
  ];
  const actualThreads = threads ?? demoThreads;
  // alias for the rest of the function to avoid touching every reference
  const threadsForRender = actualThreads;

  const groups = ['Today', 'Yesterday', 'Last 7 days'];
  const grouped = groups.map((g) => ({ name: g, items: threadsForRender.filter((t) => t.group === g) }));

  return (
    <div
      style={{
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--bd-1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--bd-1)' }}>
        <ZoraWordmarkInline />
      </div>

      <div style={{ padding: '14px 12px 8px' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            background: '#ececec',
            color: '#0a0a0a',
            border: 'none',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: 13,
            padding: '11px 12px',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          <Icon name="plus" size={15} color="#0a0a0a" />
          New chat
        </button>
      </div>

      {loggedIn && (
        <div
          style={{
            margin: '4px 12px 8px',
            padding: '8px 10px',
            background: 'var(--bg-2)',
            border: '1px solid var(--bd-1)',
            borderRadius: 8,
            fontSize: 11,
            color: 'var(--t-3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            lineHeight: 1.4,
          }}
        >
          <Icon name="clock" size={13} color="#7a7f87" />
          <span>
            Chats auto-delete <strong style={{ color: 'var(--t-2)' }}>7 days</strong> after last reply.
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }} className="no-scrollbar">
        {grouped.map(
          (g) =>
            g.items.length > 0 && (
              <div key={g.name}>
                <div className="eyebrow" style={{ padding: '14px 8px 6px' }}>
                  {g.name}
                </div>
                {g.items.map((t) => (
                  <ThreadRow key={t.id} thread={t} active={active === t.id} onClick={() => onSelect(t.id)} />
                ))}
              </div>
            ),
        )}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--bd-1)', background: 'var(--bg-1)' }}>
        {loggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--steel-chrome)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#0a0a0a',
                fontWeight: 700,
              }}
            >
              AR
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--t-1)', fontWeight: 500 }}>Aarav R.</div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--t-3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Pro · 12k tokens left
              </div>
            </div>
            <button
              style={{ background: 'transparent', border: 'none', color: 'var(--t-3)', cursor: 'pointer', padding: 6 }}
            >
              <Icon name="settings" size={16} />
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="btn ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: 13, textDecoration: 'none' }}
          >
            <Icon name="user" size={14} /> Log in to save chats
          </a>
        )}
      </div>
    </div>
  );
}

// Local inline wordmark to avoid circular import of ZoraWordmark from logo
function ZoraWordmarkInline() {
  // Match the size/tagline pattern used in chat.jsx
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 * 0.32 }}>
      <ZoraMark size={16 * 1.25} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: '0.08em',
            color: '#ececec',
          }}
        >
          ZORA
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16 * 0.32,
            letterSpacing: '0.22em',
            color: 'var(--t-3)',
            marginTop: 16 * 0.18,
            textTransform: 'uppercase',
          }}
        >
          by Xorvion
        </span>
      </div>
    </div>
  );
}

function ThreadRow({ thread, active, onClick }: { thread: Thread; active: boolean; onClick: () => void }) {
  const [hover, setHover] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setMenuOpen(false);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 7,
        cursor: 'pointer',
        background: active ? 'var(--bg-3)' : hover ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: active ? '1px solid var(--bd-2)' : '1px solid transparent',
        marginBottom: 2,
        position: 'relative',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: active ? 'var(--t-1)' : 'var(--t-2)',
            fontWeight: active ? 500 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {thread.title}
        </div>
        <div
          style={{
            fontSize: 10,
            color: thread.expiring ? '#d9a36b' : 'var(--t-4)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.08em',
            marginTop: 2,
          }}
        >
          {thread.last} · expires {thread.expiresIn}
        </div>
      </div>
      {thread.pinned && !hover && <Icon name="pin" size={12} color="#9aa0a8" />}
      {hover && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--t-3)',
            padding: 4,
            borderRadius: 5,
            display: 'flex',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </button>
      )}
      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            right: 6,
            marginTop: 4,
            background: 'var(--bg-3)',
            border: '1px solid var(--bd-3)',
            borderRadius: 8,
            padding: 4,
            minWidth: 140,
            zIndex: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          }}
        >
          {[
            { label: 'Rename' },
            { label: 'Share' },
            { label: 'Export JSON' },
            { label: 'Delete', danger: true },
          ].map((i) => (
            <button
              key={i.label}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '7px 10px',
                borderRadius: 5,
                fontSize: 12,
                fontFamily: 'inherit',
                color: i.danger ? '#d97064' : 'var(--t-2)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {i.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatMain({
  model,
  setModel,
  composer,
  setComposer,
  loggedIn,
  onUploadAttempt,
}: {
  model: string;
  setModel: (m: string) => void;
  composer: string;
  setComposer: (v: string) => void;
  loggedIn: boolean;
  onUploadAttempt: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ChatTopBar model={model} setModel={setModel} loggedIn={loggedIn} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0 32px' }} className="no-scrollbar">
        <ChatThread />
      </div>
      <Composer value={composer} onChange={setComposer} onUploadAttempt={onUploadAttempt} loggedIn={loggedIn} />
    </div>
  );
}

function ChatTopBar({
  model,
  setModel,
  loggedIn,
}: {
  model: string;
  setModel: (m: string) => void;
  loggedIn: boolean;
}) {
  return (
    <div
      style={{
        padding: '14px 28px',
        borderBottom: '1px solid var(--bd-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--bg-0)',
      }}
    >
      <ModelPicker model={model} setModel={setModel} />
      <div style={{ flex: 1 }} />
      {!loggedIn && (
        <div
          style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--t-3)',
            padding: '6px 12px',
            background: 'var(--bg-2)',
            border: '1px solid var(--bd-1)',
            borderRadius: 6,
          }}
        >
          guest mode · history wipes on refresh
        </div>
      )}
      <button style={{ background: 'transparent', border: 'none', color: 'var(--t-3)', cursor: 'pointer', padding: 6 }}>
        <Icon name="settings" size={16} />
      </button>
    </div>
  );
}

function ModelPicker({ model, setModel }: { model: string; setModel: (m: string) => void }) {
  const models = [
    { name: 'Lite', desc: 'fast · everyday' },
    { name: 'Pro', desc: 'balanced · default' },
    { name: 'Max', desc: 'deep reasoning' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--bg-2)',
        border: '1px solid var(--bd-2)',
        borderRadius: 8,
        padding: 3,
        gap: 2,
      }}
    >
      {models.map((m) => (
        <button
          key={m.name}
          onClick={() => setModel(m.name)}
          style={{
            background: model === m.name ? 'var(--bg-4)' : 'transparent',
            border: 'none',
            color: model === m.name ? 'var(--t-1)' : 'var(--t-3)',
            fontFamily: 'inherit',
            fontSize: 12,
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: m.name === model ? '#c8ccd2' : '#43474e',
            }}
          />
          Zora {m.name}
          {model === m.name && <span style={{ fontSize: 10, color: 'var(--t-3)', marginLeft: 4 }}>· {m.desc}</span>}
        </button>
      ))}
    </div>
  );
}

interface Attachment {
  type: 'image' | 'file';
  name: string;
}

function ChatThread() {
  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '0 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.2em',
          color: 'var(--t-4)',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'var(--bd-1)' }} />
        <span>Today · 2:14 PM</span>
        <div style={{ flex: 1, height: 1, background: 'var(--bd-1)' }} />
      </div>

      <UserMsg>
        How can I make a virtualized list in React that handles{' '}
        <span
          className="mono"
          style={{
            background: 'var(--bg-2)',
            padding: '1px 6px',
            borderRadius: 4,
            fontSize: 12,
            border: '1px solid var(--bd-1)',
          }}
        >
          10,000+ items
        </span>{' '}
        smoothly? Attach diff thinking on row height too.
      </UserMsg>
      <ZoraReply1 />
      <UserMsg attachments={[{ type: 'image', name: 'design-mock-list.png' }]}>
        Got it. Now show me how to handle variable row heights with measurement.
      </UserMsg>
      <ZoraReply2 />
    </div>
  );
}

function UserMsg({ children, attachments }: { children: React.ReactNode; attachments?: Attachment[] }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{ display: 'flex', justifyContent: 'flex-end' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, maxWidth: '78%' }}>
        {attachments && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {attachments.map((a, i) => (
              <div
                key={i}
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
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #43474e, #1a1c20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--bd-2)',
                  }}
                >
                  <Icon name={a.type === 'image' ? 'image' : 'file'} size={14} color="#9aa0a8" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--t-2)' }}>{a.name}</div>
                  <div
                    style={{ fontSize: 10, color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    PNG · 248kb
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--bd-2)',
              color: 'var(--t-1)',
              padding: '12px 16px',
              borderRadius: 'var(--bubble-r, 14px) var(--bubble-r, 14px) 4px var(--bubble-r, 14px)',
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {children}
          </div>
          {hover && (
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: 8,
                display: 'flex',
                gap: 2,
                background: 'var(--bg-3)',
                border: '1px solid var(--bd-3)',
                borderRadius: 6,
                padding: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <button
                title="Edit prompt"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  color: 'var(--t-2)',
                  display: 'flex',
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                title="Copy"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  color: 'var(--t-2)',
                  display: 'flex',
                }}
              >
                <Icon name="copy" size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZoraMsg({
  children,
  streaming,
  footer = true,
}: {
  children: React.ReactNode;
  streaming?: boolean;
  footer?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0 }}>
        <ZoraMark size={32} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-1)' }}>Zora</span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--t-4)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.1em',
              padding: '1px 6px',
              border: '1px solid var(--bd-1)',
              borderRadius: 4,
            }}
          >
            PRO
          </span>
          {streaming && (
            <span
              style={{
                fontSize: 10,
                color: '#9aa0a8',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.15em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#c8ccd2',
                  animation: 'pulse-glow 1.2s infinite',
                }}
              />
              streaming
            </span>
          )}
        </div>
        <div style={{ fontSize: 14, color: 'var(--t-2)', lineHeight: 1.65 }}>{children}</div>
        {footer && !streaming && (
          <div style={{ display: 'flex', gap: 4, marginTop: 12, color: 'var(--t-3)' }}>
            {(['copy', 'refresh', 'thumbUp', 'thumbDown'] as const).map((i) => (
              <button
                key={i}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 7,
                  borderRadius: 6,
                  color: 'var(--t-3)',
                  display: 'flex',
                }}
              >
                <Icon name={i} size={15} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ZoraReply1() {
  return (
    <ZoraMsg>
      <p style={{ margin: '0 0 12px' }}>
        For 10,000+ rows you want <strong style={{ color: 'var(--t-1)' }}>windowing</strong>, not pagination — only
        mount the rows currently visible. Three tradeoffs to be aware of:
      </p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 20, color: 'var(--t-2)' }}>
        <li style={{ marginBottom: 6 }}>
          <strong style={{ color: 'var(--t-1)' }}>Fixed height</strong> — fastest. Just compute{' '}
          <span className="mono" style={{ fontSize: 12 }}>
            startIndex = scrollTop / rowHeight
          </span>
          .
        </li>
        <li style={{ marginBottom: 6 }}>
          <strong style={{ color: 'var(--t-1)' }}>Variable height</strong> — need a measurement cache + intersection
          observer.
        </li>
        <li>
          <strong style={{ color: 'var(--t-1)' }}>Anchored scroll</strong> — preserve position when content above
          changes.
        </li>
      </ol>

      <div
        style={{
          background: '#0a0b0d',
          border: '1px solid var(--bd-1)',
          borderRadius: 10,
          overflow: 'hidden',
          margin: '4px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--bd-1)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'var(--t-3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="code" size={12} /> VirtualizedList.tsx · TypeScript
          <span style={{ flex: 1 }} />
          <span style={{ cursor: 'pointer', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <Icon name="copy" size={12} /> Copy
          </span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12.5,
            lineHeight: 1.6,
            color: '#c8ccd2',
            overflow: 'auto',
          }}
          className="no-scrollbar"
        >
          {`function `}
          <span style={{ color: '#9bb6ff' }}>VirtualList</span>
          {`<T>({ items, rowHeight, render }: Props<T>) {
  const [scrollTop, setScroll] = `}
          <span style={{ color: '#d4a3ff' }}>useState</span>
          {`(0);
  const start = `}
          <span style={{ color: '#d4a3ff' }}>Math.floor</span>
          {`(scrollTop / rowHeight);
  const end = start + `}
          <span style={{ color: '#d4a3ff' }}>Math.ceil</span>
          {`(VIEW_HEIGHT / rowHeight) + `}
          <span style={{ color: '#ffd591' }}>2</span>
          {`;
  const visible = items.`}
          <span style={{ color: '#d4a3ff' }}>slice</span>
          {`(start, end);
  `}
          <span style={{ color: '#6a6f78' }}>// only ~30 nodes mount at once</span>
          {`
  return <div onScroll={e => setScroll(e.currentTarget.scrollTop)}>...</div>;
}`}
        </pre>
      </div>

      <p style={{ margin: '12px 0 0' }}>Want me to wire this up to your dataset or extend it for variable heights?</p>
    </ZoraMsg>
  );
}

function ZoraReply2() {
  const [dots, setDots] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <ZoraMsg streaming>
      <p style={{ margin: '0 0 10px' }}>
        Looking at your mock — you&apos;ve got <strong style={{ color: 'var(--t-1)' }}>variable row heights</strong>{' '}
        because some rows wrap to two lines and some have media. Here&apos;s the approach:
      </p>
      <p style={{ margin: '0 0 4px' }}>
        Use a <strong style={{ color: 'var(--t-1)' }}>measurement cache</strong> keyed on item id. On first render of
        each row, measure with a ResizeObserver and store the height. The list then computes offsets from the cache
        rather than assuming uniform spacing
        <span
          style={{
            display: 'inline-block',
            marginLeft: 4,
            color: '#c8ccd2',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {'.'.repeat(dots)}
          <span
            style={{
              background: '#c8ccd2',
              width: 8,
              height: 14,
              display: 'inline-block',
              verticalAlign: 'middle',
              marginLeft: 2,
            }}
          />
        </span>
      </p>
    </ZoraMsg>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 18,
        height: 18,
        padding: '0 4px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: 'var(--t-3)',
        background: 'var(--bg-2)',
        border: '1px solid var(--bd-1)',
        borderRadius: 3,
        lineHeight: 1,
      }}
    >
      {children}
    </kbd>
  );
}

function Composer({
  value,
  onChange,
  onUploadAttempt,
  loggedIn,
}: {
  value: string;
  onChange: (v: string) => void;
  onUploadAttempt: () => void;
  loggedIn: boolean;
}) {
  return (
    <div style={{ padding: '14px 28px 22px', borderTop: '1px solid var(--bd-1)', background: 'var(--bg-0)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--bd-2)',
            borderRadius: 16,
            padding: '12px 14px 10px',
            position: 'relative',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask Zora anything — paste a link, drag a file, or hold ⌥ to think harder…"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--t-1)',
              fontFamily: 'inherit',
              fontSize: 14.5,
              lineHeight: 1.5,
              resize: 'none',
              minHeight: 24,
              maxHeight: 200,
            }}
            rows={1}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <button
              onClick={onUploadAttempt}
              title={loggedIn ? 'Attach file' : 'Login required to upload'}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 7,
                borderRadius: 7,
                color: 'var(--t-3)',
                display: 'flex',
              }}
            >
              <Icon name="paperclip" size={17} />
            </button>
            <button
              onClick={onUploadAttempt}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 7,
                borderRadius: 7,
                color: 'var(--t-3)',
                display: 'flex',
              }}
            >
              <Icon name="image" size={17} />
            </button>

            <div style={{ flex: 1 }} />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                border: '1px solid var(--bd-1)',
                borderRadius: 999,
                fontSize: 11,
                color: 'var(--t-3)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.1em',
                marginRight: 6,
              }}
            >
              <Icon name="globe" size={11} /> WEB
            </div>

            <button
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 7,
                borderRadius: 7,
                color: 'var(--t-3)',
                display: 'flex',
              }}
            >
              <Icon name="mic" size={17} />
            </button>

            <button
              style={{
                background: 'var(--steel-shine)',
                border: 'none',
                cursor: 'pointer',
                width: 32,
                height: 32,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0a0a0a',
                position: 'relative',
              }}
              title="Stop generating (currently streaming)"
            >
              <span style={{ width: 10, height: 10, background: '#0a0a0a', borderRadius: 2, display: 'block' }} />
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--t-4)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span>Zora can make mistakes. Verify important info.</span>
          <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--t-4)' }} />
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <Kbd>⏎</Kbd> send
            <Kbd>⇧⏎</Kbd> newline
            <Kbd>⌘K</Kbd> focus
          </span>
          {!loggedIn && <span style={{ color: 'var(--t-3)' }}>· guest mode — chats wipe on refresh.</span>}
        </div>
      </div>
    </div>
  );
}

export function LoginRequiredModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function handleGoogle() {
    setNotice(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      setNotice("Couldn't sign in with Google. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMicrosoft() {
    setNotice(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1400));
    setNotice("Couldn't reach Microsoft sign-in. Use Google or Email — recommended.");
    setBusy(false);
  }

  async function handleGithub() {
    setNotice(null);
    setBusy(true);
    try {
      await signInWithGithub();
      onClose();
    } catch {
      setNotice("Couldn't sign in with GitHub. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleEmail() {
    onClose();
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  function handlePhone() {
    setNotice('Phone sign-in is coming soon. Use Email or Google for now.');
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: 'var(--brushed)',
          border: '1px solid var(--bd-3)',
          borderRadius: 16,
          padding: 28,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'transparent',
            border: 'none',
            color: 'var(--t-3)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Icon name="x" size={16} />
        </button>

        <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
          <ZoraMark size={56} />
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--t-1)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          Sign in to upload
        </div>
        <div style={{ fontSize: 13, color: 'var(--t-3)', marginBottom: 22, lineHeight: 1.5 }}>
          Media uploads require an account. Free tier — your chats auto-delete after 7 days.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="btn"
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            <Icon name="google" size={16} /> Continue with Google
          </button>
          <button
            onClick={handleMicrosoft}
            disabled={busy}
            className="btn"
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            <Icon name="microsoft" size={16} /> Continue with Microsoft
          </button>
          <button
            onClick={handleGithub}
            disabled={busy}
            className="btn"
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            <Icon name="github" size={16} /> Continue with GitHub
          </button>
          <button
            onClick={handleEmail}
            disabled={busy}
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Icon name="mail" size={16} /> Email OTP
          </button>
          <button
            onClick={handlePhone}
            disabled={busy}
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Icon name="phone" size={16} /> Phone OTP
          </button>
        </div>
        {notice && (
          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              color: 'var(--t-2)',
              lineHeight: 1.5,
            }}
          >
            {notice}
          </div>
        )}
        <div
          style={{
            fontSize: 10,
            color: 'var(--t-4)',
            marginTop: 16,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
          }}
        >
          BY CONTINUING YOU AGREE TO ZORA&apos;S TERMS
        </div>
      </div>
    </div>
  );
}

export function ChatEmpty({
  width = 1280,
  height = 800,
}: {
  width?: number | string;
  height?: number | string;
}) {
  const [model, setModel] = React.useState('Pro');
  const [composer, setComposer] = React.useState('');
  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        overflow: 'hidden',
      }}
    >
      <ChatSidebar loggedIn={true} active={null} onSelect={() => {}} />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ChatTopBar model={model} setModel={setModel} loggedIn={true} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            position: 'relative',
          }}
        >
          <div style={{ filter: 'drop-shadow(0 8px 40px rgba(200,204,210,0.25))', marginBottom: 28 }}>
            <ZoraMark size={72} />
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              fontSize: 38,
              letterSpacing: '-0.03em',
              textAlign: 'center',
            }}
          >
            How can I help you today?
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--t-3)' }}>
            Ask anything, drop a file, or pick a suggestion below.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              marginTop: 32,
              maxWidth: 720,
              width: '100%',
            }}
          >
            {[
              { icon: 'file', title: 'Summarize a PDF', desc: 'in 5 bullets' },
              { icon: 'code', title: 'Explain this code', desc: 'line by line' },
              { icon: 'mail', title: 'Draft an email', desc: 'confident, brief' },
              { icon: 'sparkle', title: 'Brainstorm ideas', desc: 'for a launch post' },
            ].map((p) => (
              <button
                key={p.title}
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid var(--bd-2)',
                  borderRadius: 12,
                  padding: '14px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'var(--t-1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  alignItems: 'flex-start',
                  transition: 'background .15s, border .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-2)';
                  e.currentTarget.style.borderColor = 'var(--bd-3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-1)';
                  e.currentTarget.style.borderColor = 'var(--bd-2)';
                }}
              >
                <Icon name={p.icon} size={16} color="#c8ccd2" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--t-3)', marginTop: 3 }}>{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <Composer value={composer} onChange={setComposer} onUploadAttempt={() => {}} loggedIn={true} />
      </div>
    </div>
  );
}

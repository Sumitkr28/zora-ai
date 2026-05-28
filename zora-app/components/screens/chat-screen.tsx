'use client';

// The real, working chat screen.
// - Streams Gemini responses from /api/chat
// - Persists to Firestore for logged-in users (plan §3.1)
// - Guest mode keeps messages in component state only (wipes on refresh)
// - Uploads (Phase 5):
//     - Images ≤10 MB → base64 inline (fast)
//     - PDFs / audio / video → /api/upload → Gemini Files API
//
// Visuals are the same brushed-steel system as the design canvas.

import React from 'react';
import { ZoraMark, Icon } from '../logo';
import { LoginRequiredModal } from './chat';
import { MarkdownMessage } from '../markdown';
import { useAuth } from '../AuthProvider';
import { useIsMobile } from '../useIsMobile';
import { MobileDrawer } from '../mobile-drawer';
import {
  listConversations,
  loadMessages,
  createConversation,
  appendMessages,
  deleteConversation,
  type ConversationMeta,
  type Message,
  type Attachment,
} from '@/lib/conversations';

type ModelTier = 'Lite' | 'Pro' | 'Max';

// Plan → model mapping. Plan field lives on /users/{uid}.plan in Firestore (default 'free').
// When paid plans get wired, read user.plan from Firestore and pick the matching model here.
// Until then, everyone is on the Free plan, which uses the Lite model.
const CURRENT_MODEL: ModelTier = 'Lite';
const MODEL_DESC: Record<ModelTier, string> = {
  Lite: 'fast · everyday',
  Pro: 'balanced',
  Max: 'deep reasoning',
};

// File-picker accept filters per attachment type. "docs" shows PDF + Office + text formats.
// NOTE: Gemini reads PDF and plain-text natively; Office binaries (.docx/.xlsx/.pptx) are NOT
// yet supported by the upload pipeline and are rejected server-side with a clear message.
const ATTACH_ACCEPT = {
  image: 'image/*',
  docs: 'application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md',
  audio: 'audio/*',
  video: 'video/*',
} as const;

const SUGGESTIONS = [
  { icon: 'file', title: 'Summarize a PDF', desc: 'in 5 bullets', prompt: 'Summarize this PDF in 5 bullet points.' },
  { icon: 'code', title: 'Explain this code', desc: 'line by line', prompt: 'Explain this code line by line.' },
  { icon: 'mail', title: 'Draft an email', desc: 'confident, brief', prompt: 'Draft a confident, brief email about ' },
  { icon: 'sparkle', title: 'Brainstorm ideas', desc: 'for a launch post', prompt: 'Brainstorm 10 ideas for ' },
];

// localStorage key for the last open conversation (survives full reload / tab reopen — cross-tab).
const ACTIVE_CONV_KEY = 'zora.activeConvId';
// sessionStorage key for the full open chat (survives full-page reloads & <a href> navigation
// within THIS tab; cleared when the tab is closed). This is what makes the chat survive going to
// /about and back, regardless of whether links do a full reload or client-side nav.
const SESSION_CHAT_KEY = 'zora.sessionChat';

// Read this tab's cached chat, but only if it belongs to the current user (or guest). Scoped by
// uid so it never leaks one account's chat to another after a login switch.
function readSessionChat(uid: string | null): { convId: string | null; messages: Message[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_CHAT_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { uid: string | null; convId: string | null; messages: Message[] };
    if (p.uid !== uid) return null;
    return { convId: p.convId ?? null, messages: Array.isArray(p.messages) ? p.messages : [] };
  } catch {
    return null;
  }
}

function writeSessionChat(uid: string | null, convId: string | null, messages: Message[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_CHAT_KEY, JSON.stringify({ uid, convId, messages }));
  } catch {
    /* quota exceeded (very long chat) — reload will fall back to Firestore */
  }
}

export function ChatScreen() {
  const { user, loading } = useAuth();
  const loggedIn = !!user;
  const uid = user?.uid ?? null;

  // Read the tab's cached chat once at mount (synchronous so client-side nav restores with no flash).
  const bootRef = React.useRef<{ convId: string | null; messages: Message[] } | null | undefined>(undefined);
  if (bootRef.current === undefined) bootRef.current = readSessionChat(uid);
  const boot = bootRef.current;

  const [conversations, setConversations] = React.useState<ConversationMeta[]>([]);
  const [activeConvId, setActiveConvId] = React.useState<string | null>(boot?.convId ?? null);
  const [messages, setMessages] = React.useState<Message[]>(boot?.messages ?? []);
  // Whether we already restored an open conversation (from sessionStorage) — skips the
  // localStorage/Firestore fallback restore below.
  const restoredFromCacheRef = React.useRef(!!boot && (boot.convId !== null || boot.messages.length > 0));
  const [composer, setComposer] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const model: ModelTier = CURRENT_MODEL;
  const [pendingAttachment, setPendingAttachment] = React.useState<PendingAttachment | null>(null);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const threadScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll the thread to the bottom whenever messages update (incl. each streaming chunk).
  React.useEffect(() => {
    const el = threadScrollRef.current;
    if (!el) return;
    // Use requestAnimationFrame so we scroll after the new DOM has laid out.
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  // Mirror the open chat into sessionStorage on every change, so a full-page reload or <a href>
  // navigation within this tab restores it instantly.
  React.useEffect(() => {
    writeSessionChat(uid, activeConvId, messages);
  }, [uid, activeConvId, messages]);

  // Reload-timing restore: on a fresh page load, `uid` is null while auth resolves, so the
  // synchronous mount read above misses. Once uid is known, restore from sessionStorage.
  React.useEffect(() => {
    if (restoredFromCacheRef.current) return;
    const cached = readSessionChat(uid);
    if (cached && (cached.convId !== null || cached.messages.length > 0)) {
      setActiveConvId(cached.convId);
      setMessages(cached.messages);
      restoredFromCacheRef.current = true;
    }
  }, [uid]);

  // Persist the active conversation id so a NEW tab / reopen-after-close can restore it from Firestore.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeConvId) window.localStorage.setItem(ACTIVE_CONV_KEY, activeConvId);
    else window.localStorage.removeItem(ACTIVE_CONV_KEY);
  }, [activeConvId]);

  // Load conversation list when user signs in. On a fresh load (no in-session cache) also restore
  // the conversation the user was last in, as long as it still exists in Firestore (≤ 7 days).
  React.useEffect(() => {
    if (!loggedIn || !user) {
      setConversations([]);
      return;
    }
    let cancelled = false;
    listConversations(user.uid)
      .then((convs) => {
        if (cancelled) return;
        setConversations(convs);
        // Skip this fallback if the tab's sessionStorage already restored the chat.
        if (!restoredFromCacheRef.current && !readSessionChat(uid) && typeof window !== 'undefined') {
          const stored = window.localStorage.getItem(ACTIVE_CONV_KEY);
          if (stored && convs.some((c) => c.id === stored)) {
            setActiveConvId(stored);
            loadMessages(stored)
              .then((m) => {
                if (!cancelled) setMessages(m);
              })
              .catch((e) => console.warn('restore loadMessages failed', e));
          } else if (stored) {
            window.localStorage.removeItem(ACTIVE_CONV_KEY); // conversation gone (deleted/expired)
          }
        }
      })
      .catch((e) => console.warn('listConversations failed', e));
    return () => {
      cancelled = true;
    };
  }, [loggedIn, user]);

  async function handleSwitchConversation(convId: string) {
    if (streaming) return;
    setActiveConvId(convId);
    try {
      const msgs = await loadMessages(convId);
      setMessages(msgs);
    } catch (e) {
      console.warn('loadMessages failed', e);
    }
  }

  function handleNewChat() {
    if (streaming) abortRef.current?.abort();
    setActiveConvId(null);
    setMessages([]);
    setComposer('');
    setPendingAttachment(null);
    setUploadError(null);
    setTimeout(() => composerRef.current?.focus(), 50);
  }

  async function handleDeleteConversation(convId: string) {
    if (!loggedIn) return;
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) handleNewChat();
    } catch (e) {
      console.warn('deleteConversation failed', e);
    }
  }

  function handleStopStreaming() {
    abortRef.current?.abort();
  }

  // Open the OS file picker filtered to a specific accept string (e.g. 'image/*', 'audio/*').
  // We mutate the single hidden input's `accept` per click so each button/menu-item opens a
  // dialog scoped to its own file types. handleFileChosen still categorizes by MIME afterward.
  function handlePick(accept: string) {
    if (!loggedIn) {
      setShowUploadModal(true);
      return;
    }
    setUploadError(null);
    const input = fileInputRef.current;
    if (input) {
      input.accept = accept;
      input.value = ''; // allow re-picking the same file
    }
    input?.click();
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (!loggedIn) {
      setShowUploadModal(true);
      return;
    }
    setUploadError(null);

    const mime = file.type || 'application/octet-stream';
    const isImage = mime.startsWith('image/');
    const sizeMB = file.size / 1024 / 1024;

    if (isImage && sizeMB <= 10) {
      // Inline path — base64 the file, attach as inlineData
      try {
        const base64 = await fileToBase64(file);
        setPendingAttachment({
          kind: 'inline',
          name: file.name,
          size: file.size,
          mimeType: mime,
          inlineDataKey: base64,
          category: 'image',
        });
      } catch {
        setUploadError('Could not read image.');
      }
      return;
    }

    // Server upload path (PDF / audio / video / image >10MB)
    setPendingAttachment({
      kind: 'uploading',
      name: file.name,
      size: file.size,
      mimeType: mime,
      category: categoryOf(mime),
    });

    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const errText = await res.text();
        setUploadError(errText || `Upload failed (${res.status})`);
        setPendingAttachment(null);
        return;
      }
      const json = (await res.json()) as {
        fileUri: string;
        mimeType: string;
        name: string;
        size: number;
        category: 'image' | 'pdf' | 'audio' | 'video';
      };
      setPendingAttachment({
        kind: 'remote',
        name: json.name,
        size: json.size,
        mimeType: json.mimeType,
        fileUri: json.fileUri,
        category: json.category,
      });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.');
      setPendingAttachment(null);
    }
  }

  async function handleSend() {
    const text = composer.trim();
    if (!text && !pendingAttachment) return;
    if (streaming) return;
    if (pendingAttachment && pendingAttachment.kind === 'uploading') return;

    // Build user message (any pending attachment here is settled — the guard above returned on 'uploading')
    const userAttachments: Attachment[] = [];
    if (pendingAttachment) {
      userAttachments.push({
        type: pendingAttachment.category,
        name: pendingAttachment.name,
        size: pendingAttachment.size,
        mimeType: pendingAttachment.mimeType,
        fileUri: 'fileUri' in pendingAttachment ? pendingAttachment.fileUri : undefined,
        inlineDataKey:
          'inlineDataKey' in pendingAttachment ? '[inline]' : undefined,
      });
    }

    const userMsg: Message = {
      id: cryptoId(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
      attachments: userAttachments.length > 0 ? userAttachments : undefined,
    };
    const assistantMsg: Message = {
      id: cryptoId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      streaming: true,
    };

    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);
    setComposer('');
    setStreaming(true);

    // Build API payload — must include the inline base64 for the latest attachment
    const apiMessages = [...messages, userMsg].map((m, idx) => {
      const out: {
        role: 'user' | 'assistant';
        content: string;
        attachments?: { inlineData?: { data: string; mimeType: string }; fileData?: { fileUri: string; mimeType: string } }[];
      } = { role: m.role, content: m.content };

      // Only the LAST user message carries the pending attachment (latest)
      if (idx === nextMessages.length - 2 && pendingAttachment) {
        const a = pendingAttachment;
        if ('inlineDataKey' in a) {
          out.attachments = [{ inlineData: { data: a.inlineDataKey, mimeType: a.mimeType } }];
        } else if ('fileUri' in a) {
          out.attachments = [{ fileData: { fileUri: a.fileUri, mimeType: a.mimeType } }];
        }
      }
      return out;
    });

    // Clear the staged attachment now that it's been sent
    const sentAttachment = pendingAttachment;
    setPendingAttachment(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let accumulated = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, model }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const errText = res.body ? await res.text() : `HTTP ${res.status}`;
        throw new Error(errText || 'Chat request failed');
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => updateLast(prev, (m) => ({ ...m, content: accumulated })));
      }
      setMessages((prev) => updateLast(prev, (m) => ({ ...m, streaming: false })));
    } catch (e) {
      const isAbort = e instanceof DOMException && e.name === 'AbortError';
      if (isAbort) {
        setMessages((prev) =>
          updateLast(prev, (m) => ({
            ...m,
            content: accumulated + (accumulated ? ' ' : '') + '[stopped]',
            streaming: false,
          })),
        );
      } else {
        console.error('chat error:', e);
        const msg = e instanceof Error ? e.message : 'Something went wrong.';
        setMessages((prev) =>
          updateLast(prev, (m) => ({
            ...m,
            content: `I couldn't reach Gemini just now (${msg}). Try again in a moment.`,
            streaming: false,
          })),
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }

    // Persist to Firestore if logged in
    if (loggedIn && user) {
      try {
        let convId = activeConvId;
        if (!convId) {
          convId = await createConversation(user.uid, text || (sentAttachment ? sentAttachment.name : 'New chat'));
          setActiveConvId(convId);
          setConversations((prev) => [
            {
              id: convId!,
              title:
                (text || (sentAttachment ? sentAttachment.name : 'New chat')).slice(0, 60) || 'New chat',
              createdAt: Date.now(),
              lastMessageAt: Date.now(),
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            },
            ...prev,
          ]);
        }
        // We don't persist the inline base64 (too big) — just record the user message + final assistant message
        const persistedAttachments: Attachment[] | undefined =
          sentAttachment
            ? [
                {
                  type: sentAttachment.category,
                  name: sentAttachment.name,
                  size: sentAttachment.size,
                  mimeType: sentAttachment.mimeType,
                  fileUri: 'fileUri' in sentAttachment ? sentAttachment.fileUri : undefined,
                },
              ]
            : undefined;
        await appendMessages(convId, [
          { ...userMsg, attachments: persistedAttachments },
          { id: assistantMsg.id, role: 'assistant', content: accumulated, createdAt: Date.now() },
        ]);
      } catch (e) {
        console.warn('Failed to persist conversation', e);
      }
    }
  }

  function handleSuggestionClick(prompt: string) {
    setComposer(prompt);
    setTimeout(() => composerRef.current?.focus(), 0);
  }

  // ─────────────── render ───────────────
  if (loading) {
    return <div style={{ width: '100%', height: '100%', background: 'var(--bg-0)' }} />;
  }

  // Drawer-aware wrappers — on mobile, picking a conversation or starting a new chat
  // should close the slide-in sidebar so the chat is visible again.
  const handleSelectFromSidebar = (id: string) => {
    if (isMobile) setDrawerOpen(false);
    handleSwitchConversation(id);
  };
  const handleNewFromSidebar = () => {
    if (isMobile) setDrawerOpen(false);
    handleNewChat();
  };

  const sidebar = (
    <Sidebar
      loggedIn={loggedIn}
      userInitials={initialsFromUser(user)}
      userName={displayNameFromUser(user)}
      conversations={conversations}
      activeId={activeConvId}
      onSelect={handleSelectFromSidebar}
      onNew={handleNewFromSidebar}
      onDelete={handleDeleteConversation}
    />
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-0)',
        color: 'var(--t-1)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {isMobile ? (
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebar}
        </MobileDrawer>
      ) : (
        sidebar
      )}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <TopBar
          loggedIn={loggedIn}
          model={model}
          isMobile={isMobile}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <div
          ref={threadScrollRef}
          style={{ flex: 1, overflowY: 'auto', padding: '32px 0 16px' }}
          className="no-scrollbar"
        >
          {messages.length === 0 ? (
            <EmptyState onPick={handleSuggestionClick} isMobile={isMobile} />
          ) : (
            <Thread messages={messages} isMobile={isMobile} />
          )}
        </div>
        <Composer
          value={composer}
          onChange={setComposer}
          onSend={handleSend}
          streaming={streaming}
          onStop={handleStopStreaming}
          onPick={handlePick}
          pendingAttachment={pendingAttachment}
          onClearAttachment={() => setPendingAttachment(null)}
          uploadError={uploadError}
          loggedIn={loggedIn}
          textareaRef={composerRef}
          isMobile={isMobile}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,audio/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileChosen}
      />

      {showUploadModal && <LoginRequiredModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
}

// ───────────────────────────────────────
// Subcomponents
// ───────────────────────────────────────

function Sidebar({
  loggedIn,
  userInitials,
  userName,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  loggedIn: boolean;
  userInitials: string;
  userName: string;
  conversations: ConversationMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const grouped = React.useMemo(() => {
    const now = Date.now();
    const today: ConversationMeta[] = [];
    const yesterday: ConversationMeta[] = [];
    const week: ConversationMeta[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    for (const c of conversations) {
      const ageMs = now - c.lastMessageAt;
      if (ageMs < dayMs) today.push(c);
      else if (ageMs < 2 * dayMs) yesterday.push(c);
      else week.push(c);
    }
    return [
      { name: 'Today', items: today },
      { name: 'Yesterday', items: yesterday },
      { name: 'Last 7 days', items: week },
    ];
  }, [conversations]);

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
        <a
          href="/"
          title="Zora — Home"
          aria-label="Zora home"
          style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
        >
          <InlineZoraWordmark />
        </a>
      </div>

      <div style={{ padding: '14px 12px 8px' }}>
        <button
          onClick={onNew}
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
        {loggedIn ? (
          conversations.length === 0 ? (
            <div
              style={{
                fontSize: 11,
                color: 'var(--t-4)',
                padding: '24px 12px',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              No chats yet. Start one.
            </div>
          ) : (
            grouped.map(
              (g) =>
                g.items.length > 0 && (
                  <div key={g.name}>
                    <div className="eyebrow" style={{ padding: '14px 8px 6px' }}>
                      {g.name}
                    </div>
                    {g.items.map((c) => (
                      <ConvRow
                        key={c.id}
                        conv={c}
                        active={c.id === activeId}
                        onClick={() => onSelect(c.id)}
                        onDelete={() => onDelete(c.id)}
                      />
                    ))}
                  </div>
                ),
            )
          )
        ) : (
          <div
            style={{
              padding: '18px 14px',
              background: 'var(--bg-2)',
              border: '1px solid var(--bd-1)',
              borderRadius: 10,
              margin: '8px',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--t-2)', marginBottom: 4 }}>Guest mode</div>
            <div style={{ fontSize: 11, color: 'var(--t-4)', lineHeight: 1.5 }}>
              History wipes when you refresh. Sign in to save chats for 7 days.
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--bd-1)', background: 'var(--bg-1)' }}>
        {loggedIn ? (
          <a
            href="/account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 4,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
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
              {userInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--t-1)', fontWeight: 500 }}>{userName}</div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--t-3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Free · click to manage
              </div>
            </div>
          </a>
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

function ConvRow({
  conv,
  active,
  onClick,
  onDelete,
}: {
  conv: ConversationMeta;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  const daysLeft = Math.max(0, Math.ceil((conv.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
  const expiring = daysLeft <= 1;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
          {conv.title}
        </div>
        <div
          style={{
            fontSize: 10,
            color: expiring ? '#d9a36b' : 'var(--t-4)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.08em',
            marginTop: 2,
          }}
        >
          {timeAgo(conv.lastMessageAt)} · expires in {daysLeft}d
        </div>
      </div>
      {hover && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
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
          <Icon name="trash" size={13} />
        </button>
      )}
    </div>
  );
}

function TopBar({
  loggedIn,
  model,
  isMobile,
  onMenuClick,
}: {
  loggedIn: boolean;
  model: ModelTier;
  isMobile: boolean;
  onMenuClick: () => void;
}) {
  return (
    <div
      style={{
        padding: isMobile ? '12px 14px' : '14px 28px',
        borderBottom: '1px solid var(--bd-1)',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 10 : 16,
        background: 'var(--bg-0)',
      }}
    >
      {isMobile && (
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            color: 'var(--t-2)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon name="menu" size={20} />
        </button>
      )}
      <div
        title="Your current model. Upgrade your plan to unlock Pro or Max."
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-2)',
          border: '1px solid var(--bd-2)',
          borderRadius: 8,
          padding: isMobile ? '6px 10px' : '7px 14px',
          fontSize: 12,
          color: 'var(--t-1)',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#28c840',
            boxShadow: '0 0 8px rgba(40, 200, 64, 0.75)',
          }}
        />
        Zora {model}
        {!isMobile && (
          <span style={{ fontSize: 10, color: 'var(--t-3)', marginLeft: 2 }}>· {MODEL_DESC[model]}</span>
        )}
        <a
          href="/pricing"
          style={{
            marginLeft: 8,
            paddingLeft: 10,
            borderLeft: '1px solid var(--bd-2)',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--t-3)',
            textDecoration: 'none',
          }}
        >
          Upgrade
        </a>
      </div>
      <div style={{ flex: 1 }} />
      {!loggedIn && !isMobile && (
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
      <a
        href="/account"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--t-3)',
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          textDecoration: 'none',
        }}
        title="Account"
      >
        <Icon name="settings" size={16} />
      </a>
    </div>
  );
}

function EmptyState({ onPick, isMobile }: { onPick: (prompt: string) => void; isMobile: boolean }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 18px' : 32,
      }}
    >
      <div style={{ filter: 'drop-shadow(0 8px 40px rgba(200,204,210,0.25))', marginBottom: isMobile ? 18 : 28 }}>
        <ZoraMark size={isMobile ? 56 : 72} />
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          fontSize: isMobile ? 26 : 38,
          letterSpacing: '-0.03em',
          textAlign: 'center',
        }}
      >
        How can I help you today?
      </h1>
      <p style={{ marginTop: 8, fontSize: isMobile ? 13 : 14, color: 'var(--t-3)', textAlign: 'center' }}>
        Ask anything, drop a file, or pick a suggestion below.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: 10,
          marginTop: isMobile ? 22 : 32,
          maxWidth: 720,
          width: '100%',
        }}
      >
        {SUGGESTIONS.map((p) => (
          <button
            key={p.title}
            onClick={() => onPick(p.prompt)}
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
  );
}

function Thread({ messages, isMobile }: { messages: Message[]; isMobile: boolean }) {
  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: isMobile ? '0 14px' : '0 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 24 : 32,
      }}
    >
      {messages.map((m) =>
        m.role === 'user' ? <UserBubble key={m.id} msg={m} /> : <ZoraBubble key={m.id} msg={m} />,
      )}
    </div>
  );
}

function UserBubble({ msg }: { msg: Message }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, maxWidth: '78%' }}>
        {msg.attachments && msg.attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {msg.attachments.map((a, i) => (
              <AttachmentChip key={i} attachment={a} />
            ))}
          </div>
        )}
        {msg.content && (
          <div
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--bd-2)',
              color: 'var(--t-1)',
              padding: '12px 16px',
              borderRadius: 'var(--bubble-r, 14px) var(--bubble-r, 14px) 4px var(--bubble-r, 14px)',
              fontSize: 14,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </div>
        )}
      </div>
    </div>
  );
}

function ZoraBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0 }}>
        <ZoraMark size={32} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-1)' }}>Zora</span>
          {msg.streaming && (
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
                  background: '#28c840',
                  boxShadow: '0 0 8px rgba(40, 200, 64, 0.75)',
                  animation: 'pulse-glow 1.2s infinite',
                }}
              />
              streaming
            </span>
          )}
        </div>
        {/* While streaming, show raw text + a live cursor (cheap, no half-fence flicker).
            Once complete, render formatted Markdown. */}
        {msg.streaming ? (
          <div style={{ fontSize: 14, color: 'var(--t-2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {msg.content || <span style={{ color: 'var(--t-4)' }}>…</span>}
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 14,
                background: '#c8ccd2',
                marginLeft: 3,
                verticalAlign: 'middle',
                animation: 'typewriter-blink 0.6s steps(1) infinite',
              }}
            />
          </div>
        ) : msg.content ? (
          <MarkdownMessage content={msg.content} />
        ) : null}
        {!msg.streaming && msg.content && (
          <div style={{ display: 'flex', gap: 4, marginTop: 10, color: 'var(--t-3)' }}>
            <button
              onClick={handleCopy}
              title={copied ? 'Copied' : 'Copy to clipboard'}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                color: copied ? 'var(--t-1)' : 'var(--t-3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              <Icon name={copied ? 'check' : 'copy'} size={13} />
              {copied ? 'copied' : 'copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentChip({ attachment }: { attachment: Attachment }) {
  const iconName = attachment.type === 'image' ? 'image' : 'file';
  return (
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
        <Icon name={iconName} size={14} color="#9aa0a8" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--t-2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {attachment.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}>
          {attachment.type.toUpperCase()}
          {attachment.size ? ` · ${formatBytes(attachment.size)}` : ''}
        </div>
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  streaming,
  onStop,
  onPick,
  pendingAttachment,
  onClearAttachment,
  uploadError,
  loggedIn,
  textareaRef,
  isMobile,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  streaming: boolean;
  onStop: () => void;
  onPick: (accept: string) => void;
  pendingAttachment: PendingAttachment | null;
  onClearAttachment: () => void;
  uploadError: string | null;
  loggedIn: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isMobile: boolean;
}) {
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);
  const addMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!addMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!addMenuRef.current?.contains(e.target as Node)) setAddMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [addMenuOpen]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  // Auto-grow textarea up to ~6 lines
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '24px';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value, textareaRef]);

  const sendDisabled = !streaming && !value.trim() && !pendingAttachment;

  return (
    <div
      style={{
        padding: isMobile
          ? '10px 12px calc(14px + env(safe-area-inset-bottom, 0px))'
          : '14px 28px 22px',
        borderTop: '1px solid var(--bd-1)',
        background: 'var(--bg-0)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {pendingAttachment && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              marginBottom: 8,
              background: 'var(--bg-2)',
              border: '1px solid var(--bd-2)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--t-2)',
            }}
          >
            <Icon
              name={pendingAttachment.category === 'image' ? 'image' : 'file'}
              size={14}
              color="#9aa0a8"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pendingAttachment.name}
              </div>
              {pendingAttachment.kind === 'uploading' && (
                <div style={{ fontSize: 10, color: 'var(--t-4)', fontFamily: "'JetBrains Mono', monospace" }}>
                  uploading…
                </div>
              )}
            </div>
            <button
              onClick={onClearAttachment}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t-3)', padding: 4 }}
              title="Remove"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        {uploadError && (
          <div
            style={{
              marginBottom: 8,
              padding: '8px 12px',
              background: 'rgba(217,112,100,0.08)',
              border: '1px solid rgba(217,112,100,0.3)',
              borderRadius: 8,
              color: '#d97064',
              fontSize: 12,
            }}
          >
            {uploadError}
          </div>
        )}

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
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Zora anything…"
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
              onClick={() => onPick(ATTACH_ACCEPT.docs)}
              title={loggedIn ? 'Attach a document (PDF, Word, Excel, PowerPoint, text)' : 'Login required to upload'}
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
              onClick={() => onPick(ATTACH_ACCEPT.image)}
              title={loggedIn ? 'Attach an image' : 'Login required to upload'}
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

            {/* "+" menu: photo / docs / audio / video, each opening a type-filtered picker */}
            <div ref={addMenuRef} style={{ position: 'relative', display: 'flex' }}>
              <button
                onClick={() => setAddMenuOpen((o) => !o)}
                title="More attachment types"
                style={{
                  background: addMenuOpen ? 'var(--bg-4)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 7,
                  borderRadius: 7,
                  color: 'var(--t-3)',
                  display: 'flex',
                }}
              >
                <Icon name="plus" size={17} />
              </button>
              {addMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    marginBottom: 8,
                    background: 'var(--bg-3)',
                    border: '1px solid var(--bd-3)',
                    borderRadius: 12,
                    padding: 6,
                    minWidth: 168,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                    zIndex: 20,
                  }}
                >
                  {(
                    [
                      { label: 'Photo', icon: 'image', accept: ATTACH_ACCEPT.image },
                      { label: 'Audio', icon: 'audio', accept: ATTACH_ACCEPT.audio },
                      { label: 'Video', icon: 'video', accept: ATTACH_ACCEPT.video },
                      { label: 'Docs', icon: 'file', accept: ATTACH_ACCEPT.docs },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setAddMenuOpen(false);
                        onPick(opt.accept);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '9px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: 'var(--t-2)',
                        fontFamily: 'inherit',
                        fontSize: 13,
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon name={opt.icon} size={15} color="#9aa0a8" /> {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }} />

            <div
              title="Web search — coming soon"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                border: '1px solid var(--bd-1)',
                borderRadius: 999,
                fontSize: 11,
                color: 'var(--t-4)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.1em',
                marginRight: 6,
                cursor: 'not-allowed',
              }}
            >
              <Icon name="globe" size={11} /> WEB
            </div>

            {streaming ? (
              <button
                onClick={onStop}
                title="Stop generating"
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
              >
                <span style={{ width: 10, height: 10, background: '#0a0a0a', borderRadius: 2, display: 'block' }} />
              </button>
            ) : (
              <button
                onClick={onSend}
                disabled={sendDisabled}
                title="Send (Enter)"
                style={{
                  background: sendDisabled ? 'var(--bg-4)' : 'var(--steel-shine)',
                  border: 'none',
                  cursor: sendDisabled ? 'not-allowed' : 'pointer',
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: sendDisabled ? 'var(--t-3)' : '#0a0a0a',
                  opacity: sendDisabled ? 0.6 : 1,
                }}
              >
                <Icon name="send" size={14} color={sendDisabled ? 'currentColor' : '#0a0a0a'} />
              </button>
            )}
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
          {!loggedIn && <span style={{ color: 'var(--t-3)' }}>· guest mode — wipes on refresh</span>}
        </div>
      </div>
    </div>
  );
}

function InlineZoraWordmark() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <ZoraMark size={20} />
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
            fontSize: 5,
            letterSpacing: '0.22em',
            color: 'var(--t-3)',
            marginTop: 3,
            textTransform: 'uppercase',
          }}
        >
          by Xorvion
        </span>
      </div>
    </div>
  );
}

// ─────────────── helpers ───────────────

type PendingAttachment =
  | {
      kind: 'inline';
      name: string;
      size: number;
      mimeType: string;
      inlineDataKey: string; // base64 string
      category: 'image';
    }
  | {
      kind: 'remote';
      name: string;
      size: number;
      mimeType: string;
      fileUri: string;
      category: 'image' | 'pdf' | 'audio' | 'video';
    }
  | {
      kind: 'uploading';
      name: string;
      size: number;
      mimeType: string;
      category: 'image' | 'pdf' | 'audio' | 'video';
    };

function categoryOf(mime: string): 'image' | 'pdf' | 'audio' | 'video' {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  return 'pdf';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const comma = dataUrl.indexOf(',');
      resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function updateLast<T>(arr: T[], updater: (last: T) => T): T[] {
  if (arr.length === 0) return arr;
  const next = arr.slice();
  next[next.length - 1] = updater(next[next.length - 1]);
  return next;
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

function initialsFromUser(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return '··';
  const name = user.displayName || user.email || user.phoneNumber || '';
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function displayNameFromUser(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'Guest';
  return user.displayName || user.email || user.phoneNumber || 'You';
}

'use client';

// /chat — the working chat surface (Phase 4+).
// Renders ChatScreen which handles all state, streaming, persistence.

import { ChatScreen } from '@/components/screens/chat-screen';

export default function ChatPage() {
  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <ChatScreen />
    </div>
  );
}

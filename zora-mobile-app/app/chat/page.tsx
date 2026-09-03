'use client';

// /chat — the same ChatScreen as the web, with two mobile-only trims:
//
//   hideSuggestions  no "Summarize a PDF" / "Explain this code" / … prompt
//                    cards. The Zora mark and "How can I help you today?" stay,
//                    centred in the thread area.
//   hideGuestNote    no "· guest mode — wipes on refresh" caption.
//
// Both default to false in the shared component, so the web chat is unchanged.
//
// Persistence is off regardless: @/lib/conversations resolves to this project's
// no-op stub, so nothing is written to Firestore.

import { ChatScreen } from '@/components/screens/chat-screen';

export default function ChatPage() {
  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <ChatScreen hideSuggestions hideGuestNote noHistory />
    </div>
  );
}

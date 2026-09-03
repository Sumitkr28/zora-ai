// Mobile override for @/lib/conversations — NO CHAT HISTORY ON MOBILE.
//
// The web app persists conversations to Firestore for 7 days. On mobile the
// product decision is that nothing is stored: a chat lives in memory for as long
// as the screen is open and is gone afterwards.
//
// Rather than fork chat-screen.tsx (1775 lines) to strip its persistence calls,
// this module keeps the SAME module surface and makes every write a no-op and
// every read empty. The shared components run unmodified; they just never have
// anything to save or load. That also means the sidebar's conversation list is
// permanently empty, which is the intended mobile behaviour.
//
// Types are re-exported from the web app so the shared components keep their
// exact type contracts.

export type { Attachment, Message, ConversationMeta } from '../../zora-app/lib/conversations';

import type { Message, ConversationMeta } from '../../zora-app/lib/conversations';

/** Always empty — mobile keeps no conversation list. */
export async function listConversations(_uid: string): Promise<ConversationMeta[]> {
  return [];
}

/** Always empty — nothing was ever persisted to load back. */
export async function loadMessages(_convId: string): Promise<Message[]> {
  return [];
}

/**
 * Returns a throwaway in-memory id so the caller's "do I have an active
 * conversation?" logic keeps working. Nothing is written anywhere, and the id is
 * meaningless once the chat screen unmounts.
 */
export async function createConversation(_uid: string, _firstMessageText: string): Promise<string> {
  return `local-${Date.now().toString(36)}`;
}

export async function renameConversation(_convId: string, _title: string): Promise<void> {
  /* no-op: nothing is stored */
}

export async function deleteConversation(_convId: string): Promise<void> {
  /* no-op: nothing is stored */
}

export async function appendMessages(_convId: string, _messages: Message[]): Promise<void> {
  /* no-op: nothing is stored */
}

// Account-level data operations: export everything a user has, and cascade-delete it.
// Reuses the existing Firestore helpers in conversations.ts so the delete order stays
// rule-safe (messages before the parent conversation doc — see deleteConversation).

import { doc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getDb } from './firebase';
import {
  listConversations,
  loadMessages,
  deleteConversation,
  type Message,
} from './conversations';

function tsToISO(ts: unknown): string | null {
  const ms = (ts as Timestamp | undefined)?.toMillis?.();
  return typeof ms === 'number' ? new Date(ms).toISOString() : null;
}

export interface ExportedConversation {
  id: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  expiresAt: string;
  messages: Array<Pick<Message, 'role' | 'content' | 'attachments'> & { createdAt: string }>;
}

export interface ExportedData {
  exportedAt: string;
  account: Record<string, unknown>;
  conversations: ExportedConversation[];
}

/**
 * Gather the user's profile doc + every conversation (with messages) into one plain object.
 * Note: listConversations caps at 50 (its existing limit) — fine for 7-day retention volume.
 */
export async function exportUserData(uid: string): Promise<ExportedData> {
  const db = getDb();
  const userSnap = await getDoc(doc(db, 'users', uid));
  const userData = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};

  const account: Record<string, unknown> = {
    uid,
    displayName: userData.displayName ?? null,
    email: userData.email ?? null,
    phone: userData.phone ?? null,
    photoURL: userData.photoURL ?? null,
    plan: userData.plan ?? null,
    authMethod: userData.authMethod ?? null,
    createdAt: tsToISO(userData.createdAt),
  };

  const metas = await listConversations(uid);
  const conversations: ExportedConversation[] = [];
  for (const m of metas) {
    const msgs = await loadMessages(m.id);
    conversations.push({
      id: m.id,
      title: m.title,
      createdAt: new Date(m.createdAt).toISOString(),
      lastMessageAt: new Date(m.lastMessageAt).toISOString(),
      expiresAt: new Date(m.expiresAt).toISOString(),
      messages: msgs.map((msg) => ({
        role: msg.role,
        content: msg.content,
        attachments: msg.attachments,
        createdAt: new Date(msg.createdAt).toISOString(),
      })),
    });
  }

  return { exportedAt: new Date().toISOString(), account, conversations };
}

/**
 * Delete all of the user's conversations (messages + doc, via deleteConversation) and then
 * their /users/{uid} profile doc. Call BEFORE deleting the Auth user, while still signed in.
 *
 * Best-effort: a single bad/legacy conversation (e.g. a doc with a missing or mismatched
 * `userId` that trips the Firestore rule) must NOT abort the whole account deletion. We delete
 * each conversation independently, swallow per-conversation failures, and always attempt the
 * profile-doc delete. Any leftover conversation docs still carry an `expiresAt` and get swept
 * by the 7-day cleanup. The caller proceeds to delete the Auth user regardless — getting the
 * account itself removed is what matters most for the user.
 */
export async function deleteAllUserData(uid: string): Promise<void> {
  let metas: Awaited<ReturnType<typeof listConversations>> = [];
  try {
    metas = await listConversations(uid);
  } catch (e) {
    console.error('[deleteAllUserData] listConversations failed:', e);
  }
  for (const m of metas) {
    try {
      await deleteConversation(m.id);
    } catch (e) {
      console.error(`[deleteAllUserData] failed to delete conversation ${m.id}:`, e);
    }
  }
  try {
    await deleteDoc(doc(getDb(), 'users', uid));
  } catch (e) {
    console.error('[deleteAllUserData] failed to delete /users doc:', e);
  }
}

// Firestore CRUD for chats. Per plan §3.1:
// - Logged-in users: persist conversations + messages here. Each conversation auto-expires 7d.
// - Guests: NOT used (their messages live in-memory only).

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { getDb } from './firebase';

export interface Attachment {
  type: 'image' | 'pdf' | 'audio' | 'video';
  name: string;
  size?: number;
  mimeType?: string;
  fileUri?: string;
  inlineDataKey?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  streaming?: boolean;
  attachments?: Attachment[];
}

export interface ConversationMeta {
  id: string;
  title: string;
  lastMessageAt: number;
  createdAt: number;
  expiresAt: number;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function titleFromFirstMessage(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 60) return cleaned;
  return cleaned.slice(0, 57).trimEnd() + '…';
}

export async function listConversations(uid: string): Promise<ConversationMeta[]> {
  const db = getDb();
  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', uid),
    orderBy('lastMessageAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  const now = Date.now();
  const conversations: ConversationMeta[] = [];
  for (const d of snap.docs) {
    const data = d.data() as Record<string, unknown>;
    const createdAt = (data.createdAt as Timestamp | undefined)?.toMillis?.() ?? now;
    const lastMessageAt = (data.lastMessageAt as Timestamp | undefined)?.toMillis?.() ?? createdAt;
    const expiresAt =
      (data.expiresAt as Timestamp | undefined)?.toMillis?.() ?? createdAt + SEVEN_DAYS_MS;
    conversations.push({
      id: d.id,
      title: (data.title as string) ?? 'Untitled',
      createdAt,
      lastMessageAt,
      expiresAt,
    });
  }
  return conversations;
}

export async function loadMessages(convId: string): Promise<Message[]> {
  const db = getDb();
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const createdAt = (data.createdAt as Timestamp | undefined)?.toMillis?.() ?? Date.now();
    return {
      id: d.id,
      role: (data.role as Message['role']) ?? 'assistant',
      content: (data.content as string) ?? '',
      createdAt,
      attachments: (data.attachments as Attachment[]) ?? undefined,
    };
  });
}

export async function createConversation(uid: string, firstMessageText: string): Promise<string> {
  const db = getDb();
  const now = Date.now();
  const ref = await addDoc(collection(db, 'conversations'), {
    userId: uid,
    title: titleFromFirstMessage(firstMessageText) || 'New chat',
    model: 'gemini-1.5-flash',
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(now + SEVEN_DAYS_MS),
  });
  return ref.id;
}

export async function renameConversation(convId: string, title: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'conversations', convId), {
    title: title.slice(0, 80),
  });
}

export async function deleteConversation(convId: string): Promise<void> {
  const db = getDb();
  // Delete all messages, then the conversation doc.
  const msgs = await getDocs(collection(db, 'conversations', convId, 'messages'));
  const batch = writeBatch(db);
  msgs.docs.forEach((m) => batch.delete(m.ref));
  batch.delete(doc(db, 'conversations', convId));
  await batch.commit();
}

export async function appendMessages(convId: string, messages: Message[]): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  for (const m of messages) {
    const mRef = doc(db, 'conversations', convId, 'messages', m.id);
    batch.set(mRef, {
      role: m.role,
      content: m.content,
      createdAt: Timestamp.fromMillis(m.createdAt),
      attachments: m.attachments ?? null,
    });
  }
  // Bump lastMessageAt on the parent so the sidebar re-sorts.
  batch.update(doc(db, 'conversations', convId), { lastMessageAt: serverTimestamp() });
  await batch.commit();
}

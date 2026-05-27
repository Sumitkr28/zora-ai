// Spark-mode 7-day cleanup: on every authenticated app load, scan the current user's
// conversations and delete any whose expiresAt < now.
//
// This replaces plan §3.3's scheduled Cloud Function (which needs Blaze). It runs only
// when a logged-in user opens the app, so stale data can linger if nobody visits — that's
// the documented Spark trade-off.

import { collection, query, where, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { getDb } from './firebase';

export async function cleanupStaleConversations(uid: string): Promise<{ deleted: number }> {
  const db = getDb();
  const now = Timestamp.now();
  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', uid),
    where('expiresAt', '<', now),
  );
  const snap = await getDocs(q);
  if (snap.empty) return { deleted: 0 };

  let deleted = 0;
  for (const convDoc of snap.docs) {
    // Fetch+delete subcollection messages, then the conversation itself.
    const msgs = await getDocs(collection(db, 'conversations', convDoc.id, 'messages'));
    const batch = writeBatch(db);
    msgs.docs.forEach((m) => batch.delete(m.ref));
    batch.delete(doc(db, 'conversations', convDoc.id));
    try {
      await batch.commit();
      deleted++;
    } catch (err) {
      console.warn('Cleanup failed for conversation', convDoc.id, err);
    }
  }
  return { deleted };
}

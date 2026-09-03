// Mobile override for @/lib/cleanup — nothing to clean up.
//
// The web app scans Firestore on login and deletes conversations older than
// 7 days. Mobile never writes conversations at all (see ./conversations.ts), so
// this is a no-op that keeps AuthProvider's call site unchanged.

export async function cleanupStaleConversations(_uid: string): Promise<{ deleted: number }> {
  return { deleted: 0 };
}

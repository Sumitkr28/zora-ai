'use client';

// AuthProvider — React context that exposes the current Firebase Auth user.
// Place near the root of the tree (in app/layout.tsx) so any component can call useAuth().

import React from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { completeEmailLinkSignIn, signOutUser } from '@/lib/auth';
import { cleanupStaleConversations } from '@/lib/cleanup';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // If we landed here via an email-link sign-in URL, complete the sign-in.
    // Errors are non-fatal — they shouldn't block the auth listener below.
    completeEmailLinkSignIn().catch((err) => {
      console.error('Email link sign-in failed:', err);
    });

    const auth = getFirebaseAuth();
    let lastCleanupForUid: string | null = null;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Spark-mode 7-day cleanup: when a user signs in, prune their stale conversations
      // (plan §3.3 alternative — replaces the scheduled Cloud Function we'd have on Blaze).
      // Once per session per uid to avoid re-running on every state ping.
      if (u && lastCleanupForUid !== u.uid) {
        lastCleanupForUid = u.uid;
        cleanupStaleConversations(u.uid)
          .then(({ deleted }) => {
            if (deleted > 0) console.info(`Cleaned up ${deleted} stale conversation(s).`);
          })
          .catch((e) => console.warn('Cleanup failed:', e));
      }
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return React.useContext(AuthContext);
}

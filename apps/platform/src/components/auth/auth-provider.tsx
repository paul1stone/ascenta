"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "@/lib/auth/auth-context";

const STORAGE_KEY = "ascenta-dev-user-id";

/**
 * localStorage keys written by the removed RoleProvider. Cleared on first
 * AuthProvider mount so stale state from pre-migration sessions doesn't
 * linger in a user's browser. Can be deleted entirely once no active
 * browsers carry these keys (~30 days post-merge).
 */
const LEGACY_KEYS = ["ascenta-role", "ascenta-persona"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (userId: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "x-dev-user-id": userId },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, userId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      console.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time cleanup of stale keys from the pre-consolidation RoleProvider.
    for (const key of LEGACY_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // localStorage unavailable (SSR, private mode); ignore.
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      fetchUser(stored);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const switchUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      await fetchUser(userId);
    },
    [fetchUser]
  );

  return (
    <AuthContext.Provider value={{ user, switchUser, isDevMode: true, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

"use client";

import { createContext, useContext } from "react";

export type UserRole = "manager" | "employee" | "hr";

export type AuthUser = {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  managerId?: string;
  directReports?: string[];
};

export type AuthContextValue = {
  user: AuthUser | null;
  switchUser: (userId: string) => Promise<void>;
  isDevMode: boolean;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

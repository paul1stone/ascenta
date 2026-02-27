"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const ROLES = ["employee", "manager", "hr"] as const;
type Role = (typeof ROLES)[number];

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  roles: typeof ROLES;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("manager");

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, roles: ROLES }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}

export type { Role };
export { ROLES };

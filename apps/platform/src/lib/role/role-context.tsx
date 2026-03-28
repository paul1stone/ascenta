"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type RoleType,
  type PersonaConfig,
  SEED_PERSONAS,
  DEFAULT_ROLE,
  getDefaultPersona,
} from "./personas";

export interface ResolvedPersona {
  id: string;
  /** EMP1001-style ID from the employees collection */
  employeeId?: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
}

interface RoleContextValue {
  role: RoleType;
  persona: ResolvedPersona | null;
  loading: boolean;
  setRole: (role: RoleType) => void;
  setPersona: (config: PersonaConfig) => void;
  personas: PersonaConfig[];
}

const RoleContext = createContext<RoleContextValue | null>(null);

const LS_ROLE_KEY = "ascenta-role";
const LS_PERSONA_KEY = "ascenta-persona";

function readLS(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // silent
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleType>(DEFAULT_ROLE);
  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>(
    getDefaultPersona(DEFAULT_ROLE),
  );
  const [persona, setResolvedPersona] = useState<ResolvedPersona | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve persona config to DB employee
  const resolvePersona = useCallback(async (config: PersonaConfig) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/employees?search=${encodeURIComponent(config.firstName)}&limit=10`,
      );
      const data = await res.json();
      if (data.employees) {
        const match = data.employees.find(
          (e: { firstName: string; lastName: string }) =>
            e.firstName === config.firstName && e.lastName === config.lastName,
        );
        if (match) {
          setResolvedPersona({
            id: match.id ?? match._id,
            employeeId: match.employeeId as string | undefined,
            firstName: match.firstName,
            lastName: match.lastName,
            title: match.jobTitle ?? config.title,
            department: match.department ?? config.department,
          });
          setLoading(false);
          return;
        }
      }
      // Fallback: use config without DB ID
      setResolvedPersona(null);
    } catch {
      setResolvedPersona(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedRole = readLS(LS_ROLE_KEY) as RoleType | null;
    const savedPersonaJson = readLS(LS_PERSONA_KEY);

    let initialRole = DEFAULT_ROLE;
    let initialPersona = getDefaultPersona(DEFAULT_ROLE);

    if (savedRole && SEED_PERSONAS[savedRole]) {
      initialRole = savedRole;
      initialPersona = getDefaultPersona(savedRole);
    }

    if (savedPersonaJson) {
      try {
        const parsed = JSON.parse(savedPersonaJson) as PersonaConfig;
        // Verify it belongs to the role
        const match = SEED_PERSONAS[initialRole].find(
          (p) => p.firstName === parsed.firstName && p.lastName === parsed.lastName,
        );
        if (match) initialPersona = match;
      } catch {
        // ignore
      }
    }

    setRoleState(initialRole);
    setPersonaConfig(initialPersona);
    resolvePersona(initialPersona);
  }, [resolvePersona]);

  const setRole = useCallback(
    (newRole: RoleType) => {
      const newPersona = getDefaultPersona(newRole);
      setRoleState(newRole);
      setPersonaConfig(newPersona);
      writeLS(LS_ROLE_KEY, newRole);
      writeLS(LS_PERSONA_KEY, JSON.stringify(newPersona));
      resolvePersona(newPersona);
    },
    [resolvePersona],
  );

  const setPersonaFromConfig = useCallback(
    (config: PersonaConfig) => {
      setPersonaConfig(config);
      writeLS(LS_PERSONA_KEY, JSON.stringify(config));
      resolvePersona(config);
    },
    [resolvePersona],
  );

  return (
    <RoleContext.Provider
      value={{
        role,
        persona,
        loading,
        setRole,
        setPersona: setPersonaFromConfig,
        personas: SEED_PERSONAS[role],
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

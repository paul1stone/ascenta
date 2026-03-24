export type RoleType = "hr" | "manager" | "employee";

export interface PersonaConfig {
  firstName: string;
  lastName: string;
  title: string;
  department: string;
}

export const SEED_PERSONAS: Record<RoleType, PersonaConfig[]> = {
  hr: [
    { firstName: "Sarah", lastName: "Chen", title: "HR Manager", department: "HR" },
  ],
  manager: [
    { firstName: "Jason", lastName: "Lee", title: "Engineering Manager", department: "Engineering" },
  ],
  employee: [
    { firstName: "Alex", lastName: "Rivera", title: "Software Engineer", department: "Engineering" },
  ],
};

export const DEFAULT_ROLE: RoleType = "hr";

export function getDefaultPersona(role: RoleType): PersonaConfig {
  return SEED_PERSONAS[role][0];
}

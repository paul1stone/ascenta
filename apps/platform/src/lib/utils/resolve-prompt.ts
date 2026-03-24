import type { ResolvedPersona } from "@/lib/role/role-context";

/**
 * Resolves template tokens in prompt strings.
 * Supported tokens: {{userName}}, {{directReport}} (placeholder for now)
 * Unknown tokens are left as-is.
 *
 * Note: {{directReport}} now resolves to a placeholder. Direct report data
 * is not available on ResolvedPersona. When a team/reports feature is added,
 * this can be restored.
 */
export function resolvePrompt(template: string, persona: ResolvedPersona | null): string {
  const name = persona ? `${persona.firstName} ${persona.lastName}` : "there";
  return template
    .replace(/\{\{userName\}\}/g, name)
    .replace(/\{\{directReport\}\}/g, "a team member");
}

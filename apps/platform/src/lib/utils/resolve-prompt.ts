import type { AuthUser } from "@/lib/auth/auth-context";

/**
 * Resolves template tokens in prompt strings.
 * Supported tokens: {{userName}}, {{directReport}} (placeholder for now)
 * Unknown tokens are left as-is.
 *
 * Note: {{directReport}} now resolves to a placeholder. Direct report data
 * is not available on AuthUser. When a team/reports feature is added,
 * this can be restored.
 */
export function resolvePrompt(template: string, user: AuthUser | null): string {
  const name = user ? user.name : "there";
  return template
    .replace(/\{\{userName\}\}/g, name)
    .replace(/\{\{directReport\}\}/g, "a team member");
}

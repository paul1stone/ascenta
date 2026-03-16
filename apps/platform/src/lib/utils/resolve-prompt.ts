import type { MockUser } from "@/lib/constants/mock-user";

/**
 * Resolves template tokens in prompt strings.
 * Supported tokens: {{userName}}, {{directReport}} (picks first direct report name)
 * Unknown tokens are left as-is.
 */
export function resolvePrompt(template: string, user: MockUser): string {
  const firstReport = user.directReports[0];
  return template
    .replace(/\{\{userName\}\}/g, user.name)
    .replace(/\{\{directReport\}\}/g, firstReport?.name ?? "a team member");
}

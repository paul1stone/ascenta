/**
 * Strategy Translation Constants
 * Shared between client and server — no mongoose dependency.
 */

export const TRANSLATION_STATUSES = [
  "generating",
  "draft",
  "published",
  "archived",
] as const;

export const TRANSLATION_STATUS_LABELS: Record<
  (typeof TRANSLATION_STATUSES)[number],
  string
> = {
  generating: "Generating",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const ROLE_LEVELS = [
  "executive",
  "manager",
  "individual_contributor",
] as const;

export const ROLE_LEVEL_LABELS: Record<
  (typeof ROLE_LEVELS)[number],
  string
> = {
  executive: "Executive",
  manager: "Manager",
  individual_contributor: "Individual Contributor",
};

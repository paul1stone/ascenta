/**
 * PerformanceNote Constants
 * Shared between client and server — no mongoose dependency.
 */

export const NOTE_TYPES = [
  "observation",
  "feedback",
  "coaching",
  "recognition",
  "concern",
] as const;

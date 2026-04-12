/**
 * Translation Lookup Helper
 * Shared function to find a published translation role entry for an employee.
 * Used by all downstream integrations.
 */

import { connectDB } from "@ascenta/db";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";

const EXECUTIVE_KEYWORDS = ["director", "vp", "vice president", "chief", "head of", "cto", "ceo", "cfo", "coo", "cmo", "svp", "evp"];
const MANAGER_KEYWORDS = ["manager", "lead", "supervisor", "team lead", "principal"];

function inferRoleLevel(
  jobTitle: string,
): "executive" | "manager" | "individual_contributor" {
  const lower = jobTitle.toLowerCase();
  if (EXECUTIVE_KEYWORDS.some((kw) => lower.includes(kw))) return "executive";
  if (MANAGER_KEYWORDS.some((kw) => lower.includes(kw))) return "manager";
  return "individual_contributor";
}

export interface TranslationContribution {
  strategyGoalId: string;
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: { strong: string; acceptable: string; poor: string };
}

export interface TranslationBehavior {
  valueName: string;
  expectation: string;
}

export interface TranslationDecisionRights {
  canDecide: string[];
  canRecommend: string[];
  mustEscalate: string[];
}

export interface TranslationRoleData {
  jobTitle: string;
  level: string;
  contributions: TranslationContribution[];
  behaviors: TranslationBehavior[];
  decisionRights: TranslationDecisionRights;
}

/**
 * Look up the published translation for an employee's department + job title.
 * Returns the matching role entry, or null if no translation exists.
 */
export async function getTranslationForEmployee(
  department: string,
  jobTitle: string,
): Promise<TranslationRoleData | null> {
  await connectDB();

  const translation = await StrategyTranslation.findOne({
    department,
    status: "published",
  })
    .sort({ version: -1 })
    .lean();

  if (!translation) return null;

  const t = translation as Record<string, unknown>;
  const roles = t.roles as TranslationRoleData[];

  // Exact title match first
  const exactMatch = roles.find(
    (r) => r.jobTitle.toLowerCase() === jobTitle.toLowerCase(),
  );
  if (exactMatch) return exactMatch;

  // Fallback: match by inferred level
  const level = inferRoleLevel(jobTitle);
  const levelMatch = roles.find((r) => r.level === level);
  return levelMatch ?? null;
}

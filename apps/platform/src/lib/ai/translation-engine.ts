/**
 * Strategy Translation Engine
 * Generates role-based language from Foundation + Strategic Priorities using AI.
 */

import { generateObject } from "ai";
import { connectDB } from "@ascenta/db";
import { getModel, checkProviderConfig } from "@/lib/ai/providers";
import { AI_CONFIG } from "@/lib/ai/config";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { z } from "zod";
import {
  roleTranslationOutputSchema,
  contributionOutputSchema,
  behaviorOutputSchema,
  decisionRightsOutputSchema,
} from "@/lib/validations/strategy-translation";

// ---------------------------------------------------------------------------
// Role level inference from job title
// ---------------------------------------------------------------------------

const EXECUTIVE_KEYWORDS = ["director", "vp", "vice president", "chief", "head of", "cto", "ceo", "cfo", "coo", "cmo", "svp", "evp"];
const MANAGER_KEYWORDS = ["manager", "lead", "supervisor", "team lead", "principal"];

export function inferRoleLevel(
  jobTitle: string,
): "executive" | "manager" | "individual_contributor" {
  const lower = jobTitle.toLowerCase();
  if (EXECUTIVE_KEYWORDS.some((kw) => lower.includes(kw))) return "executive";
  if (MANAGER_KEYWORDS.some((kw) => lower.includes(kw))) return "manager";
  return "individual_contributor";
}

// ---------------------------------------------------------------------------
// Staleness detection
// ---------------------------------------------------------------------------

export async function checkTranslationStaleness(
  translation: Record<string, unknown>,
): Promise<{ isStale: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  const generatedFrom = translation.generatedFrom as {
    foundationUpdatedAt?: Date;
    strategyGoalIds?: string[];
    generatedAt?: Date;
  };

  if (!generatedFrom?.generatedAt) {
    return { isStale: true, reasons: ["No generation timestamp found"] };
  }

  const genDate = new Date(generatedFrom.generatedAt);

  // Check foundation freshness
  const foundation = await CompanyFoundation.findOne().lean();
  if (foundation) {
    const foundationUpdated = new Date(
      (foundation as Record<string, unknown>).updatedAt as string,
    );
    if (foundationUpdated > genDate) {
      reasons.push("Foundation has been updated since this translation was generated");
    }
  }

  // Check strategy goals freshness
  const department = translation.department as string;
  const currentGoals = await StrategyGoal.find({
    $or: [
      { scope: "company", status: { $ne: "archived" } },
      { scope: "department", department, status: { $ne: "archived" } },
    ],
  }).lean();

  const currentIds = new Set(currentGoals.map((g) => String(g._id)));
  const storedIds = new Set(
    (generatedFrom.strategyGoalIds ?? []).map(String),
  );

  const addedGoals = [...currentIds].filter((id) => !storedIds.has(id));
  const removedGoals = [...storedIds].filter((id) => !currentIds.has(id));

  if (addedGoals.length > 0) {
    reasons.push(`${addedGoals.length} new strategy goal(s) added since generation`);
  }
  if (removedGoals.length > 0) {
    reasons.push(`${removedGoals.length} strategy goal(s) removed or archived since generation`);
  }

  return { isStale: reasons.length > 0, reasons };
}

// ---------------------------------------------------------------------------
// Per-section regeneration
// ---------------------------------------------------------------------------

export type TranslationSection = "contributions" | "behaviors" | "decisionRights";

export async function regenerateRoleSection(
  translationId: string,
  roleIndex: number,
  section: TranslationSection,
): Promise<void> {
  await connectDB();

  const translationDoc = await StrategyTranslation.findById(translationId);
  if (!translationDoc) throw new Error("Translation not found");

  const role = translationDoc.roles[roleIndex];
  if (!role) throw new Error(`Role at index ${roleIndex} not found`);

  const foundationDoc = await CompanyFoundation.findOne({ status: "published" }).lean();
  if (!foundationDoc) throw new Error("No published foundation found.");
  const foundation = foundationDoc as Record<string, unknown>;

  const department = translationDoc.department as string;
  const strategyGoals = await StrategyGoal.find({
    $or: [
      { scope: "company", status: { $ne: "archived" } },
      { scope: "department", department, status: { $ne: "archived" } },
    ],
  }).lean();

  const mission = (foundation.mission as string) || "";
  const vision = (foundation.vision as string) || "";
  const values = (foundation.values as string) || "";

  const goalsContext = strategyGoals.map((g) => {
    const goal = g as Record<string, unknown>;
    return {
      id: String(goal._id),
      title: goal.title as string,
      description: goal.description as string,
      horizon: goal.horizon as string,
      scope: goal.scope as string,
      rationale: (goal.rationale as string) || "",
    };
  });

  const jobTitle = role.jobTitle as string;
  const level = role.level as string;

  const availability = checkProviderConfig();
  let modelId: string;
  if (availability.openai) {
    modelId = AI_CONFIG.defaultModels.openai;
  } else if (availability.anthropic) {
    modelId = AI_CONFIG.defaultModels.anthropic;
  } else {
    throw new Error("No AI provider configured.");
  }

  const baseContext = `MISSION: ${mission}\nVISION: ${vision}\nCORE VALUES: ${values}\n\nSTRATEGIC PRIORITIES:\n${goalsContext.map((g) => `- [${g.horizon}] [${g.scope}] "${g.title}": ${g.description}`).join("\n")}\n\nRole: ${jobTitle} (${level}) in ${department}`;

  if (section === "contributions") {
    const result = await generateObject({
      model: getModel(modelId),
      schema: z.object({ contributions: z.array(contributionOutputSchema) }),
      system: `You are regenerating ONLY the contribution statements for a specific role. Keep the same quality standards: mission-anchored contributions, measurable outcomes, concrete alignment descriptors.\n\n${baseContext}`,
      prompt: `Regenerate contribution statements for ${jobTitle} (${level}) for EACH of these goals:\n${goalsContext.map((g) => `- ID: ${g.id}, Title: "${g.title}" (${g.horizon}, ${g.scope})`).join("\n")}`,
    });
    translationDoc.roles[roleIndex].contributions = result.object.contributions;
  } else if (section === "behaviors") {
    const result = await generateObject({
      model: getModel(modelId),
      schema: z.object({ behaviors: z.array(behaviorOutputSchema) }),
      system: `You are regenerating ONLY the behavioral expectations for a specific role. Each behavior must derive from a core value and be observable.\n\n${baseContext}`,
      prompt: `Regenerate behavioral expectations for ${jobTitle} (${level}). Create one behavior per core value.`,
    });
    translationDoc.roles[roleIndex].behaviors = result.object.behaviors;
  } else if (section === "decisionRights") {
    const result = await generateObject({
      model: getModel(modelId),
      schema: z.object({ decisionRights: decisionRightsOutputSchema }),
      system: `You are regenerating ONLY the decision rights for a specific role. Calibrate to role level: executives decide broadly, managers within teams, ICs within their scope.\n\n${baseContext}`,
      prompt: `Regenerate decision rights for ${jobTitle} (${level}). Produce canDecide, canRecommend, and mustEscalate lists.`,
    });
    translationDoc.roles[roleIndex].decisionRights = result.object.decisionRights;
  }

  await translationDoc.save();
}

// ---------------------------------------------------------------------------
// Core generation
// ---------------------------------------------------------------------------

export async function generateTranslationForDepartment(
  department: string,
): Promise<string> {
  await connectDB();

  // 1. Load published Foundation
  const foundationDoc = await CompanyFoundation.findOne({ status: "published" }).lean();
  if (!foundationDoc) {
    throw new Error("No published foundation found. Publish your Mission, Vision & Values first.");
  }
  const foundation = foundationDoc as Record<string, unknown>;

  // 2. Load active strategy goals (company + department)
  const strategyGoals = await StrategyGoal.find({
    $or: [
      { scope: "company", status: { $ne: "archived" } },
      { scope: "department", department, status: { $ne: "archived" } },
    ],
  }).lean();

  if (strategyGoals.length === 0) {
    throw new Error(`No active strategy goals found for department "${department}".`);
  }

  // 3. Load distinct job titles for department
  const employees = await Employee.find({
    department,
    status: "active",
  })
    .select("jobTitle")
    .lean();

  const jobTitles = [
    ...new Set(
      employees
        .map((e) => (e as Record<string, unknown>).jobTitle as string)
        .filter(Boolean),
    ),
  ];

  if (jobTitles.length === 0) {
    throw new Error(`No active employees found in department "${department}".`);
  }

  // 4. Determine next version number
  const lastTranslation = await StrategyTranslation.findOne({ department })
    .sort({ version: -1 })
    .lean();
  const nextVersion = lastTranslation
    ? ((lastTranslation as Record<string, unknown>).version as number) + 1
    : 1;

  // 5. Create translation document in "generating" status
  const goalIds = strategyGoals.map((g) => g._id);
  const translationDoc = await StrategyTranslation.create({
    department,
    version: nextVersion,
    status: "generating",
    generatedFrom: {
      foundationId: foundation._id,
      foundationUpdatedAt: foundation.updatedAt,
      strategyGoalIds: goalIds,
      generatedAt: new Date(),
    },
    roles: [],
  });

  const translationId = String(translationDoc._id);

  // 6. Build context for AI
  const mission = (foundation.mission as string) || "";
  const vision = (foundation.vision as string) || "";
  const values = (foundation.values as string) || "";

  const goalsContext = strategyGoals.map((g) => {
    const goal = g as Record<string, unknown>;
    return {
      id: String(goal._id),
      title: goal.title as string,
      description: goal.description as string,
      horizon: goal.horizon as string,
      scope: goal.scope as string,
      rationale: (goal.rationale as string) || "",
      successMetrics: (goal.successMetrics as string) || "",
    };
  });

  // Resolve the best available model for structured output
  const availability = checkProviderConfig();
  let modelId: string;
  if (availability.openai) {
    modelId = AI_CONFIG.defaultModels.openai;
  } else if (availability.anthropic) {
    modelId = AI_CONFIG.defaultModels.anthropic;
  } else {
    throw new Error(
      "No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
    );
  }

  // 7. Generate translation for each role (with rollback on failure)
  try {
    const roles = [];

    for (const jobTitle of jobTitles) {
      const level = inferRoleLevel(jobTitle);

      const systemPrompt = `You are a strategic translation engine for Ascenta, an AI-powered HR platform. Your job is to convert organizational strategy into specific, actionable, role-based language.

You are generating translation output for a specific role. Every output you produce must be governed by the organization's foundation and strategic priorities as follows:

MISSION (anchors every role contribution statement — describe contributions in service of this mission):
${mission}

VISION (shapes forward-looking outcomes — outcomes should move toward this vision):
${vision}

CORE VALUES (each value must produce a behavioral expectation for this role — values also set the floor for "poor" alignment descriptors):
${values}

STRATEGIC PRIORITIES:
${goalsContext.map((g) => `- [${g.horizon}] [${g.scope}] "${g.title}": ${g.description}${g.rationale ? ` (Rationale: ${g.rationale})` : ""}`).join("\n")}

RULES FOR GENERATION:
1. Role contributions must be specific to the job title and function, not generic.
2. Outcomes must be measurable — include numbers, percentages, or observable indicators where possible.
3. Behaviors must be observable actions, not attitudes or feelings.
4. Decision rights must be calibrated to the role level: executives decide broadly, managers decide within their teams, ICs decide within their scope.
5. Alignment descriptors must be concrete:
   - "Strong" describes what excellent looks like with specific behaviors
   - "Acceptable" describes meeting expectations adequately
   - "Poor" MUST reference value violations when relevant
6. For short-term priorities, produce more tactical, immediate language.
7. For long-term priorities, produce more developmental and capability-building language.
8. Every piece of language should feel like it was written for THIS specific role, not copy-pasted across roles.`;

      const userPrompt = `Generate the strategic translation for this role:

Department: ${department}
Job Title: ${jobTitle}
Role Level: ${level}

Generate contribution statements, outcomes, and alignment descriptors for EACH of the following strategy goals:
${goalsContext.map((g) => `- ID: ${g.id}, Title: "${g.title}" (${g.horizon}, ${g.scope})`).join("\n")}

Also generate behavioral expectations derived from the core values, and decision rights calibrated to the ${level} level.`;

      const { object } = await generateObject({
        model: getModel(modelId),
        schema: roleTranslationOutputSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      roles.push({
        jobTitle,
        level,
        contributions: object.contributions.map((c) => ({
          strategyGoalId: c.strategyGoalId,
          strategyGoalTitle: c.strategyGoalTitle,
          roleContribution: c.roleContribution,
          outcomes: c.outcomes,
          alignmentDescriptors: c.alignmentDescriptors,
        })),
        behaviors: object.behaviors,
        decisionRights: object.decisionRights,
      });
    }

    // 8. Update document with generated roles and set status to draft
    await StrategyTranslation.findByIdAndUpdate(translationId, {
      $set: { roles, status: "draft" },
    });

    return translationId;
  } catch (err) {
    // Roll back the orphaned "generating" record so it doesn't linger in the UI
    await StrategyTranslation.findByIdAndDelete(translationId);
    throw err;
  }
}

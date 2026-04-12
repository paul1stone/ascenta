import { z } from "zod";

/**
 * Zod schema for a single role's AI-generated translation.
 * Used with Vercel AI SDK's generateObject to validate structured output.
 */

export const alignmentDescriptorsSchema = z.object({
  strong: z.string().describe("What strong alignment looks like for this role relative to this priority"),
  acceptable: z.string().describe("What acceptable alignment looks like"),
  poor: z.string().describe("What poor alignment looks like — anchored to core value violations"),
});

export const contributionOutputSchema = z.object({
  strategyGoalId: z.string().describe("The ObjectId of the strategy goal this contribution maps to"),
  strategyGoalTitle: z.string().describe("The title of the strategy goal"),
  roleContribution: z.string().describe("What this role is expected to contribute toward this priority — anchored to the organization's mission"),
  outcomes: z.array(z.string()).min(1).max(4).describe("1-4 measurable results that demonstrate alignment between the role and this priority — shaped by the organization's vision"),
  alignmentDescriptors: alignmentDescriptorsSchema,
});

export const behaviorOutputSchema = z.object({
  valueName: z.string().describe("The core value this behavior derives from"),
  expectation: z.string().describe("The observable behavioral expectation for this role, contextualized to their function and level"),
});

export const decisionRightsOutputSchema = z.object({
  canDecide: z.array(z.string()).describe("Decisions this role can make autonomously"),
  canRecommend: z.array(z.string()).describe("Decisions this role can recommend but not finalize"),
  mustEscalate: z.array(z.string()).describe("Decisions this role must escalate to leadership"),
});

export const roleTranslationOutputSchema = z.object({
  contributions: z.array(contributionOutputSchema).describe("Role contribution per strategic priority"),
  behaviors: z.array(behaviorOutputSchema).describe("Values-derived behavioral expectations"),
  decisionRights: decisionRightsOutputSchema.describe("Decision authority calibrated to role level"),
});

export type RoleTranslationOutput = z.infer<typeof roleTranslationOutputSchema>;

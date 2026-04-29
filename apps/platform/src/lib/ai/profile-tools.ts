/**
 * My Role AI tools — build About Me + Focus Layer through a Compass interview.
 */

import { z } from "zod";
import { tool } from "ai";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { WORKING_DOC_PREFIX, WORKING_DOC_SUFFIX } from "./workflow-constants";

const aboutMeShape = z.object({
  photoBase64: z.string().nullable().optional(),
  pronouns: z.string().nullable().optional(),
  preferredChannel: z.string().nullable().optional(),
  getToKnow: z
    .object({
      personalBio: z.string().optional(),
      hobbies: z.string().optional(),
      funFacts: z.array(z.string()).optional(),
      askMeAbout: z.string().optional(),
      hometown: z.string().optional(),
      currentlyConsuming: z.string().optional(),
      employeeChoice: z
        .object({
          label: z.string().optional(),
          value: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const focusLayerShape = z.object({
  uniqueContribution: z
    .string()
    .describe("What I uniquely contribute — aim for 2-3 sentences (≥ 20 chars)"),
  highImpactArea: z
    .string()
    .describe("Where I have the highest impact — aim for 2-3 sentences (≥ 20 chars)"),
  signatureResponsibility: z
    .string()
    .describe("My signature responsibility — aim for 2-3 sentences (≥ 20 chars)"),
  workingStyle: z
    .string()
    .describe("How I work best — aim for 2-3 sentences (≥ 20 chars)"),
});

// ---------------------------------------------------------------------------
// startMyRoleWorkflowTool — load context, walk About Me first then Focus Layer
// ---------------------------------------------------------------------------

export const startMyRoleWorkflowTool = tool({
  description: `Start a My Role compass session for the current employee. Loads existing About Me + Focus Layer values + assigned JD info.

After calling this tool, walk the user through TWO SECTIONS in order, ONE QUESTION AT A TIME:

**Part 1 — About Me (always first):**
1. Pronouns
2. Preferred contact channel
3. Personal bio (a few sentences)
4. Hobbies
5. Hometown
6. "Ask me about" topics
7. What they're currently consuming (book/show/podcast)
8. Up to 5 fun facts
9. Employee choice (a custom field — label + value)

**Part 2 — Focus Layer (after About Me is complete):**
10. What I uniquely contribute (uniqueContribution)
11. Where I have highest impact (highImpactArea)
12. My signature responsibility (signatureResponsibility)
13. How I work best (workingStyle)

For EACH question:
- If the field has an existing value, restate it: "You currently have: '<value>'." Then present an [ASCENTA_OPTIONS] block with options ["Keep it", "Refine it", "Replace it"]. Use the user's response to decide whether to ask follow-ups or accept the current value.
- If the field is empty, ask the question directly (and reference the JD's responsibilities/competencies as inspiration when the question is in the Focus Layer section).
- Accept open text answers; don't gate on length except for Focus Layer fields, which need 2-3 sentences (≥ 20 chars).

When BOTH sections are fully covered, call openMyRoleDocument with the full payload.

RULES:
- One question at a time. Wait for the response before moving on.
- Use [ASCENTA_OPTIONS] blocks ONLY for keep/refine/replace prompts and any other multiple-choice (e.g., picking from suggested fun facts). Do NOT include the options as a numbered list in the same message.
- Empathetic but concise tone.
- The JD context (jdSnippet) is for inspiration during Focus Layer questions; surface it as "Your JD lists X — does that resonate?" rather than dumping the JD verbatim.`,
  inputSchema: z.object({
    employeeId: z.string().describe("The ObjectId of the current employee"),
    employeeName: z.string().describe("Full name of the current employee"),
  }),
  execute: async ({ employeeId, employeeName }) => {
    if (!mongoose.isValidObjectId(employeeId)) {
      return {
        success: false,
        message: "Invalid employee ID.",
        existing: null,
        jdSnippet: null,
        employeeId,
        employeeName,
      };
    }

    await connectDB();

    const employee = await Employee.findById(employeeId).lean<{
      _id: unknown;
      profile?: Record<string, unknown>;
      jobDescriptionId?: unknown;
    }>();
    if (!employee) {
      return {
        success: false,
        message: "Employee not found.",
        existing: null,
        jdSnippet: null,
        employeeId,
        employeeName,
      };
    }

    const profile = (employee.profile ?? {}) as Record<string, unknown>;
    const gtk = (profile.getToKnow ?? {}) as Record<string, unknown>;
    const aboutMe = {
      photoBase64: (profile.photoBase64 as string | null | undefined) ?? null,
      pronouns: (profile.pronouns as string | null | undefined) ?? "",
      preferredChannel:
        (profile.preferredChannel as string | null | undefined) ?? "",
      getToKnow: {
        personalBio: (gtk.personalBio as string | undefined) ?? "",
        hobbies: (gtk.hobbies as string | undefined) ?? "",
        funFacts: Array.isArray(gtk.funFacts) ? (gtk.funFacts as string[]) : [],
        askMeAbout: (gtk.askMeAbout as string | undefined) ?? "",
        hometown: (gtk.hometown as string | undefined) ?? "",
        currentlyConsuming:
          (gtk.currentlyConsuming as string | undefined) ?? "",
        employeeChoice: {
          label:
            ((gtk.employeeChoice as Record<string, string> | undefined)
              ?.label) ?? "",
          value:
            ((gtk.employeeChoice as Record<string, string> | undefined)
              ?.value) ?? "",
        },
      },
    };

    const fl = await FocusLayer.findOne({ employeeId: employee._id }).lean<{
      responses?: Record<string, string>;
    }>();
    const focusLayer = {
      uniqueContribution: fl?.responses?.uniqueContribution ?? "",
      highImpactArea: fl?.responses?.highImpactArea ?? "",
      signatureResponsibility: fl?.responses?.signatureResponsibility ?? "",
      workingStyle: fl?.responses?.workingStyle ?? "",
    };

    let jdSnippet: {
      title: string;
      coreResponsibilities: string[];
      competencies: string[];
    } | null = null;
    if (employee.jobDescriptionId) {
      const jd = await JobDescription.findById(employee.jobDescriptionId).lean<{
        title: string;
        coreResponsibilities: string[];
        competencies: string[];
      }>();
      if (jd) {
        jdSnippet = {
          title: jd.title,
          coreResponsibilities: jd.coreResponsibilities ?? [],
          competencies: jd.competencies ?? [],
        };
      }
    }

    return {
      success: true,
      existing: { aboutMe, focusLayer },
      jdSnippet,
      employeeId,
      employeeName,
      message: `Loaded ${employeeName}'s current role. Starting with About Me.`,
    };
  },
});

// ---------------------------------------------------------------------------
// openMyRoleDocumentTool — emits the [ASCENTA_WORKING_DOC] block
// ---------------------------------------------------------------------------

export const openMyRoleDocumentTool = tool({
  description:
    "Open the My Role working document with About Me + Focus Layer prefilled. Call this at the END of the interview, not at the beginning. The user reviews and submits.",
  inputSchema: z.object({
    employeeId: z.string(),
    employeeName: z.string(),
    aboutMe: aboutMeShape,
    focusLayer: focusLayerShape,
  }),
  execute: async ({ employeeId, employeeName, aboutMe, focusLayer }) => {
    const payload = {
      action: "open_working_document" as const,
      workflowType: "build-my-role" as const,
      runId: "",
      employeeId,
      employeeName,
      prefilled: { aboutMe, focusLayer },
    };
    return {
      success: true,
      message: `Opened your role for review.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

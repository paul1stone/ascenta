/**
 * Plan/Strategy Studio AI tools
 * Enables MVV creation via Compass chat with conversational, section-by-section flow
 */

import { z } from "zod";
import { tool } from "ai";
import { connectDB } from "@ascenta/db";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";

import {
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "./workflow-constants";

// ---------------------------------------------------------------------------
// Tool 1: Start MVV Session — opens working document and loads existing data
// ---------------------------------------------------------------------------

export const buildMVVTool = tool({
  description: `Start or continue a Mission, Vision & Values working session. This opens the MVV working document form where the user can see and edit their foundation in real-time.

IMPORTANT: After calling this tool, guide the user through ONE SECTION AT A TIME in this order: Mission → Vision → Values.

For each section, ask questions ONE AT A TIME conversationally. After gathering enough context for a section, draft that section and call updateWorkingDocument to save it. Then move to the next section.

**Mission questions (ask one at a time):**
1. What is your organization's core purpose?
2. Who do you serve?
3. What problem do you solve for them?
4. What makes your approach meaningfully different?
5. What must remain true about your company no matter how you grow?

After the user has answered enough mission questions, synthesize their answers into a concise mission statement (1-3 sentences) using markdown formatting and call updateWorkingDocument with { mission: "..." }.

Then say something like: "Great — here's your mission draft in the form. Take a look and let me know if you'd like to adjust anything before we move on to your vision."

**Vision questions (ask one at a time):**
6. What do you want this organization to become over the next 3 to 5 years?
7. What does success look like if you execute well?
8. What market, operational, people, or customer outcomes do you want to be known for?
9. What capabilities must you build to achieve that future?
10. What would make leadership say, "We are on the right path"?

After enough answers, synthesize into a vision statement using markdown formatting and call updateWorkingDocument with { vision: "..." }.

**Values questions (ask one at a time):**
11. What values should guide decisions, behavior, and accountability?
12. Which values are non-negotiable?
13. What does each value look like in action?
14. What behaviors would show that a value is being lived well?
15. What behaviors would violate that value?

After enough answers, synthesize into 3-6 core values using markdown formatting — use **bold** for each value name followed by a dash and description (e.g., "**Empowerment** — We believe..."). Separate values with blank lines. Call updateWorkingDocument with { values: "..." }.

RULES:
- Ask ONE question at a time. Wait for the user's response before asking the next.
- You don't need to ask ALL questions — if the user gives rich answers, you can skip ahead.
- After drafting each section, pause and let the user review before moving on.
- If the user wants to edit something, update via updateWorkingDocument.
- The form auto-saves, so changes appear in real-time.
- ALWAYS use markdown formatting in your drafted content. Use **bold** for emphasis, bullet lists for values, and proper paragraph breaks. The content will be rendered as markdown in the published view.`,
  inputSchema: z.object({
    existingMission: z.string().optional().describe("Pre-existing mission text to load into the form (empty string if starting fresh)"),
    existingVision: z.string().optional().describe("Pre-existing vision text to load into the form"),
    existingValues: z.string().optional().describe("Pre-existing values text to load into the form"),
  }),
  execute: async (params) => {
    // Load existing foundation data if available
    let existing = { mission: "", vision: "", values: "" };
    try {
      await connectDB();
      const doc = await CompanyFoundation.findOne();
      if (doc) {
        existing = {
          mission: doc.mission || "",
          vision: doc.vision || "",
          values: doc.values || "",
        };
      }
    } catch {
      // silent — start fresh
    }

    const prefilled: Record<string, unknown> = {
      mission: params.existingMission ?? existing.mission,
      vision: params.existingVision ?? existing.vision,
      values: params.existingValues ?? existing.values,
    };

    const hasExisting = existing.mission || existing.vision || existing.values;

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "build-mvv" as const,
      runId: "",
      employeeId: "",
      employeeName: "",
      prefilled,
    };

    const message = hasExisting
      ? "I've opened your current Mission, Vision & Values in the working document. I can see you already have some content. Would you like to refine what's there, or start fresh? Let's begin with your **Mission** — I'll ask a few questions to help shape it."
      : "I've opened the Mission, Vision & Values working document. We'll build this together, one section at a time. Let's start with your **Mission**.\n\nFirst question: **What is your organization's core purpose?** What does your company exist to do?";

    return {
      success: true,
      message,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

/**
 * Plan/Strategy Studio AI tools
 * Enables MVV creation and strategy goal creation via Compass chat
 */

import { z } from "zod";
import { tool } from "ai";

import {
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "./workflow-constants";

// ---------------------------------------------------------------------------
// Tool: Build Mission, Vision & Values
// ---------------------------------------------------------------------------

export const buildMVVTool = tool({
  description: `Open the Mission, Vision & Values working document. Use this tool to help a company define or refine their foundation — mission statement, vision statement, and core values.

You should guide the conversation using these questions before calling this tool:

**Mission:**
1. What is our organization's core purpose?
2. Who do we serve?
3. What problem do we solve for them?
4. What makes our approach meaningfully different?
5. What must remain true about our company no matter how we grow?

**Vision:**
6. What do we want this organization to become over the next 3 to 5 years?
7. What does success look like if we execute well?
8. What market, operational, people, or customer outcomes do we want to be known for?
9. What capabilities must we build to achieve that future?
10. What would make leadership say, "We are on the right path"?

**Values:**
11. What values should guide decisions, behavior, and accountability?
12. Which values are non-negotiable?
13. What does each value look like in action?
14. What behaviors would show that a value is being lived well?
15. What behaviors would violate that value?

After gathering context, call this tool with your best draft for all three sections. The user will review and edit in the working document form.`,
  inputSchema: z.object({
    mission: z.string().describe("Draft mission statement — 1-3 sentences describing the company's purpose, who it serves, and why it exists"),
    vision: z.string().describe("Draft vision statement — 1-3 sentences describing the future the company aspires to create"),
    values: z.string().describe("Draft core values — list 3-6 values, each with a name and 1-2 sentence description, separated by newlines"),
  }),
  execute: async (params) => {
    const prefilled: Record<string, unknown> = {
      mission: params.mission,
      vision: params.vision,
      values: params.values,
    };

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "build-mvv" as const,
      runId: "",
      employeeId: "",
      employeeName: "",
      prefilled,
    };

    return {
      success: true,
      message: "I've opened the Mission, Vision & Values form with my draft. You can review and edit each section, then publish when you're ready.",
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});

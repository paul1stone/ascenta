/**
 * Seed script: Populates sample Strategy Translations
 * Run: npx tsx scripts/seed-strategy-translations.ts
 *
 * Prerequisites: Run `pnpm db:seed` and seed-strategy.ts first.
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { CompanyFoundation } from "../packages/db/src/foundation-schema";
import { StrategyGoal } from "../packages/db/src/strategy-goal-schema";
import { StrategyTranslation } from "../packages/db/src/strategy-translation-schema";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected. Seeding Strategy Translations...\n");

  const deleted = await StrategyTranslation.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing translations\n`);

  const foundation = await CompanyFoundation.findOne().lean();
  if (!foundation) {
    console.error("No foundation found. Run seed-strategy.ts first.");
    process.exit(1);
  }

  const goals = await StrategyGoal.find({ status: { $ne: "archived" } }).lean();
  const companyGoals = goals.filter((g) => g.scope === "company");
  const goalIds = goals.map((g) => g._id);

  function buildTranslation(
    department: string,
    roles: {
      jobTitle: string;
      level: "executive" | "manager" | "individual_contributor";
    }[],
  ) {
    return {
      department,
      version: 1,
      status: "published" as const,
      generatedFrom: {
        foundationId: foundation!._id,
        foundationUpdatedAt: (foundation as Record<string, unknown>).updatedAt,
        strategyGoalIds: goalIds,
        generatedAt: new Date(),
      },
      roles: roles.map((r) => ({
        jobTitle: r.jobTitle,
        level: r.level,
        contributions: companyGoals.map((g) => ({
          strategyGoalId: g._id,
          strategyGoalTitle: (g as Record<string, unknown>).title as string,
          roleContribution: `As a ${r.jobTitle}, contribute to "${(g as Record<string, unknown>).title}" by delivering ${r.level === "executive" ? "strategic direction and resource allocation" : r.level === "manager" ? "team coordination and execution oversight" : "hands-on technical execution and quality delivery"}.`,
          outcomes: [
            `Deliver measurable progress on ${((g as Record<string, unknown>).title as string).toLowerCase()} within the current planning horizon`,
            `Maintain alignment with the organization's mission in all related work`,
          ],
          alignmentDescriptors: {
            strong: `Consistently drives progress on ${((g as Record<string, unknown>).title as string).toLowerCase()} with measurable impact. Proactively identifies opportunities and removes blockers.`,
            acceptable: `Meets expectations for contribution. Completes assigned work on time with acceptable quality.`,
            poor: `Fails to demonstrate commitment to this priority. Does not follow through on commitments or meet basic expectations for transparency and accountability.`,
          },
        })),
        behaviors: [
          {
            valueName: "People First",
            expectation: `As a ${r.jobTitle}, prioritize team well-being and development in all decisions. Advocate for resources and support needed by colleagues.`,
          },
          {
            valueName: "Transparency by Default",
            expectation: `Communicate decisions, progress, and blockers openly. Share context proactively rather than waiting to be asked.`,
          },
        ],
        decisionRights: {
          canDecide:
            r.level === "executive"
              ? ["Strategic direction for department", "Resource allocation above $50K", "Hiring and team structure"]
              : r.level === "manager"
                ? ["Sprint priorities and task assignment", "Team process and tooling", "Hiring recommendations"]
                : ["Technical implementation approach", "Code review standards", "Tool selection for individual tasks"],
          canRecommend:
            r.level === "executive"
              ? ["Company-wide policy changes", "Cross-department initiatives"]
              : r.level === "manager"
                ? ["Budget allocation", "Cross-team dependencies"]
                : ["Process improvements", "Architecture decisions"],
          mustEscalate:
            r.level === "executive"
              ? ["Board-level commitments", "Legal and compliance matters"]
              : r.level === "manager"
                ? ["Organizational restructuring", "Budget overruns", "Policy exceptions"]
                : ["Security incidents", "Data breaches", "Customer-facing outages"],
        },
      })),
    };
  }

  const translationDefs = [
    buildTranslation("Engineering", [
      { jobTitle: "Software Engineer", level: "individual_contributor" },
      { jobTitle: "Engineering Manager", level: "manager" },
    ]),
    buildTranslation("HR", [
      { jobTitle: "HR Specialist", level: "individual_contributor" },
      { jobTitle: "HR Director", level: "executive" },
    ]),
    buildTranslation("Product", [
      { jobTitle: "Product Manager", level: "manager" },
      { jobTitle: "Product Designer", level: "individual_contributor" },
    ]),
  ];

  const created = await StrategyTranslation.insertMany(translationDefs);
  console.log(`Created ${created.length} translations:`);
  created.forEach((t) => {
    console.log(
      `  - ${t.department}: ${t.roles.length} roles (v${t.version}, ${t.status})`,
    );
  });

  console.log("\nStrategy Translation seed complete!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

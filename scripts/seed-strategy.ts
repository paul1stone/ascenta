/**
 * Seed script: Populates Strategy Studio data (Foundation + Strategy Goals)
 * Run: npx tsx scripts/seed-strategy.ts
 *
 * Prerequisites: Run `pnpm db:seed` first to populate employees.
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { Employee } from "../packages/db/src/employee-schema";
import { CompanyFoundation } from "../packages/db/src/foundation-schema";
import { StrategyGoal } from "../packages/db/src/strategy-goal-schema";

// ============================================================================
// HELPERS
// ============================================================================

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required. Check .env.local files.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB. Seeding Strategy Studio data...\n");

  // ------------------------------------------------------------------
  // 1. Verify seed personas exist
  // ------------------------------------------------------------------

  const sarahChen = await Employee.findOne({ firstName: "Sarah", lastName: "Chen" }).lean();
  const jasonLee = await Employee.findOne({ firstName: "Jason", lastName: "Lee" }).lean();

  if (!sarahChen || !jasonLee) {
    console.error(
      "Seed personas not found. Run `pnpm db:seed` first to create Sarah Chen and Jason Lee."
    );
    process.exit(1);
  }

  console.log(`HR: ${sarahChen.firstName} ${sarahChen.lastName} (${sarahChen._id})`);
  console.log(`Manager: ${jasonLee.firstName} ${jasonLee.lastName} (${jasonLee._id})\n`);

  // ------------------------------------------------------------------
  // 2. Clear existing Strategy Studio data
  // ------------------------------------------------------------------

  const [foundationDel, goalDel] = await Promise.all([
    CompanyFoundation.deleteMany({}),
    StrategyGoal.deleteMany({}),
  ]);

  console.log(
    `Cleared: ${foundationDel.deletedCount} foundation docs, ${goalDel.deletedCount} strategy goals\n`
  );

  // ------------------------------------------------------------------
  // 3. Create Foundation (Mission, Vision, Values) — published
  // ------------------------------------------------------------------

  const foundation = await CompanyFoundation.create({
    mission:
      "To empower organizations with intelligent, human-centered HR technology that transforms how companies develop, support, and retain their people — making great management accessible to every team.",
    vision:
      "A world where every employee has a clear path to growth, every manager has the tools to lead effectively, and every organization can build a thriving, high-performance culture — powered by AI that amplifies human judgment rather than replacing it.",
    values:
      "People First — Every feature we build starts with the question: does this make someone's work life better?\n\nTransparency by Default — We believe in open communication, clear expectations, and honest feedback at every level.\n\nContinuous Growth — We invest in learning, embrace feedback, and measure progress — for our customers and ourselves.\n\nAccountable Autonomy — We trust our people to own their work, make decisions, and deliver results with integrity.\n\nPragmatic Innovation — We use technology to solve real problems, not to chase trends. AI should make work simpler, not more complex.",
    status: "published",
    publishedAt: daysAgo(30),
  });

  console.log(`Created foundation document (${foundation.status}):`);
  console.log(`  Mission: ${foundation.mission.slice(0, 80)}...`);
  console.log(`  Vision: ${foundation.vision.slice(0, 80)}...`);
  console.log(`  Values: ${foundation.values.split("\n").length} values defined\n`);

  // ------------------------------------------------------------------
  // 4. Create Strategy Goals
  // ------------------------------------------------------------------

  const strategyGoalDefs = [
    // ── Company-wide goals ──────────────────────────────────────────
    {
      title: "Achieve product-market fit in mid-market HR segment",
      description:
        "Establish Ascenta as the go-to AI-powered HR platform for mid-market companies (200-2000 employees). Focus on the corrective action and performance management use cases where our AI differentiation is strongest.",
      horizon: "long_term" as const,
      timePeriod: { start: daysAgo(60), end: daysFromNow(1035) }, // ~3 years
      scope: "company" as const,
      department: null,
      successMetrics:
        "• 50+ paying customers in mid-market segment\n• Net Revenue Retention > 120%\n• NPS > 60 among target segment",
      status: "on_track" as const,
      rationale: "Mid-market HR is underserved by both enterprise incumbents (too complex, too expensive) and SMB tools (too simple). Our AI-first approach can deliver enterprise-quality workflows at mid-market pricing.",
    },
    {
      title: "Build self-serve onboarding that converts trial to paid in under 14 days",
      description:
        "Create a product-led growth motion where HR teams can sign up, import their org, and see value from Ascenta within their first session. Reduce dependency on sales-assisted onboarding.",
      horizon: "medium_term" as const,
      timePeriod: { start: daysAgo(30), end: daysFromNow(365) },
      scope: "company" as const,
      department: null,
      successMetrics:
        "• Trial-to-paid conversion > 15%\n• Median time-to-value < 3 days\n• Self-serve accounts represent 40% of new revenue",
      status: "on_track" as const,
      rationale: "Sales-assisted onboarding doesn't scale past 100 customers. Product-led growth reduces CAC by 60% and lets HR teams self-discover value without a demo call.",
    },
    {
      title: "Launch Grow performance module to general availability",
      description:
        "Ship the complete Grow module — goals, check-ins, performance notes, and reviews — as a generally available feature. Includes AI-assisted goal creation, working document pattern, and manager dashboard.",
      horizon: "short_term" as const,
      timePeriod: { start: daysAgo(45), end: daysFromNow(45) },
      scope: "company" as const,
      department: null,
      successMetrics:
        "• All 4 Grow workflows in production\n• 90%+ uptime during launch week\n• 10+ beta customers actively using Grow features",
      status: "needs_attention" as const,
      rationale: "Performance management is the #1 requested feature from beta customers and the primary differentiator against competitors who only do corrective actions.",
    },

    // ── Engineering department goals ────────────────────────────────
    {
      title: "Reduce P95 API response time to under 500ms",
      description:
        "Optimize backend performance across all critical API routes. Current P95 is 1.2s, primarily driven by MongoDB query patterns and missing indexes. Prioritize chat, goals, and dashboard endpoints.",
      horizon: "short_term" as const,
      timePeriod: { start: daysAgo(14), end: daysFromNow(60) },
      scope: "department" as const,
      department: "Engineering",
      successMetrics:
        "• P95 response time < 500ms on all /api/chat, /api/grow/*, and /api/dashboard/* routes\n• Zero timeout errors in production monitoring",
      status: "on_track" as const,
      rationale: "Beta customers report that slow AI responses during check-ins and goal creation reduce adoption. Sub-500ms is the threshold where the tool feels instant.",
    },
    {
      title: "Establish CI/CD pipeline with automated quality gates",
      description:
        "Build a complete CI/CD pipeline that runs lint, type checking, and tests on every PR. Add staging environment for pre-production validation. Reduce manual deployment steps to zero.",
      horizon: "short_term" as const,
      timePeriod: { start: daysAgo(7), end: daysFromNow(30) },
      scope: "department" as const,
      department: "Engineering",
      successMetrics:
        "• All PRs gated by lint + tsc + test pipeline\n• Staging environment auto-deploys from main\n• Production deploys require one-click approval",
      status: "draft" as const,
      rationale: "Manual deploys have caused two production incidents in the last month. Automated quality gates are non-negotiable before scaling the team.",
    },

    // ── HR department goals ─────────────────────────────────────────
    {
      title: "Design and roll out standardized performance review process",
      description:
        "Create a unified performance review framework that works across all departments. Includes review templates, calibration guidelines, manager training materials, and a Q2 review timeline.",
      horizon: "medium_term" as const,
      timePeriod: { start: daysAgo(10), end: daysFromNow(180) },
      scope: "department" as const,
      department: "HR",
      successMetrics:
        "• Review templates adopted by 100% of departments\n• Manager training completion rate > 90%\n• Employee satisfaction with review process > 4.0/5.0",
      status: "on_track" as const,
      rationale: "Three departments currently use different review formats. Standardization is required before Ascenta can generate meaningful cross-org analytics.",
    },

    // ── Product department goal ─────────────────────────────────────
    {
      title: "Complete competitive analysis and positioning for Q3 launch",
      description:
        "Conduct thorough competitive analysis of the mid-market HR tech landscape. Identify top 5 competitors, map feature parity, and develop positioning that highlights Ascenta's AI-first differentiation.",
      horizon: "short_term" as const,
      timePeriod: { start: daysAgo(5), end: daysFromNow(45) },
      scope: "department" as const,
      department: "Product",
      successMetrics:
        "• Competitive matrix covering top 5 competitors\n• Updated positioning document approved by leadership\n• Sales enablement deck with competitive battle cards",
      status: "on_track" as const,
      rationale: "The sales team lacks battle cards and positioning against Lattice, 15Five, and Culture Amp. Win rates drop 30% in competitive deals without clear differentiation.",
    },
  ];

  const strategyGoals = await StrategyGoal.insertMany(strategyGoalDefs);
  console.log(`Created ${strategyGoals.length} strategy goals:`);
  strategyGoals.forEach((g) => {
    const scopeLabel = g.scope === "company" ? "Company" : g.department;
    console.log(`  - [${g.status}] [${scopeLabel}] [${g.horizon}] ${g.title}`);
  });
  console.log();

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------

  const companyGoals = strategyGoals.filter((g) => g.scope === "company");
  const deptGoals = strategyGoals.filter((g) => g.scope === "department");
  const departments = [...new Set(deptGoals.map((g) => g.department))];

  console.log("=== Seed Summary ===");
  console.log(`  Foundation:       1 document (${foundation.status})`);
  console.log(`  Strategy Goals:   ${strategyGoals.length} total`);
  console.log(`    Company-wide:   ${companyGoals.length}`);
  console.log(`    Department:     ${deptGoals.length} across ${departments.length} departments (${departments.join(", ")})`);
  console.log("\nStrategy Studio seed complete!");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

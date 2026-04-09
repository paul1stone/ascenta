/**
 * Seed script: Populates Grow module test data (Goals, CheckIns, PerformanceNotes)
 * Run: npx tsx scripts/seed-grow.ts
 *
 * Prerequisites: Run `pnpm db:seed` first to populate employees.
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { Employee } from "../packages/db/src/employee-schema";
import { Goal } from "../packages/db/src/goal-schema";
import { CheckIn } from "../packages/db/src/checkin-schema";
import { PerformanceNote } from "../packages/db/src/performance-note-schema";

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
  console.log("Connected to MongoDB. Seeding Grow module data...\n");

  // ------------------------------------------------------------------
  // 1. Find seed personas + additional employees for reports
  // ------------------------------------------------------------------

  // Use the deterministic seed personas from pnpm db:seed
  const sarahChen = await Employee.findOne({ firstName: "Sarah", lastName: "Chen" }).lean();
  const jasonLee = await Employee.findOne({ firstName: "Jason", lastName: "Lee" }).lean();
  const alexRivera = await Employee.findOne({ firstName: "Alex", lastName: "Rivera" }).lean();

  if (!sarahChen || !jasonLee || !alexRivera) {
    console.error(
      "Seed personas not found. Run `pnpm db:seed` first to create Sarah Chen, Jason Lee, and Alex Rivera."
    );
    process.exit(1);
  }

  // Find additional employees for remaining report slots
  const otherEmployees = await Employee.find({
    status: "active",
    _id: { $nin: [sarahChen._id, jasonLee._id, alexRivera._id] },
  }).limit(4).lean();

  if (otherEmployees.length < 3) {
    console.error(
      `Need at least 3 additional employees beyond seed personas. Found ${otherEmployees.length}. Run \`pnpm db:seed\` first.`
    );
    process.exit(1);
  }

  // Jason Lee is the manager; Alex Rivera is first report, then others fill in
  const manager = jasonLee;
  const reports = [alexRivera, ...otherEmployees.slice(0, 4)];

  console.log(`Manager: ${manager.firstName} ${manager.lastName} (${manager._id})`);
  console.log(`HR: ${sarahChen.firstName} ${sarahChen.lastName} (${sarahChen._id})`);
  console.log(
    `Reports: ${reports.map((r) => `${r.firstName} ${r.lastName}`).join(", ")}\n`
  );

  // ------------------------------------------------------------------
  // 2. Clear existing Grow data
  // ------------------------------------------------------------------

  const [goalDel, checkInDel, noteDel] = await Promise.all([
    Goal.deleteMany({}),
    CheckIn.deleteMany({}),
    PerformanceNote.deleteMany({}),
  ]);

  console.log(
    `Cleared: ${goalDel.deletedCount} goals, ${checkInDel.deletedCount} check-ins, ${noteDel.deletedCount} perf notes\n`
  );

  // ------------------------------------------------------------------
  // 3. Create 7 Goals
  // ------------------------------------------------------------------

  const goalDefs = [
    // Goal 1 — performance, active (reports[0])
    {
      objectiveStatement:
        "Reduce average customer support ticket resolution time from 4.2 hours to under 3.4 hours by streamlining the triage process and implementing auto-categorization so that customer satisfaction improves and support capacity scales with growth.",
      goalType: "performance" as const,
      keyResults: [
        {
          description: "Average resolution time consistently below target",
          metric: "Under 3.4 hours for 30 consecutive days",
          deadline: daysFromNow(60),
          status: "in_progress" as const,
        },
        {
          description: "Auto-categorization coverage",
          metric: "60% of incoming tickets auto-categorized accurately",
          deadline: daysFromNow(30),
          status: "achieved" as const,
        },
        {
          description: "Customer satisfaction score improvement",
          metric: "CSAT score above 4.2 (up from 3.8)",
          deadline: daysFromNow(60),
          status: "not_started" as const,
        },
      ],
      timePeriod: { start: daysAgo(30), end: daysFromNow(60) },
      checkInCadence: "monthly" as const,
      supportAgreement:
        "Access to data team for model accuracy reviews, 2 hours/week protected time for process documentation",
      status: "active" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(28) },
      managerConfirmed: { confirmed: true, at: daysAgo(28) },
      owner: reports[0]._id,
      manager: manager._id,
      locked: true,
    },
    // Goal 2 — development, pending_confirmation (reports[1])
    {
      objectiveStatement:
        "Build cross-functional facilitation skills by leading bi-weekly sprint retrospectives for the product and engineering teams so that actionable takeaways are consistently captured and team collaboration metrics measurably improve.",
      goalType: "development" as const,
      keyResults: [
        {
          description: "Retrospectives facilitated with high satisfaction",
          metric: "6 retrospectives completed with 85%+ team satisfaction rating",
          deadline: daysFromNow(75),
          status: "in_progress" as const,
        },
        {
          description: "Action item follow-through rate",
          metric: "80% of agreed action items completed by next retro",
          deadline: daysFromNow(75),
          status: "not_started" as const,
        },
        {
          description: "Facilitation skill self-assessment",
          metric: "Complete facilitation training course and apply 3 new techniques",
          deadline: daysFromNow(45),
          status: "not_started" as const,
        },
      ],
      timePeriod: { start: daysAgo(14), end: daysFromNow(75) },
      checkInCadence: "every_check_in" as const,
      status: "pending_confirmation" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(3) },
      managerConfirmed: { confirmed: false, at: null },
      owner: reports[1]._id,
      manager: manager._id,
      locked: false,
    },
    // Goal 3 — development, needs_attention (reports[2])
    {
      objectiveStatement:
        "Pass the AWS Solutions Architect Associate exam within the current quarter to build critical cloud infrastructure skills needed for the upcoming platform re-architecture project and strengthen the team's cloud-native capability.",
      goalType: "development" as const,
      keyResults: [
        {
          description: "Exam passed on first attempt",
          metric: "Pass AWS Solutions Architect Associate exam with score above 750",
          deadline: daysFromNow(15),
          status: "in_progress" as const,
        },
        {
          description: "Practice exam readiness",
          metric: "Score 80%+ on 3 consecutive practice exams before test date",
          deadline: daysFromNow(10),
          status: "in_progress" as const,
        },
      ],
      timePeriod: { start: daysAgo(45), end: daysFromNow(15) },
      checkInCadence: "every_check_in" as const,
      supportAgreement:
        "2 hours of focused study time blocked daily, exam fee covered by L&D budget",
      status: "needs_attention" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(44) },
      managerConfirmed: { confirmed: true, at: daysAgo(43) },
      owner: reports[2]._id,
      manager: manager._id,
      locked: true,
    },
    // Goal 4 — performance, active (reports[3])
    {
      objectiveStatement:
        "Achieve 95% code review turnaround within 4 business hours by building a responsive review habit so that teammates are unblocked faster and sprint velocity is no longer limited by review bottlenecks.",
      goalType: "performance" as const,
      keyResults: [
        {
          description: "Review turnaround rate at target",
          metric: "95% of assigned PRs receive initial response within 4 business hours",
          deadline: daysFromNow(30),
          status: "in_progress" as const,
        },
        {
          description: "Reduction in review-blocked PRs",
          metric: "Zero PRs waiting more than 8 hours for first review in a sprint",
          deadline: daysFromNow(30),
          status: "not_started" as const,
        },
        {
          description: "Team velocity improvement",
          metric: "Sprint velocity increases by at least 10% over baseline",
          deadline: daysFromNow(30),
          status: "not_started" as const,
        },
      ],
      timePeriod: { start: daysAgo(60), end: daysFromNow(30) },
      checkInCadence: "monthly" as const,
      status: "active" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(58) },
      managerConfirmed: { confirmed: true, at: daysAgo(57) },
      owner: reports[3]._id,
      manager: manager._id,
      locked: true,
    },
    // Goal 5 — performance, completed (reports[4])
    {
      objectiveStatement:
        "Deliver Q4 customer onboarding automation that reduces manual setup steps from 12 to 3 and goes live in production with less than 2% error rate so that the Customer Success team can onboard clients at scale without engineering involvement.",
      goalType: "performance" as const,
      keyResults: [
        {
          description: "Automation live in production",
          metric: "Onboarding automation deployed with <2% error rate",
          deadline: daysAgo(10),
          status: "achieved" as const,
        },
        {
          description: "Manual setup step reduction",
          metric: "Setup steps reduced from 12 to 3 or fewer",
          deadline: daysAgo(10),
          status: "achieved" as const,
        },
        {
          description: "Customer Success team sign-off",
          metric: "CS team confirms zero escalations through first 20 automated onboardings",
          deadline: daysAgo(5),
          status: "achieved" as const,
        },
      ],
      timePeriod: { start: daysAgo(90), end: daysAgo(10) },
      checkInCadence: "quarterly" as const,
      status: "completed" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(88) },
      managerConfirmed: { confirmed: true, at: daysAgo(87) },
      owner: reports[4]._id,
      manager: manager._id,
      locked: true,
    },
    // Goal 6 — performance, active — Sarah Chen (HR persona)
    {
      objectiveStatement:
        "Design and roll out a standardized company-wide performance review process so that all departments complete Q2 reviews on schedule and every manager is equipped to deliver high-quality, consistent feedback.",
      goalType: "performance" as const,
      keyResults: [
        {
          description: "Review templates finalized and distributed",
          metric: "Templates approved by leadership and distributed to all managers",
          deadline: daysFromNow(20),
          status: "achieved" as const,
        },
        {
          description: "Manager training completion rate",
          metric: "90%+ of managers complete feedback delivery training",
          deadline: daysFromNow(40),
          status: "in_progress" as const,
        },
        {
          description: "On-time review completion",
          metric: "100% of departments complete Q2 reviews by deadline",
          deadline: daysFromNow(70),
          status: "not_started" as const,
        },
      ],
      timePeriod: { start: daysAgo(20), end: daysFromNow(70) },
      checkInCadence: "monthly" as const,
      supportAgreement:
        "L&D team to co-facilitate manager training sessions, HRIS admin access for completion tracking",
      status: "active" as const,
      employeeConfirmed: { confirmed: true, at: daysAgo(18) },
      managerConfirmed: { confirmed: true, at: daysAgo(18) },
      owner: sarahChen._id,
      manager: sarahChen._id, // self-managed (HR leadership)
      locked: true,
    },
    // Goal 7 — performance, draft — Jason Lee (Manager persona)
    {
      objectiveStatement:
        "Hire 3 senior engineers and 1 staff engineer by end of Q3 to staff the upcoming platform re-architecture initiative so that the team has the capacity and expertise to execute on schedule without burning out existing engineers.",
      goalType: "performance" as const,
      keyResults: [
        {
          description: "Job descriptions published",
          metric: "All 4 roles posted on job boards with finalized JDs",
          deadline: daysFromNow(14),
          status: "not_started" as const,
        },
        {
          description: "Interview loops completed",
          metric: "At least 8 qualified candidates reach final-round interviews",
          deadline: daysFromNow(60),
          status: "not_started" as const,
        },
        {
          description: "New hires onboarded and productive",
          metric: "4 new hires onboarded and contributing within first 30 days",
          deadline: daysFromNow(90),
          status: "not_started" as const,
        },
      ],
      timePeriod: { start: daysAgo(10), end: daysFromNow(90) },
      checkInCadence: "monthly" as const,
      status: "draft" as const,
      employeeConfirmed: { confirmed: false, at: null },
      managerConfirmed: { confirmed: false, at: null },
      owner: jasonLee._id,
      manager: jasonLee._id, // self-managed (engineering leadership)
      locked: false,
    },
  ];

  const goals = await Goal.insertMany(goalDefs);
  console.log(`Created ${goals.length} goals:`);
  goals.forEach((g) => {
    console.log(`  - [${g.status}] ${g.objectiveStatement.slice(0, 70)}...`);
  });
  console.log();

  // ------------------------------------------------------------------
  // 4. Create 4 CheckIns
  // ------------------------------------------------------------------

  const checkInDefs = [
    // Completed check-in 1 (for the on_track productivity goal)
    {
      goals: [goals[0]._id],
      employee: reports[0]._id,
      manager: manager._id,
      dueDate: daysAgo(7),
      completedAt: daysAgo(6),
      status: "completed" as const,
      managerProgressObserved:
        "Resolution time has dropped from 4.2 to 3.8 hours. Good progress on the auto-categorization feature — it's handling about 40% of incoming tickets already.",
      managerCoachingNeeded:
        "Consider pairing with the data team to improve the categorization model accuracy. Some mis-routes are adding to resolution time.",
      managerRecognition:
        "Great initiative in documenting the triage workflow changes. The team wiki updates have been really helpful for new hires.",
      employeeProgress:
        "Auto-categorization is live and handling simple tickets well. Working on expanding coverage to medium-complexity issues next.",
      employeeObstacles:
        "The legacy ticketing API has rate limits that slow down batch processing. Need to discuss a caching strategy.",
      employeeSupportNeeded:
        "Would benefit from a 30-minute session with the data team to review model accuracy metrics.",
    },
    // Completed check-in 2 (for the leadership/collaboration goal)
    {
      goals: [goals[1]._id],
      employee: reports[1]._id,
      manager: manager._id,
      dueDate: daysAgo(14),
      completedAt: daysAgo(13),
      status: "completed" as const,
      managerProgressObserved:
        "Led 2 retrospectives so far. The team feedback has been positive — 88% satisfaction on the last one. Good use of the Start/Stop/Continue format.",
      managerCoachingNeeded:
        "Try to draw out quieter team members more actively. Consider using anonymous input tools before the session to get broader participation.",
      managerRecognition:
        "The action items from the last retro actually got completed, which is a big improvement from previous quarters. Nice follow-through.",
      employeeProgress:
        "Completed 2 of 6 retrospectives. Created a shared template and feedback form that the team seems to like.",
      employeeObstacles:
        "Scheduling is tough with the team spread across 3 time zones. May need to alternate meeting times.",
      employeeSupportNeeded: null,
    },
    // Scheduled (future) check-in for the needs_attention goal
    {
      goals: [goals[2]._id],
      employee: reports[2]._id,
      manager: manager._id,
      dueDate: daysFromNow(7),
      completedAt: null,
      status: "scheduled" as const,
      managerProgressObserved: null,
      managerCoachingNeeded: null,
      managerRecognition: null,
      employeeProgress: null,
      employeeObstacles: null,
      employeeSupportNeeded: null,
    },
    // Overdue check-in (scheduled but past due) for the off_track goal
    {
      goals: [goals[3]._id],
      employee: reports[3]._id,
      manager: manager._id,
      dueDate: daysAgo(5),
      completedAt: null,
      status: "scheduled" as const,
      managerProgressObserved: null,
      managerCoachingNeeded: null,
      managerRecognition: null,
      employeeProgress: null,
      employeeObstacles: null,
      employeeSupportNeeded: null,
    },
  ];

  const checkIns = await CheckIn.insertMany(checkInDefs);
  console.log(`Created ${checkIns.length} check-ins:`);
  checkIns.forEach((c) => {
    const overdue =
      c.status === "scheduled" && new Date(c.dueDate) < new Date()
        ? " (OVERDUE)"
        : "";
    console.log(`  - [${c.status}${overdue}] due ${c.dueDate.toLocaleDateString()}`);
  });
  console.log();

  // ------------------------------------------------------------------
  // 5. Create 3 Performance Notes
  // ------------------------------------------------------------------

  const noteDefs = [
    // Observation — tied to the off_track goal
    {
      employee: reports[3]._id,
      author: manager._id,
      type: "observation" as const,
      observation:
        "Noticed that code reviews are consistently sitting for 12+ hours before any response. This pattern has been ongoing for the past 3 sprints. Other team members have started routing reviews to different reviewers to avoid the bottleneck.",
      expectation:
        "Reviews should receive at least an initial response within 4 business hours. If workload is too high, flag it in standup so we can redistribute.",
      relatedGoal: goals[3]._id,
    },
    // Coaching — tied to the needs_attention certification goal
    {
      employee: reports[2]._id,
      author: manager._id,
      type: "coaching" as const,
      observation:
        "During our 1:1, discussed study progress for the AWS certification. Has completed 60% of the course material but hasn't started practice exams yet. Exam deadline is in 2 weeks. We agreed to block 2 hours daily for focused study and practice tests.",
      expectation:
        "Complete at least 3 full practice exams before the scheduled test date. Score 80%+ on practice exams before attempting the real exam.",
      relatedGoal: goals[2]._id,
    },
    // Recognition — for the completed goal
    {
      employee: reports[4]._id,
      author: manager._id,
      type: "recognition" as const,
      observation:
        "The onboarding automation project was delivered a week ahead of schedule and has already reduced manual setup time by 75%. Customer Success reported zero escalations from new customers who went through the automated flow. Excellent cross-team collaboration with the CS and DevOps teams throughout.",
      expectation: null,
      relatedGoal: goals[4]._id,
    },
  ];

  const perfNotes = await PerformanceNote.insertMany(noteDefs);
  console.log(`Created ${perfNotes.length} performance notes:`);
  perfNotes.forEach((n) => {
    console.log(`  - [${n.type}] ${n.observation.slice(0, 80)}...`);
  });
  console.log();

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------

  console.log("=== Seed Summary ===");
  console.log(`  Goals:             ${goals.length}`);
  console.log(`  Check-ins:         ${checkIns.length}`);
  console.log(`  Performance Notes: ${perfNotes.length}`);
  console.log("\nGrow module seed complete!");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

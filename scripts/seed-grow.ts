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
  // 1. Find existing employees (need at least 6: 1 manager + 5 reports)
  // ------------------------------------------------------------------

  const employees = await Employee.find({ status: "active" }).limit(6).lean();
  if (employees.length < 6) {
    console.error(
      `Need at least 6 employees. Found ${employees.length}. Run \`pnpm db:seed\` first.`
    );
    process.exit(1);
  }

  // First employee acts as the common manager
  const manager = employees[0];
  const reports = employees.slice(1, 6);

  console.log(`Manager: ${manager.firstName} ${manager.lastName} (${manager._id})`);
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
  // 3. Create 5 Goals
  // ------------------------------------------------------------------

  const goalDefs = [
    {
      title: "Reduce average ticket resolution time by 20%",
      description:
        "Improve customer support efficiency by streamlining the triage process and implementing auto-categorization. Target is to bring average resolution time from 4.2 hours to under 3.4 hours by end of quarter.",
      category: "productivity" as const,
      measurementType: "numeric_metric" as const,
      successMetric: "Average resolution time under 3.4 hours for 30 consecutive days",
      timePeriod: { start: daysAgo(30), end: daysFromNow(60) },
      checkInCadence: "monthly" as const,
      alignment: "priority" as const,
      status: "on_track" as const,
      owner: reports[0]._id,
      manager: manager._id,
      managerApproved: true,
      locked: true,
    },
    {
      title: "Lead cross-functional sprint retrospectives",
      description:
        "Take ownership of facilitating bi-weekly sprint retrospectives for the product and engineering teams. Build facilitation skills, drive actionable takeaways, and improve team collaboration metrics.",
      category: "collaboration" as const,
      measurementType: "behavior_change" as const,
      successMetric:
        "Facilitate 6 retrospectives with 85%+ team satisfaction rating",
      timePeriod: { start: daysAgo(14), end: daysFromNow(75) },
      checkInCadence: "monthly" as const,
      alignment: "value" as const,
      status: "on_track" as const,
      owner: reports[1]._id,
      manager: manager._id,
      managerApproved: true,
      locked: true,
    },
    {
      title: "Complete AWS Solutions Architect certification",
      description:
        "Prepare for and pass the AWS Solutions Architect Associate exam. This supports the team's migration to cloud-native infrastructure and builds critical skills for the upcoming platform re-architecture project.",
      category: "certification" as const,
      measurementType: "milestone_completion" as const,
      successMetric: "Pass AWS Solutions Architect Associate exam",
      timePeriod: { start: daysAgo(45), end: daysFromNow(15) },
      checkInCadence: "monthly" as const,
      alignment: "priority" as const,
      status: "needs_attention" as const,
      owner: reports[2]._id,
      manager: manager._id,
      managerApproved: true,
      locked: true,
    },
    {
      title: "Achieve 95% code review turnaround within 4 hours",
      description:
        "Improve code review responsiveness to unblock teammates faster. Currently averaging 11-hour turnaround. This goal addresses repeated team feedback about review bottlenecks slowing sprint velocity.",
      category: "quality" as const,
      measurementType: "percentage_target" as const,
      successMetric:
        "95% of assigned PRs reviewed within 4 hours during business hours",
      timePeriod: { start: daysAgo(60), end: daysFromNow(30) },
      checkInCadence: "monthly" as const,
      alignment: "mission" as const,
      status: "off_track" as const,
      owner: reports[3]._id,
      manager: manager._id,
      managerApproved: true,
      locked: true,
    },
    {
      title: "Deliver Q4 customer onboarding automation",
      description:
        "Design and ship an automated onboarding flow that reduces manual setup steps from 12 to 3. Completed ahead of schedule with positive feedback from the Customer Success team.",
      category: "efficiency" as const,
      measurementType: "milestone_completion" as const,
      successMetric: "Onboarding automation live in production with <2% error rate",
      timePeriod: { start: daysAgo(90), end: daysAgo(10) },
      checkInCadence: "quarterly" as const,
      alignment: "mission" as const,
      status: "completed" as const,
      owner: reports[4]._id,
      manager: manager._id,
      managerApproved: true,
      locked: true,
    },
  ];

  const goals = await Goal.insertMany(goalDefs);
  console.log(`Created ${goals.length} goals:`);
  goals.forEach((g) => {
    console.log(`  - [${g.status}] ${g.title}`);
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

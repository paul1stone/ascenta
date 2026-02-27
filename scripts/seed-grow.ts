/**
 * Seed script: Populates Grow module test data (Goals, CheckIns, PerformanceNotes)
 * Requires existing employees from `pnpm db:seed`.
 *
 * Run from repo root:
 *   npx tsx scripts/seed-grow.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import { connectDB } from "../packages/db/src/index";
import { Goal } from "../packages/db/src/goal-schema";
import { CheckIn } from "../packages/db/src/checkin-schema";
import { PerformanceNote } from "../packages/db/src/performance-note-schema";
import { Employee } from "../packages/db/src/employee-schema";

// ============================================================================
// HELPERS
// ============================================================================

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d;
}

function monthsFromNow(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setHours(9, 0, 0, 0);
  return d;
}

// ============================================================================
// MAIN
// ============================================================================

(async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB.\n");

    // ------------------------------------------------------------------
    // Find existing employees (seeded by `pnpm db:seed`)
    // ------------------------------------------------------------------
    const employees = await Employee.find({ status: "active" })
      .limit(5)
      .lean();

    if (employees.length < 3) {
      console.error(
        "Not enough employees found. Run `pnpm db:seed` first to populate employees."
      );
      process.exit(1);
    }

    const emp = employees.map((e) => ({
      id: String(e._id),
      name: `${e.firstName} ${e.lastName}`,
      department: e.department,
      jobTitle: e.jobTitle,
    }));

    console.log(
      `Found ${emp.length} employees:`,
      emp.map((e) => `${e.name} (${e.department})`).join(", ")
    );

    // ------------------------------------------------------------------
    // Clear existing Grow data
    // ------------------------------------------------------------------
    console.log("\n⚠  Clearing existing Grow data (Goals, CheckIns, PerformanceNotes)...");
    const [goalsDel, checkInsDel, notesDel] = await Promise.all([
      Goal.deleteMany({}),
      CheckIn.deleteMany({}),
      PerformanceNote.deleteMany({}),
    ]);
    console.log(
      `   Deleted: ${goalsDel.deletedCount} goals, ${checkInsDel.deletedCount} check-ins, ${notesDel.deletedCount} performance notes.\n`
    );

    // ------------------------------------------------------------------
    // Seed Goals (5 total)
    // ------------------------------------------------------------------
    const goalsData = [
      {
        statement:
          "Reduce average ticket resolution time from 48 hours to 24 hours by end of Q2",
        measure:
          "Average resolution time tracked in support dashboard drops below 24 hours for 4 consecutive weeks",
        type: "individual" as const,
        owner: emp[0].id,
        timeperiod: {
          start: monthsFromNow(-2),
          end: monthsFromNow(4),
        },
        status: "active" as const,
        createdBy: emp[0].id,
        visibility: "manager" as const,
        dependencies: [],
      },
      {
        statement:
          "Complete AWS Solutions Architect certification to support cloud migration initiative",
        measure:
          "Pass AWS SAA-C03 exam and present learnings to the engineering team",
        type: "individual" as const,
        owner: emp[1].id,
        timeperiod: {
          start: monthsFromNow(-1),
          end: monthsFromNow(5),
        },
        status: "active" as const,
        createdBy: emp[1].id,
        visibility: "manager" as const,
        dependencies: [],
      },
      {
        statement:
          "Develop a cross-training program for the customer success team",
        measure:
          "Written program outline approved by leadership with at least 3 modules drafted",
        type: "team" as const,
        owner: emp[2].id,
        timeperiod: {
          start: monthsFromNow(0),
          end: monthsFromNow(6),
        },
        status: "draft" as const,
        createdBy: emp[2].id,
        visibility: "hr" as const,
        dependencies: [],
      },
      {
        statement:
          "Improve quarterly sales pipeline accuracy to within 10% of actual closed revenue",
        measure:
          "Forecasted vs actual revenue variance is <=10% for Q4 pipeline report",
        type: "role" as const,
        owner: emp[3 % emp.length].id,
        timeperiod: {
          start: monthsFromNow(-3),
          end: monthsFromNow(3),
        },
        status: "completed" as const,
        createdBy: emp[3 % emp.length].id,
        visibility: "employee" as const,
        dependencies: [],
      },
      {
        statement:
          "Implement standardized onboarding checklist reducing new-hire ramp-up time by 20%",
        measure:
          "New hires reach full productivity benchmark 20% faster compared to previous cohort average",
        type: "team" as const,
        owner: emp[4 % emp.length].id,
        timeperiod: {
          start: monthsFromNow(-1),
          end: monthsFromNow(5),
        },
        status: "locked" as const,
        createdBy: emp[4 % emp.length].id,
        visibility: "manager" as const,
        dependencies: [],
      },
    ];

    const createdGoals = await Goal.insertMany(goalsData);
    console.log(`Created ${createdGoals.length} goals:`);
    createdGoals.forEach((g, i) => {
      const ownerName = emp.find((e) => e.id === goalsData[i].owner)?.name;
      console.log(
        `   [${g.status}] "${g.statement.slice(0, 60)}..." — ${ownerName}`
      );
    });

    // ------------------------------------------------------------------
    // Seed CheckIns (4 total)
    // ------------------------------------------------------------------
    const activeGoals = createdGoals.filter(
      (g) => g.status === "active" || g.status === "completed"
    );

    const checkInsData = [
      {
        // Overdue scheduled check-in (5 days ago)
        goal: activeGoals[0]._id,
        employee: activeGoals[0].owner,
        scheduledDate: daysFromNow(-5),
        cadence: "biweekly" as const,
        status: "scheduled" as const,
      },
      {
        // Upcoming scheduled check-in (7 days from now)
        goal: activeGoals[0]._id,
        employee: activeGoals[0].owner,
        scheduledDate: daysFromNow(7),
        cadence: "biweekly" as const,
        status: "scheduled" as const,
      },
      {
        // Completed check-in (2 days ago)
        goal: activeGoals[1]._id,
        employee: activeGoals[1].owner,
        scheduledDate: daysFromNow(-9),
        completedDate: daysFromNow(-2),
        cadence: "monthly" as const,
        progress:
          "Completed 4 of 6 AWS practice exams. Scoring above 80% consistently. On track to sit the exam next month.",
        blockers:
          "Need access to the AWS sandbox account for hands-on labs; IT ticket pending.",
        supportNeeded:
          "Would benefit from 2 hours of dedicated study time per week blocked on the calendar.",
        rating: "on_track" as const,
        status: "completed" as const,
      },
      {
        // Missed check-in
        goal: activeGoals[0]._id,
        employee: activeGoals[0].owner,
        scheduledDate: daysFromNow(-19),
        cadence: "biweekly" as const,
        status: "missed" as const,
      },
    ];

    const createdCheckIns = await CheckIn.insertMany(checkInsData);
    console.log(`\nCreated ${createdCheckIns.length} check-ins:`);
    createdCheckIns.forEach((c) => {
      const label =
        c.status === "scheduled" && c.scheduledDate < new Date()
          ? "overdue"
          : c.status;
      console.log(
        `   [${label}] scheduled ${c.scheduledDate.toLocaleDateString()} — goal: ${String(c.goal).slice(-6)}`
      );
    });

    // ------------------------------------------------------------------
    // Seed PerformanceNotes (4 total)
    // ------------------------------------------------------------------
    const performanceNotesData = [
      {
        employee: emp[0].id,
        author: emp[2 % emp.length].id,
        type: "observation" as const,
        content:
          "Noticed a significant improvement in how the employee handles escalated customer complaints. They remained calm and de-escalated a difficult situation with a major client during the Tuesday standup demo. The client explicitly thanked them afterward.",
        context: "Weekly team standup and live client demo session",
        relatedGoal: createdGoals[0]._id,
        visibility: "manager_only" as const,
      },
      {
        employee: emp[1].id,
        author: emp[0].id,
        type: "feedback" as const,
        content:
          "Peer feedback: Documentation quality on the last three pull requests has been exceptional. Clear descriptions, edge cases covered, and helpful inline comments. This directly supports the team knowledge-sharing initiative.",
        context: "Q1 peer review cycle",
        visibility: "shared_with_employee" as const,
      },
      {
        employee: emp[2 % emp.length].id,
        author: emp[3 % emp.length].id,
        type: "coaching" as const,
        content:
          "Discussed strategies for delegating more effectively. Agreed to start by identifying two recurring tasks that can be handed off to junior team members this sprint. Follow-up in two weeks to review progress and adjust.",
        context: "One-on-one coaching session",
        relatedGoal: createdGoals[2]._id,
        visibility: "manager_only" as const,
      },
      {
        employee: emp[3 % emp.length].id,
        author: emp[4 % emp.length].id,
        type: "recognition" as const,
        content:
          "Outstanding work leading the Q4 pipeline review. Forecast accuracy came in at 8% variance, well within the 10% target. This was the most accurate quarterly forecast in the past two years. Recommending for a spot bonus.",
        context: "Q4 pipeline review meeting",
        relatedGoal: createdGoals[3]._id,
        visibility: "shared_with_employee" as const,
      },
    ];

    const createdNotes = await PerformanceNote.insertMany(performanceNotesData);
    console.log(`\nCreated ${createdNotes.length} performance notes:`);
    createdNotes.forEach((n) => {
      const empName = emp.find((e) => e.id === String(n.employee))?.name;
      console.log(
        `   [${n.type}] for ${empName} — "${n.content.slice(0, 50)}..."`
      );
    });

    // ------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------
    console.log("\n--- Grow Seed Summary ---");
    console.log(`  Goals:            ${createdGoals.length}`);
    console.log(`  Check-ins:        ${createdCheckIns.length}`);
    console.log(`  Performance notes: ${createdNotes.length}`);
    console.log("Seed complete!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();

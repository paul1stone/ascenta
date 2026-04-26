/**
 * Seed script: Populates employees with embedded notes using Mongoose
 * Run: npx tsx scripts/seed-employees.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";
// Load .env.local from monorepo root
dotenv.config({ path: resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: resolve(__dirname, "../../../.env") });
import mongoose from "mongoose";
import { Employee } from "../src/employee-schema";

const FIRST_NAMES = [
  "John", "Sarah", "Michael", "Emily", "David", "Jessica", "James", "Ashley",
  "Robert", "Amanda", "William", "Jennifer", "Daniel", "Elizabeth", "Matthew",
  "Lauren", "Christopher", "Megan", "Andrew", "Rachel", "Joshua", "Stephanie",
  "Ryan", "Nicole", "Brandon", "Samantha", "Justin", "Katherine", "Kevin",
  "Christina", "Jason", "Heather", "Brian", "Rebecca", "Eric", "Michelle",
  "Adam", "Kimberly", "Nathan", "Laura", "Jacob", "Amy", "Aaron", "Angela",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
];

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales", "Customer Success",
  "Finance", "HR", "Operations", "Legal", "Support",
];

const JOB_TITLES: Record<string, string[]> = {
  Engineering: ["Software Engineer", "Senior Engineer", "Staff Engineer", "Engineering Manager", "Tech Lead"],
  Product: ["Product Manager", "Senior PM", "Director of Product", "Product Analyst"],
  Design: ["UX Designer", "UI Designer", "Design Lead", "Product Designer"],
  Marketing: ["Marketing Manager", "Content Strategist", "Brand Manager", "Growth Lead"],
  Sales: ["Account Executive", "Sales Rep", "Sales Manager", "SDR"],
  "Customer Success": ["CSM", "Account Manager", "Support Lead"],
  Finance: ["Accountant", "Financial Analyst", "Controller"],
  HR: ["HR Coordinator", "HR Manager", "Recruiter"],
  Operations: ["Operations Manager", "Operations Analyst"],
  Legal: ["Legal Counsel", "Paralegal"],
  Support: ["Support Specialist", "Support Lead"],
};

const NOTE_TYPES = ["written_warning", "verbal_warning", "late_notice", "pip", "commendation", "general"] as const;
const NOTE_TITLES: Record<string, string[]> = {
  written_warning: ["Written Warning - Attendance", "Written Warning - Performance", "Written Warning - Conduct"],
  verbal_warning: ["Verbal Warning - Tardiness", "Verbal Warning - Policy Violation"],
  late_notice: ["Late Arrival Notice", "Multiple Late Arrivals", "Tardiness Documentation"],
  pip: ["Performance Improvement Plan", "PIP - 60 Day", "PIP - 90 Day"],
  commendation: ["Employee of the Month", "Spot Bonus", "Exceeds Expectations"],
  general: ["One-on-One Notes", "Annual Review", "Promotion Consideration"],
};

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinYears(years: number): Date {
  const now = new Date();
  const past = new Date(now);
  past.setFullYear(past.getFullYear() - years);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB. Seeding employees...");

  // Clear existing
  await Employee.deleteMany({});

  // ── Deterministic seed personas (for role emulation) ──────────────
  const seedPersonas = [
    {
      employeeId: "EMP0001",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@company.com",
      department: "HR",
      jobTitle: "HR Manager",
      managerName: "Executive Team",
      hireDate: new Date("2020-03-15"),
      status: "active" as const,
      notes: [],
    },
    {
      employeeId: "EMP0002",
      firstName: "Jason",
      lastName: "Lee",
      email: "jason.lee@company.com",
      department: "Engineering",
      jobTitle: "Engineering Manager",
      managerName: "Sarah Chen",
      hireDate: new Date("2021-06-01"),
      status: "active" as const,
      notes: [],
    },
    {
      employeeId: "EMP0003",
      firstName: "Alex",
      lastName: "Rivera",
      email: "alex.rivera@company.com",
      department: "Engineering",
      jobTitle: "Software Engineer",
      managerName: "Jason Lee",
      hireDate: new Date("2022-09-12"),
      status: "active" as const,
      notes: [],
    },
  ];

  await Employee.insertMany(seedPersonas);
  console.log(`  ✓ Inserted ${seedPersonas.length} seed personas`);

  const seedNames = new Set(seedPersonas.map((p) => `${p.firstName} ${p.lastName}`));

  const employeeCount = 80;
  const employeeDocs = [];

  for (let i = 0; i < employeeCount; i++) {
    const firstName = random(FIRST_NAMES);
    const lastName = random(LAST_NAMES);

    if (seedNames.has(`${firstName} ${lastName}`)) {
      i--;
      continue;
    }
    const department = random(DEPARTMENTS);
    const jobTitle = random(JOB_TITLES[department]);
    // managerName is finalized in a second pass below so every employee
    // points to a real person in the dataset (otherwise the org chart
    // shows everyone as a root).
    const managerName = "PENDING";
    const empId = `EMP${1000 + i}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@company.com`.replace(/\s/g, "");

    // Build embedded notes for ~60% of employees
    const notes: Record<string, unknown>[] = [];
    if (Math.random() < 0.6) {
      const numNotes = Math.floor(Math.random() * 3) + 1;
      const usedTypes = new Set<string>();

      for (let n = 0; n < numNotes; n++) {
        const noteType = random([...NOTE_TYPES]);
        if (usedTypes.has(noteType) && usedTypes.size < NOTE_TYPES.length) continue;
        usedTypes.add(noteType);

        const titles = NOTE_TITLES[noteType];
        const title = titles[Math.floor(Math.random() * titles.length)];
        const severity = noteType.includes("warning") || noteType === "pip" ? random(["low", "medium", "high"]) : undefined;

        notes.push({
          noteType,
          title,
          content: `Documentation from ${randomDateWithinYears(2).toLocaleDateString()}. Details on file.`,
          severity,
          occurredAt: randomDateWithinYears(1),
          createdAt: new Date(),
        });
      }
    }

    employeeDocs.push({
      employeeId: empId,
      firstName,
      lastName,
      email,
      department,
      jobTitle,
      managerName,
      hireDate: randomDateWithinYears(5),
      status: "active",
      notes,
    });
  }

  const created = await Employee.insertMany(employeeDocs);
  const withNotes = created.filter((e) => e.notes && e.notes.length > 0);

  // ── Wire up reporting structure ─────────────────────────────────────
  // Sarah Chen is root; one bulk employee per department becomes that
  // department's head and reports to Sarah Chen (Engineering already has
  // Jason Lee). Everyone else reports to their department head.
  const byDept = new Map<string, typeof created>();
  for (const emp of created) {
    if (!byDept.has(emp.department)) byDept.set(emp.department, []);
    byDept.get(emp.department)!.push(emp);
  }

  const titleRank = (t: string) =>
    /Director/i.test(t) ? 0
    : /Manager/i.test(t) ? 1
    : /Lead/i.test(t) ? 2
    : /Senior|Staff/i.test(t) ? 3
    : 4;

  const deptHeadByDept = new Map<string, string>();
  deptHeadByDept.set("Engineering", "Jason Lee");
  deptHeadByDept.set("HR", "Sarah Chen");

  for (const [dept, emps] of byDept) {
    if (deptHeadByDept.has(dept)) continue;
    const head = [...emps].sort(
      (a, b) => titleRank(a.jobTitle) - titleRank(b.jobTitle),
    )[0];
    deptHeadByDept.set(dept, `${head.firstName} ${head.lastName}`);
  }

  for (const [dept, emps] of byDept) {
    const headName = deptHeadByDept.get(dept)!;
    for (const emp of emps) {
      const empName = `${emp.firstName} ${emp.lastName}`;
      const target = empName === headName ? "Sarah Chen" : headName;
      if (emp.managerName !== target) {
        emp.managerName = target;
        await emp.save();
      }
    }
  }

  console.log(`Created ${created.length} employees.`);
  console.log(`${withNotes.length} employees have notes.`);
  console.log(
    `Department heads: ${[...deptHeadByDept.entries()]
      .map(([d, n]) => `${d}=${n}`)
      .join(", ")}`,
  );
  console.log("Seed complete!");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

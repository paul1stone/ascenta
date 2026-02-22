/**
 * Seed script: Populates employees and employee_notes with fake data
 * Run: npx tsx scripts/seed-employees.ts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { employees, employeeNotes } from "../src/employee-schema";

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
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding employees...");

  // Clear existing
  await db.delete(employeeNotes);
  await db.delete(employees);

  const employeeCount = 80;
  const createdEmployees: { id: string; employeeId: string; firstName: string; lastName: string; department: string }[] = [];

  for (let i = 0; i < employeeCount; i++) {
    const firstName = random(FIRST_NAMES);
    const lastName = random(LAST_NAMES);
    const department = random(DEPARTMENTS);
    const jobTitle = random(JOB_TITLES[department]);
    const managerName = `${random(FIRST_NAMES)} ${random(LAST_NAMES)}`;
    const empId = `EMP${1000 + i}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@company.com`.replace(/\s/g, "");

    const [emp] = await db.insert(employees).values({
      employeeId: empId,
      firstName,
      lastName,
      email,
      department,
      jobTitle,
      managerName,
      hireDate: randomDateWithinYears(5),
      status: "active",
    }).returning({ id: employees.id, employeeId: employees.employeeId, firstName: employees.firstName, lastName: employees.lastName, department: employees.department });

    if (emp) {
      createdEmployees.push(emp);
    }
  }

  console.log(`Created ${createdEmployees.length} employees. Adding notes...`);

  // Add notes to ~60% of employees - varied mix
  const employeesWithNotes = [...createdEmployees].sort(() => Math.random() - 0.5).slice(0, Math.floor(createdEmployees.length * 0.6));

  for (const emp of employeesWithNotes) {
    const numNotes = Math.floor(Math.random() * 3) + 1;
    const usedTypes = new Set<string>();

    for (let n = 0; n < numNotes; n++) {
      const noteType = random([...NOTE_TYPES]);
      if (usedTypes.has(noteType) && usedTypes.size < NOTE_TYPES.length) continue;
      usedTypes.add(noteType);

      const titles = NOTE_TITLES[noteType];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const severity = noteType.includes("warning") || noteType === "pip" ? random(["low", "medium", "high"]) : undefined;

      await db.insert(employeeNotes).values({
        employeeId: emp.id,
        noteType,
        title,
        content: `Documentation from ${randomDateWithinYears(2).toLocaleDateString()}. Details on file.`,
        severity,
        occurredAt: randomDateWithinYears(1),
      });
    }
  }

  console.log(`Added notes to ${employeesWithNotes.length} employees.`);
  console.log("Seed complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

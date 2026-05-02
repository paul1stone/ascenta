/**
 * Seed script: Ensures the 3 MVP demo personas exist in the employees
 * collection with correct fields and reporting structure.
 *
 * Idempotent: finds existing employees by name (case-insensitive) and
 * updates them in place, preserving _id / employeeId / email / notes /
 * profile. Inserts new records only when no match is found.
 *
 * Run: pnpm db:seed-personas
 */

import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: resolve(__dirname, "../../../.env") });

import mongoose from "mongoose";
import { Employee } from "../src/employee-schema";

type DemoPersona = "employee" | "manager" | "hr";

type PersonaSeed = {
  demoPersona: DemoPersona;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  managerName: string;
  fallbackEmployeeId: string;
  fallbackEmail: string;
  fallbackHireDate: Date;
};

const PERSONAS: PersonaSeed[] = [
  {
    demoPersona: "hr",
    firstName: "Jason",
    lastName: "Lee",
    department: "HR",
    jobTitle: "Director of People Operations",
    managerName: "Executive Team",
    fallbackEmployeeId: "EMP-DEMO-HR",
    fallbackEmail: "jason.lee@company.com",
    fallbackHireDate: new Date("2020-01-15"),
  },
  {
    demoPersona: "manager",
    firstName: "Katie",
    lastName: "Smith",
    department: "Customer Success",
    jobTitle: "Customer Success Manager",
    managerName: "Jason Lee",
    fallbackEmployeeId: "EMP-DEMO-MGR",
    fallbackEmail: "katie.smith@company.com",
    fallbackHireDate: new Date("2021-08-22"),
  },
  {
    demoPersona: "employee",
    firstName: "Brandon",
    lastName: "White",
    department: "Customer Success",
    jobTitle: "Customer Success Specialist",
    managerName: "Katie Smith",
    fallbackEmployeeId: "EMP-DEMO-EMP",
    fallbackEmail: "brandon.white@company.com",
    fallbackHireDate: new Date("2023-04-10"),
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB. Seeding demo personas...\n");

  const personaIds: mongoose.Types.ObjectId[] = [];

  for (const p of PERSONAS) {
    const existing = await Employee.findOne({
      firstName: { $regex: new RegExp(`^${p.firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${p.lastName}$`, "i") },
    });

    if (existing) {
      existing.department = p.department;
      existing.jobTitle = p.jobTitle;
      existing.managerName = p.managerName;
      existing.demoPersona = p.demoPersona;
      existing.status = "active";
      await existing.save();
      personaIds.push(existing._id);
      console.log(
        `  ✓ Updated ${p.firstName} ${p.lastName} (${p.demoPersona}) — id=${existing._id.toString()}`
      );
    } else {
      const created = await Employee.create({
        employeeId: p.fallbackEmployeeId,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.fallbackEmail,
        department: p.department,
        jobTitle: p.jobTitle,
        managerName: p.managerName,
        hireDate: p.fallbackHireDate,
        status: "active",
        demoPersona: p.demoPersona,
      });
      personaIds.push(created._id);
      console.log(
        `  + Created ${p.firstName} ${p.lastName} (${p.demoPersona}) — id=${created._id.toString()}`
      );
    }
  }

  // Strip demoPersona from any other records so the picker stays at 3.
  const cleared = await Employee.updateMany(
    { _id: { $nin: personaIds }, demoPersona: { $ne: null } },
    { $set: { demoPersona: null } }
  );
  if (cleared.modifiedCount > 0) {
    console.log(
      `\n  ↺ Cleared demoPersona on ${cleared.modifiedCount} other record(s)`
    );
  }

  console.log("\nSeed complete!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

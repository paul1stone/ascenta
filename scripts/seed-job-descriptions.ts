/**
 * Seed script: Populates 10 Job Descriptions and backfills Employee.jobDescriptionId
 * Run: pnpm db:seed-jds
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { JobDescription } from "../packages/db/src/job-description-schema";
import { Employee } from "../packages/db/src/employee-schema";

interface Seed {
  title: string;
  department: string;
  level: "entry" | "mid" | "senior" | "lead" | "manager" | "director" | "executive";
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  roleSummary: string;
  coreResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  competencies: string[];
}

const SEEDS: Seed[] = [
  {
    title: "Software Engineer",
    department: "Engineering",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Designs, builds, and maintains software systems that power core product capabilities. Collaborates with product, design, and other engineers to ship reliable features that move customer outcomes.",
    coreResponsibilities: [
      "Write, review, and maintain production-quality code across the stack",
      "Translate product requirements into technical designs and implementations",
      "Participate in code review, give and incorporate substantive feedback",
      "Contribute to incident response and on-call rotations as needed",
    ],
    requiredQualifications: [
      "3+ years of professional software engineering experience",
      "Proficiency in at least one modern backend or full-stack language",
      "Comfortable working across the stack with relational and NoSQL databases",
    ],
    preferredQualifications: [
      "Experience with TypeScript, React, and Next.js",
      "Familiarity with cloud-native deployment patterns",
    ],
    competencies: [
      "Technical depth",
      "Ownership",
      "Communication",
      "Pragmatism",
      "Customer focus",
    ],
  },
  {
    title: "Senior Software Engineer",
    department: "Engineering",
    level: "senior",
    employmentType: "full_time",
    roleSummary:
      "Leads complex initiatives that span multiple components or services. Sets technical direction for a team and mentors mid-level engineers while still contributing meaningful production code.",
    coreResponsibilities: [
      "Drive technical design for cross-cutting initiatives",
      "Mentor mid-level engineers and raise team-wide engineering quality",
      "Identify and resolve sources of architectural risk",
      "Partner with product to shape scope based on technical realities",
    ],
    requiredQualifications: [
      "5+ years of professional software engineering experience",
      "Proven track record shipping non-trivial production systems",
      "Experience leading multi-engineer projects end to end",
    ],
    preferredQualifications: [
      "Experience as a tech lead or staff engineer",
      "Background in distributed systems or data-intensive applications",
    ],
    competencies: [
      "Architectural judgment",
      "Mentorship",
      "Strategic thinking",
      "Communication",
      "Decision making",
    ],
  },
  {
    title: "Engineering Manager",
    department: "Engineering",
    level: "manager",
    employmentType: "full_time",
    roleSummary:
      "Owns the performance, growth, and delivery of an engineering team. Balances people leadership, technical direction, and cross-functional partnership to ship outcomes the business depends on.",
    coreResponsibilities: [
      "Manage and grow a team of 4–8 engineers across all career stages",
      "Set quarterly priorities and hold the team accountable for outcomes",
      "Run hiring, performance, and development conversations end to end",
      "Partner with product and design on roadmap and trade-off decisions",
    ],
    requiredQualifications: [
      "2+ years of engineering management experience",
      "Strong technical foundation built on prior IC experience",
      "Demonstrated success developing engineers and shipping product",
    ],
    preferredQualifications: [
      "Experience scaling a team through 2x+ growth",
      "Background managing both senior and early-career engineers",
    ],
    competencies: [
      "People leadership",
      "Strategic thinking",
      "Coaching",
      "Cross-functional partnership",
      "Decision making",
    ],
  },
  {
    title: "Product Manager",
    department: "Product",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Owns a product area end to end — from discovery through delivery and adoption. Translates customer needs and business strategy into prioritized roadmaps and shippable scope.",
    coreResponsibilities: [
      "Define and own the roadmap for a product area",
      "Run customer discovery and synthesize findings into actionable scope",
      "Partner with engineering and design through delivery",
      "Track adoption and outcome metrics; iterate accordingly",
    ],
    requiredQualifications: [
      "3+ years of product management experience",
      "Track record shipping software products with measurable outcomes",
      "Strong written and verbal communication",
    ],
    preferredQualifications: [
      "Experience in B2B SaaS",
      "Familiarity with HR or workflow-automation domains",
    ],
    competencies: [
      "Customer empathy",
      "Strategic thinking",
      "Prioritization",
      "Communication",
      "Cross-functional partnership",
    ],
  },
  {
    title: "Director of Product",
    department: "Product",
    level: "director",
    employmentType: "full_time",
    roleSummary:
      "Leads the product organization for a portfolio of areas. Sets strategy, develops PMs, and ensures the team ships outcomes that move the business.",
    coreResponsibilities: [
      "Set product strategy across multiple product areas",
      "Hire, manage, and develop a team of product managers",
      "Partner with engineering, design, and GTM leadership on company priorities",
      "Represent product at the executive level and shape company direction",
    ],
    requiredQualifications: [
      "8+ years of product experience including 3+ in product leadership",
      "Track record managing PMs and shaping multi-team strategy",
      "Strong executive communication",
    ],
    preferredQualifications: [
      "Experience scaling a product team in a growth-stage company",
    ],
    competencies: [
      "Strategic vision",
      "People leadership",
      "Executive communication",
      "Decision making",
      "Cross-functional partnership",
    ],
  },
  {
    title: "People Operations Specialist",
    department: "People",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Owns day-to-day operations across the employee lifecycle — onboarding, benefits, compliance, and HR systems. Acts as the first point of contact for employee questions.",
    coreResponsibilities: [
      "Run onboarding and offboarding processes end to end",
      "Administer benefits enrollment and act as employee point of contact",
      "Maintain employee records and HRIS data integrity",
      "Support compliance reporting and policy acknowledgment campaigns",
    ],
    requiredQualifications: [
      "2+ years in HR, People Ops, or similar role",
      "Strong attention to detail and discretion with sensitive data",
      "Comfortable working across HR systems",
    ],
    preferredQualifications: [
      "Experience administering a modern HRIS",
      "PHR or SHRM-CP certification",
    ],
    competencies: [
      "Discretion",
      "Attention to detail",
      "Service orientation",
      "Communication",
      "Process discipline",
    ],
  },
  {
    title: "People Operations Lead",
    department: "People",
    level: "lead",
    employmentType: "full_time",
    roleSummary:
      "Leads the People Operations function for the company. Shapes process, owns programs, and partners with leaders across the business on talent decisions.",
    coreResponsibilities: [
      "Own People Ops processes across the employee lifecycle",
      "Lead policy development and compliance posture",
      "Partner with leadership on org design, comp, and performance programs",
      "Manage People Ops vendors and HR tooling",
    ],
    requiredQualifications: [
      "5+ years of HR or People Operations experience",
      "Demonstrated program ownership across the employee lifecycle",
      "Strong judgment on sensitive employee matters",
    ],
    preferredQualifications: [
      "Experience leading People Ops at a growth-stage company",
    ],
    competencies: [
      "Program ownership",
      "Judgment",
      "People leadership",
      "Strategic thinking",
      "Communication",
    ],
  },
  {
    title: "Account Executive",
    department: "Sales",
    level: "mid",
    employmentType: "full_time",
    roleSummary:
      "Owns a quota and works inbound and outbound opportunities through to close. Builds trusted relationships with prospects and partners with SDRs, marketing, and customer success.",
    coreResponsibilities: [
      "Run full-cycle sales motions from qualification to close",
      "Maintain accurate forecasts and pipeline hygiene",
      "Run discovery, demos, and procurement conversations with senior buyers",
      "Partner with marketing and CS to grow accounts post-close",
    ],
    requiredQualifications: [
      "3+ years of full-cycle B2B SaaS sales experience",
      "Track record meeting or exceeding quota",
      "Strong written and verbal communication",
    ],
    preferredQualifications: ["Experience selling into HR or operations buyers"],
    competencies: [
      "Customer empathy",
      "Communication",
      "Resilience",
      "Discipline",
      "Strategic thinking",
    ],
  },
  {
    title: "Sales Director",
    department: "Sales",
    level: "director",
    employmentType: "full_time",
    roleSummary:
      "Leads a team of account executives toward revenue targets. Owns hiring, coaching, forecasting, and the deal-by-deal motion that drives company growth.",
    coreResponsibilities: [
      "Hire, coach, and develop a team of 5–10 AEs",
      "Own quarterly and annual revenue targets for the team",
      "Run forecast calls and partner with finance on planning",
      "Partner with marketing and CS to drive pipeline and retention",
    ],
    requiredQualifications: [
      "3+ years of sales management experience",
      "Track record of building and scaling sales teams",
      "Executive communication and forecasting discipline",
    ],
    preferredQualifications: [
      "Experience leading sales at a growth-stage SaaS company",
    ],
    competencies: [
      "People leadership",
      "Strategic thinking",
      "Coaching",
      "Forecast discipline",
      "Cross-functional partnership",
    ],
  },
  {
    title: "Operations Coordinator",
    department: "Operations",
    level: "entry",
    employmentType: "full_time",
    roleSummary:
      "Supports day-to-day operations across the company — from office logistics to internal events to vendor management. The kind of role that quietly keeps everything running.",
    coreResponsibilities: [
      "Coordinate internal events and offsites end to end",
      "Manage office logistics, supplies, and vendor relationships",
      "Support cross-functional projects with operational execution",
      "Maintain shared documentation and operational playbooks",
    ],
    requiredQualifications: [
      "1+ year of relevant operations or coordination experience",
      "Strong organization and follow-through",
      "Comfortable owning logistics under deadline pressure",
    ],
    preferredQualifications: ["Experience coordinating events for 100+ attendees"],
    competencies: [
      "Organization",
      "Follow-through",
      "Service orientation",
      "Communication",
      "Adaptability",
    ],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  console.log(`Seeding ${SEEDS.length} job descriptions...`);
  const upserted: Array<{ id: string; title: string }> = [];
  for (const seed of SEEDS) {
    const result = await JobDescription.findOneAndUpdate(
      { title: seed.title },
      { ...seed, status: "published" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    upserted.push({ id: String(result._id), title: result.title });
  }
  console.log(`Upserted ${upserted.length} JDs.`);

  console.log("Backfilling Employee.jobDescriptionId by title match...");
  const employees = await Employee.find().lean();
  let attached = 0;
  const unmatched: string[] = [];
  for (const emp of employees) {
    const title = String(emp.jobTitle ?? "").toLowerCase().trim();
    if (!title) {
      unmatched.push(`${emp.firstName} ${emp.lastName} (no jobTitle)`);
      continue;
    }
    const exact = upserted.find((u) => u.title.toLowerCase() === title);
    const substring =
      exact ??
      upserted.find(
        (u) =>
          u.title.toLowerCase().includes(title) ||
          title.includes(u.title.toLowerCase()),
      );
    if (substring) {
      await Employee.updateOne(
        { _id: emp._id },
        { $set: { jobDescriptionId: substring.id } },
      );
      attached++;
    } else {
      unmatched.push(`${emp.firstName} ${emp.lastName} — '${emp.jobTitle}'`);
    }
  }
  console.log(
    `Attached ${attached}/${employees.length} employees. Unmatched: ${unmatched.length}`,
  );
  for (const u of unmatched.slice(0, 20)) console.log(`  - ${u}`);
  if (unmatched.length > 20) console.log(`  ... and ${unmatched.length - 20} more`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

/**
 * Seed script: Populates Focus Layers for up to 5 employees with assigned JDs.
 * Run: pnpm db:seed-focus-layers
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { Employee } from "../packages/db/src/employee-schema";
import { FocusLayer } from "../packages/db/src/focus-layer-schema";

const RESPONSE_BANK = [
  {
    uniqueContribution:
      "I bring clarity to ambiguous technical decisions by holding both customer empathy and architectural rigor in the same conversation.",
    highImpactArea:
      "Most of my impact lands when I shorten the distance between a noisy customer signal and a backlog item the team can act on.",
    signatureResponsibility:
      "I own how the team talks about its quarterly direction — the language, the priorities, and how we connect them to outcomes.",
    workingStyle:
      "I do my best work in focused 90-minute blocks, augmented with short async syncs. I prefer over-communication early in a project and quiet execution late.",
  },
  {
    uniqueContribution:
      "I'm the bridge between specialist depth and generalist context, which lets the team make calls that hold up across functions.",
    highImpactArea:
      "I create the most value when I get to redesign a process that was duct-taped during a growth period — that's where the compounding lives.",
    signatureResponsibility:
      "I'm responsible for the quality of our internal documentation and the rituals that keep it current.",
    workingStyle:
      "I run on structured calendars and bias toward written-first communication. I make space for spontaneous 1:1s when stakes are high.",
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const employees = await Employee.find({ jobDescriptionId: { $ne: null } })
    .limit(5)
    .lean<{ _id: unknown; firstName: string; lastName: string; jobDescriptionId: unknown }[]>();
  if (!employees.length) {
    console.log("No employees with jobDescriptionId. Run pnpm db:seed-jds first.");
    await mongoose.disconnect();
    return;
  }

  const states: Array<"draft" | "submitted" | "confirmed"> = [
    "draft",
    "submitted",
    "submitted",
    "confirmed",
    "confirmed",
  ];

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const status = states[i] ?? "draft";
    const responses = RESPONSE_BANK[i % RESPONSE_BANK.length];
    await FocusLayer.findOneAndUpdate(
      { employeeId: emp._id },
      {
        $set: {
          jobDescriptionId: emp.jobDescriptionId,
          responses,
          status,
          employeeSubmitted: { at: status !== "draft" ? new Date() : null },
          managerConfirmed:
            status === "confirmed"
              ? { at: new Date(), byUserId: null, comment: "Looks like a strong fit." }
              : { at: null, byUserId: null, comment: null },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ${emp.firstName} ${emp.lastName} → ${status}`);
  }
  console.log(`Seeded ${employees.length} Focus Layers.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Seed script: Backfills realistic Get to Know profile data on every employee.
 * Run: pnpm db:seed-profiles
 */

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../apps/platform/.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";
import { Employee } from "../packages/db/src/employee-schema";

const PACKS = [
  {
    pronouns: "she/her",
    preferredChannel: "Slack: @jane",
    getToKnow: {
      personalBio:
        "Born and raised in Pittsburgh. Started in mechanical engineering, moved into software when I realized I liked debugging more than CAD.",
      hobbies:
        "Long-distance running (slow), bread baking, and stubbornly trying to learn Japanese.",
      funFacts: [
        "Once made it onto a local news segment about backyard chickens.",
        "Used to be a part-time DJ in college.",
      ],
      askMeAbout: "Sourdough, ultramarathons, monorepo tooling",
      hometown: "Pittsburgh, PA",
      currentlyConsuming: "Re-reading 'The Goal' by Goldratt; latest Lex Fridman ep.",
      employeeChoice: {
        label: "First job",
        value: "Pretzel rolling at a hometown bakery, age 16",
      },
    },
  },
  {
    pronouns: "he/him",
    preferredChannel: "Slack: @marc",
    getToKnow: {
      personalBio:
        "Grew up between Madrid and Lima. Career started in technical writing, then field engineering, then product.",
      hobbies:
        "Mountain biking, backyard astronomy, learning chord progressions on a guitar that's still mostly out of tune.",
      funFacts: [
        "Speak four languages, badly.",
        "Once carried a kayak two miles to a lake that turned out to be drained.",
      ],
      askMeAbout:
        "Distributed teams, cooking with one pot, bike-packing routes in the southwest",
      hometown: "Lima, Peru → Madrid, Spain",
      currentlyConsuming: "'How to Take Smart Notes' and the Acquired podcast",
      employeeChoice: {
        label: "Hidden talent",
        value: "Decent at restoring vintage espresso machines",
      },
    },
  },
  {
    pronouns: "they/them",
    preferredChannel: "Slack: @sam",
    getToKnow: {
      personalBio:
        "From a small town in upstate New York. Studied philosophy, accidentally became a developer, never looked back.",
      hobbies:
        "Backpacking, board games (heavy euros), and the slow patient art of growing chili peppers.",
      funFacts: [
        "I have hiked the entire Long Trail in Vermont.",
        "I once won a regional Settlers of Catan tournament.",
      ],
      askMeAbout: "Game design, philosophy of mind, fermenting hot sauce",
      hometown: "Saranac Lake, NY",
      currentlyConsuming: "Le Guin's 'The Dispossessed'; the 'Decoder Ring' podcast",
      employeeChoice: {
        label: "Worst job",
        value: "Door-to-door magazine sales (one summer was enough)",
      },
    },
  },
  {
    pronouns: "she/her",
    preferredChannel: "Slack: @priya",
    getToKnow: {
      personalBio:
        "Grew up in Bangalore, schooled in Toronto, settled in Brooklyn. Career started in research and meandered into product analytics.",
      hobbies:
        "Tabletop RPG nights, woodworking, and very slowly improving at chess (currently rated 1280, ambitious about 1400).",
      funFacts: [
        "Can identify roughly 40 bird species by call alone.",
        "Built every piece of furniture in my apartment except the couch.",
      ],
      askMeAbout: "Bayesian intuition, beginner woodworking, second-act careers",
      hometown: "Bangalore, India",
      currentlyConsuming: "'Algorithms to Live By' and the Ezra Klein Show",
      employeeChoice: {
        label: "Best concert",
        value: "Sigur Rós, outdoor amphitheater, July 2018",
      },
    },
  },
  {
    pronouns: "he/him",
    preferredChannel: "Slack: @diego",
    getToKnow: {
      personalBio:
        "Mexico City native, transplanted to Austin a decade ago. Long stretch in customer success before moving into operations.",
      hobbies:
        "Salsa dancing (badly), trail running, and an ongoing feud with a backyard tomato garden that refuses to thrive.",
      funFacts: [
        "Used to compete in barbecue cookoffs — modest record, two ribbons.",
        "I have driven from Austin to Mexico City five times.",
      ],
      askMeAbout: "Customer health metrics, Texas BBQ, bilingual hiring practices",
      hometown: "Mexico City, Mexico",
      currentlyConsuming: "'The Mom Test' (re-read) and the Code Switch podcast",
      employeeChoice: {
        label: "Proud moment",
        value: "Translating an entire wedding ceremony live for two families",
      },
    },
  },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not set");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const employees = await Employee.find().lean();
  for (let i = 0; i < employees.length; i++) {
    const pack = PACKS[i % PACKS.length];
    await Employee.updateOne(
      { _id: employees[i]._id },
      {
        $set: {
          "profile.pronouns": pack.pronouns,
          "profile.preferredChannel": pack.preferredChannel,
          "profile.getToKnow": pack.getToKnow,
          "profile.profileUpdatedAt": new Date(),
        },
      }
    );
  }
  console.log(`Seeded profiles for ${employees.length} employees.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * One-time fix: Mark migrations as already applied when your DB has the tables
 * but Drizzle's journal has no record (e.g. tables were created via db:push).
 *
 * Run: npx tsx scripts/mark-initial-migration-applied.ts
 * Then: npm run db:migrate
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const MIGRATIONS = [
  { tag: "0000_little_unus", when: 1769277278418 },
  { tag: "0001_supreme_wendell_rand", when: 1770165020434 },
] as const;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const migrationsDir = path.join(process.cwd(), "drizzle", "migrations");
  const sql = neon(databaseUrl);

  // Ensure drizzle schema and table exist
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  let inserted = 0;
  for (const { tag, when } of MIGRATIONS) {
    const migrationPath = path.join(migrationsDir, `${tag}.sql`);
    const query = fs.readFileSync(migrationPath, "utf8");
    const hash = crypto.createHash("sha256").update(query).digest("hex");

    const existing = await sql`
      SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${hash}
    `;
    if (existing.length > 0) continue;

    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${hash}, ${when})
    `;
    inserted++;
    console.log(`Marked ${tag} as applied`);
  }

  if (inserted === 0) {
    console.log("All migrations already marked as applied.");
  }
  console.log("Run: npm run db:migrate");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

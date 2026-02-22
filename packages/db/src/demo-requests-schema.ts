import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const demoRequests = pgTable("demo_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  employeeCount: text("employee_count").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DemoRequest = typeof demoRequests.$inferSelect;
export type NewDemoRequest = typeof demoRequests.$inferInsert;

/**
 * Employee and Employee Notes Schema
 * Used for employee lookup during conversational workflows
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// Employees table - HR employee records
export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: text("employee_id").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    department: text("department").notNull(),
    jobTitle: text("job_title").notNull(),
    managerName: text("manager_name").notNull(),
    hireDate: timestamp("hire_date").notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("employees_employee_id_idx").on(table.employeeId),
    index("employees_name_idx").on(table.firstName, table.lastName),
    index("employees_email_idx").on(table.email),
    index("employees_department_idx").on(table.department),
  ]
);

// Employee notes - attachments like warnings, late notices, etc.
export const employeeNotes = pgTable(
  "employee_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    noteType: text("note_type").notNull(), // 'written_warning' | 'verbal_warning' | 'late_notice' | 'pip' | 'commendation' | 'general'
    title: text("title").notNull(),
    content: text("content"),
    severity: text("severity"), // 'low' | 'medium' | 'high'
    occurredAt: timestamp("occurred_at").notNull(),
    metadata: jsonb("metadata"), // Additional structured data
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("employee_notes_employee_id_idx").on(table.employeeId),
    index("employee_notes_type_idx").on(table.noteType),
  ]
);

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type EmployeeNote = typeof employeeNotes.$inferSelect;
export type NewEmployeeNote = typeof employeeNotes.$inferInsert;

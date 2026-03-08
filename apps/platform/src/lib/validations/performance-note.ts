import { z } from "zod";
import { NOTE_TYPES } from "@ascenta/db/performance-note-constants";

const FOLLOW_UP_OPTIONS = ["none", "check_in", "goal", "escalate"] as const;

export const performanceNoteFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  noteType: z.enum(NOTE_TYPES, "Note type is required"),
  observation: z.string().min(1, "Observation is required"),
  expectation: z.string().optional(),
  followUp: z.enum(FOLLOW_UP_OPTIONS).default("none"),
});

export type PerformanceNoteFormValues = z.infer<
  typeof performanceNoteFormSchema
>;

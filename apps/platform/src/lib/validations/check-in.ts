import { z } from "zod";

export const checkInFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  linkedGoals: z
    .array(z.string())
    .min(1, "At least one linked goal is required"),
  managerProgressObserved: z
    .string()
    .min(1, "Manager progress observation is required"),
  managerCoachingNeeded: z
    .string()
    .min(1, "Manager coaching assessment is required"),
  managerRecognition: z.string().optional(),
  employeeProgress: z.string().min(1, "Employee progress is required"),
  employeeObstacles: z.string().min(1, "Employee obstacles is required"),
  employeeSupportNeeded: z.string().optional(),
});

export type CheckInFormValues = z.infer<typeof checkInFormSchema>;

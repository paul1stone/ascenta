import { z } from "zod";

export const employeePrepareSchema = z.object({
  progressReflection: z.string().min(1, "Progress reflection is required"),
  stuckPointReflection: z.string().min(1, "Stuck point reflection is required"),
  conversationIntent: z.string().min(1, "Conversation intent is required"),
});

// A manager "completing" preparation must fill in at least one field. Without
// this refine, a manager could POST {} and flip the check-in status to
// "ready" without having actually prepared anything.
export const managerPrepareSchema = z
  .object({
    openingMove: z.string().nullable().optional(),
    recognitionNote: z.string().nullable().optional(),
    developmentalFocus: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      Boolean(data.openingMove) ||
      Boolean(data.recognitionNote) ||
      Boolean(data.developmentalFocus),
    {
      message:
        "Fill in at least one preparation field (opening move, recognition, or developmental focus)",
    },
  );

export const participateManagerSchema = z.object({
  stuckPointDiscussion: z.string().min(1, "Stuck point discussion is required"),
  recognition: z.string().min(1, "Recognition is required"),
  development: z.string().min(1, "Development discussion is required"),
  performance: z.string().nullable().optional(),
  managerCommitment: z.string().min(1, "Manager commitment is required"),
});

export const participateEmployeeSchema = z.object({
  employeeOpening: z.string().min(1, "Your opening is required"),
  employeeKeyTakeaways: z.string().min(1, "Key takeaways are required"),
  employeeCommitment: z.string().min(1, "Your commitment is required"),
});

export const reflectScoreSchema = z.number().int().min(1).max(5);

export const employeeReflectSchema = z.object({
  heard: reflectScoreSchema,
  clarity: reflectScoreSchema,
  recognition: reflectScoreSchema,
  development: reflectScoreSchema,
  safety: reflectScoreSchema,
});

export const managerReflectSchema = z.object({
  clarity: reflectScoreSchema,
  recognition: reflectScoreSchema,
  development: reflectScoreSchema,
  safety: reflectScoreSchema,
  forwardAction: z.string().min(1, "Forward action is required"),
});

export const scheduleCheckInSchema = z.object({
  employeeId: z.string().min(1),
  goalIds: z.array(z.string()).min(1, "At least one goal is required"),
  scheduledAt: z.string().datetime(),
});

export const approveCommitmentSchema = z.object({
  approved: z.boolean(),
});

export type EmployeePrepareValues = z.infer<typeof employeePrepareSchema>;
export type ManagerPrepareValues = z.infer<typeof managerPrepareSchema>;
export type ParticipateManagerValues = z.infer<typeof participateManagerSchema>;
export type ParticipateEmployeeValues = z.infer<typeof participateEmployeeSchema>;
export type EmployeeReflectValues = z.infer<typeof employeeReflectSchema>;
export type ManagerReflectValues = z.infer<typeof managerReflectSchema>;
export type ScheduleCheckInValues = z.infer<typeof scheduleCheckInSchema>;

// Backwards compatibility — will be removed when old form is deprecated (Task 20)
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

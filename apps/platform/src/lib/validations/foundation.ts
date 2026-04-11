import { z } from "zod";

const namedItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const foundationFormSchema = z.object({
  mission: z.string().max(2000, "Mission must be 2000 characters or fewer").optional().default(""),
  vision: z.string().max(2000, "Vision must be 2000 characters or fewer").optional().default(""),
  values: z.string().max(2000, "Values must be 2000 characters or fewer").optional().default(""),
  nonNegotiableBehaviors: z.array(namedItemSchema).optional().default([]),
  livedPrinciples: z.array(namedItemSchema).optional().default([]),
});

export type FoundationFormValues = z.infer<typeof foundationFormSchema>;

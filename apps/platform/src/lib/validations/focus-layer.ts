import { z } from "zod";

const responseField = z.string().trim().max(2000);

export const focusLayerDraftSchema = z.object({
  responses: z
    .object({
      uniqueContribution: responseField.optional(),
      highImpactArea: responseField.optional(),
      signatureResponsibility: responseField.optional(),
      workingStyle: responseField.optional(),
    })
    .partial(),
});
export type FocusLayerDraftInput = z.infer<typeof focusLayerDraftSchema>;

export const focusLayerSubmitSchema = z.object({
  responses: z.object({
    uniqueContribution: responseField.min(20, "Add at least 20 characters before submitting"),
    highImpactArea: responseField.min(20),
    signatureResponsibility: responseField.min(20),
    workingStyle: responseField.min(20),
  }),
});
export type FocusLayerSubmitInput = z.infer<typeof focusLayerSubmitSchema>;

export const focusLayerConfirmSchema = z.object({
  comment: z.string().trim().max(1000).optional(),
});
export type FocusLayerConfirmInput = z.infer<typeof focusLayerConfirmSchema>;

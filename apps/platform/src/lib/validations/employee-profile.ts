import { z } from "zod";
import {
  FUN_FACTS_MAX,
  PHOTO_MAX_BASE64_BYTES,
} from "@ascenta/db/employee-profile-constants";

const safeText = z.string().trim().max(2000);
const shortText = z.string().trim().max(200);

export const profilePatchSchema = z.object({
  photoBase64: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) =>
        v == null ||
        (v.startsWith("data:image/") && v.length <= PHOTO_MAX_BASE64_BYTES),
      { message: "Photo must be a data URL under ~200KB after compression" }
    ),
  pronouns: shortText.nullable().optional(),
  preferredChannel: shortText.nullable().optional(),
  getToKnow: z
    .object({
      personalBio: safeText.optional(),
      hobbies: safeText.optional(),
      funFacts: z.array(z.string().trim().max(200)).max(FUN_FACTS_MAX).optional(),
      askMeAbout: shortText.optional(),
      hometown: shortText.optional(),
      currentlyConsuming: shortText.optional(),
      employeeChoice: z
        .object({
          label: shortText.optional(),
          value: safeText.optional(),
        })
        .optional(),
    })
    .partial()
    .optional(),
});

export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;

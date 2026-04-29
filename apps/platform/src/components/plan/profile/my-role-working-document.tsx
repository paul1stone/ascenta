"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import {
  profilePatchSchema,
  type ProfilePatchInput,
} from "@/lib/validations/employee-profile";
import { GET_TO_KNOW_FIELDS } from "@ascenta/db/employee-profile-constants";
import { FOCUS_LAYER_PROMPTS } from "@ascenta/db/focus-layer-constants";
import { ProfilePhotoInput } from "./profile-photo-input";
import { FunFactsField } from "./fun-facts-field";

const focusLayerSchema = z.object({
  uniqueContribution: z.string().trim().max(2000).default(""),
  highImpactArea: z.string().trim().max(2000).default(""),
  signatureResponsibility: z.string().trim().max(2000).default(""),
  workingStyle: z.string().trim().max(2000).default(""),
});

const formSchema = z.object({
  aboutMe: profilePatchSchema,
  focusLayer: focusLayerSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialValues: Record<string, unknown>;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: FormValues = {
  aboutMe: {
    photoBase64: null,
    pronouns: "",
    preferredChannel: "",
    getToKnow: {
      personalBio: "",
      hobbies: "",
      funFacts: [""],
      askMeAbout: "",
      hometown: "",
      currentlyConsuming: "",
      employeeChoice: { label: "", value: "" },
    },
  },
  focusLayer: {
    uniqueContribution: "",
    highImpactArea: "",
    signatureResponsibility: "",
    workingStyle: "",
  },
};

function withDefaults(initial: Record<string, unknown>): FormValues {
  const merged = { ...EMPTY_VALUES };
  if (initial.aboutMe) {
    merged.aboutMe = {
      ...EMPTY_VALUES.aboutMe,
      ...(initial.aboutMe as Partial<ProfilePatchInput>),
      getToKnow: {
        ...EMPTY_VALUES.aboutMe.getToKnow,
        ...((initial.aboutMe as { getToKnow?: Record<string, unknown> })
          .getToKnow ?? {}),
      } as ProfilePatchInput["getToKnow"],
    };
  }
  if (initial.focusLayer) {
    merged.focusLayer = {
      ...EMPTY_VALUES.focusLayer,
      ...(initial.focusLayer as Record<string, string>),
    };
  }
  return merged;
}

export function MyRoleWorkingDocument({
  initialValues,
  onFieldChange,
  onSubmit,
  onCancel,
}: Props) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: withDefaults(initialValues),
    mode: "onChange",
  });
  const { register, watch, setValue, handleSubmit, reset, formState } = methods;

  // Sync incoming AI-driven updates (chat-context's update_working_document
  // patches `aboutMe` / `focusLayer` keys directly).
  useEffect(() => {
    reset(withDefaults(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // Bubble field changes back up so the working-doc state stays in sync (used
  // by chat-context for the [ASCENTA_WORKING_DOC] update path).
  useEffect(() => {
    const sub = watch((values) => {
      onFieldChange("aboutMe", values.aboutMe);
      onFieldChange("focusLayer", values.focusLayer);
    });
    return () => sub.unsubscribe();
  }, [watch, onFieldChange]);

  const photo = watch("aboutMe.photoBase64") ?? null;

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-8"
        onSubmit={handleSubmit(async () => {
          await onSubmit();
        })}
      >
        <section className="space-y-4">
          <h3 className="font-display text-base font-semibold">About Me</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile photo</label>
            <ProfilePhotoInput
              value={photo}
              onChange={(v) =>
                setValue("aboutMe.photoBase64", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Pronouns</label>
              <Input
                {...register("aboutMe.pronouns")}
                placeholder="she/her, they/them, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred contact</label>
              <Input
                {...register("aboutMe.preferredChannel")}
                placeholder="Slack: @jane"
              />
            </div>
            {GET_TO_KNOW_FIELDS.map((f) => (
              <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
                <label className="text-sm font-medium">{f.label}</label>
                <p className="text-xs text-muted-foreground">{f.helper}</p>
                {f.multiline ? (
                  <Textarea
                    rows={3}
                    placeholder={f.placeholder}
                    {...register(`aboutMe.getToKnow.${f.key}` as never)}
                  />
                ) : (
                  <Input
                    placeholder={f.placeholder}
                    {...register(`aboutMe.getToKnow.${f.key}` as never)}
                  />
                )}
              </div>
            ))}
          </div>

          <FunFactsField name="aboutMe.getToKnow.funFacts" />

          <div className="rounded-lg border border-dashed p-4 space-y-2">
            <label className="text-sm font-medium">Employee choice field</label>
            <p className="text-xs text-muted-foreground">
              Pick a label and tell us about it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                {...register("aboutMe.getToKnow.employeeChoice.label")}
                placeholder="Field name"
              />
              <div className="md:col-span-2">
                <Input
                  {...register("aboutMe.getToKnow.employeeChoice.value")}
                  placeholder="Field content"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-base font-semibold">Focus Layer</h3>
          {FOCUS_LAYER_PROMPTS.map((p) => (
            <div key={p.key} className="space-y-1">
              <label className="text-sm font-medium">{p.label}</label>
              <p className="text-xs text-muted-foreground">{p.helper}</p>
              <Textarea
                rows={4}
                placeholder={
                  p.placeholder || "Take a few sentences to share your perspective..."
                }
                {...register(`focusLayer.${p.key}` as never)}
              />
            </div>
          ))}
        </section>

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

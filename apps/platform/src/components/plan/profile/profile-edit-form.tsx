"use client";

import { useEffect, useRef, useState } from "react";
import {
  useForm,
  FormProvider,
  useFormContext,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@ascenta/ui/input";
import { Textarea } from "@ascenta/ui/textarea";
import {
  profilePatchSchema,
  type ProfilePatchInput,
} from "@/lib/validations/employee-profile";
import { GET_TO_KNOW_FIELDS } from "@ascenta/db/employee-profile-constants";
import { ProfilePhotoInput } from "./profile-photo-input";
import { FunFactsField } from "./fun-facts-field";

type Initial = ProfilePatchInput;

interface Props {
  employeeId: string;
  initialProfile: Initial;
  onChanged: () => void;
}

export function ProfileEditForm({ employeeId, initialProfile, onChanged }: Props) {
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<Initial>({
    resolver: zodResolver(profilePatchSchema) as Resolver<Initial>,
    defaultValues: initialProfile,
    mode: "onChange",
  });

  // intentionally don't depend on methods/employeeId — subscribe once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const sub = methods.watch(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(save, 800);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function save() {
    setSavingState("saving");
    const values = methods.getValues();
    const res = await fetch(`/api/employees/${employeeId}/profile`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setSavingState("saved");
      onChanged();
    } else {
      setSavingState("idle");
    }
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">About Me</h3>
          <span className="text-xs text-muted-foreground">
            {savingState === "saving"
              ? "Saving..."
              : savingState === "saved"
                ? "Saved"
                : ""}
          </span>
        </div>

        <PhotoSection />
        <RowsSection />

        <FunFactsField name="getToKnow.funFacts" />

        <EmployeeChoiceSection />
      </form>
    </FormProvider>
  );
}

function PhotoSection() {
  const { setValue, watch } = useFormContext<Initial>();
  const photo = watch("photoBase64") ?? null;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Profile photo</label>
      <ProfilePhotoInput
        value={photo}
        onChange={(v) =>
          setValue("photoBase64", v, { shouldDirty: true, shouldValidate: true })
        }
      />
    </div>
  );
}

function RowsSection() {
  const { register } = useFormContext<Initial>();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Pronouns</label>
        <Input {...register("pronouns")} placeholder="she/her, they/them, etc." />
      </div>
      <div>
        <label className="text-sm font-medium">Preferred contact</label>
        <Input
          {...register("preferredChannel")}
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
              {...register(`getToKnow.${f.key}` as never)}
            />
          ) : (
            <Input
              placeholder={f.placeholder}
              {...register(`getToKnow.${f.key}` as never)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function EmployeeChoiceSection() {
  const { register } = useFormContext<Initial>();
  return (
    <div className="rounded-lg border border-dashed p-4 space-y-2">
      <label className="text-sm font-medium">Employee choice field</label>
      <p className="text-xs text-muted-foreground">
        Pick a label and tell us about it. Examples: &ldquo;First job&rdquo;,
        &ldquo;Hidden talent&rdquo;, &ldquo;Best concert.&rdquo;
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          {...register("getToKnow.employeeChoice.label")}
          placeholder="Field name"
        />
        <div className="md:col-span-2">
          <Input
            {...register("getToKnow.employeeChoice.value")}
            placeholder="Field content"
          />
        </div>
      </div>
    </div>
  );
}

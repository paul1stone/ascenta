"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@ascenta/ui/button";
import { Textarea } from "@ascenta/ui/textarea";
import { FOCUS_LAYER_PROMPTS } from "@ascenta/db/focus-layer-constants";
import { AiSuggestButton } from "./ai-suggest-button";
import { FocusLayerStatusPill } from "./focus-layer-status-pill";

type Responses = {
  uniqueContribution: string;
  highImpactArea: string;
  signatureResponsibility: string;
  workingStyle: string;
};

interface Props {
  employeeId: string;
  initialResponses: Responses;
  initialStatus: "draft" | "submitted" | "confirmed";
  jobDescriptionAssigned: boolean;
  onChanged: () => void;
}

export function FocusLayerForm({
  employeeId,
  initialResponses,
  initialStatus,
  jobDescriptionAssigned,
  onChanged,
}: Props) {
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<Responses>({
    defaultValues: initialResponses,
    mode: "onChange",
  });
  const { register, watch, reset, getValues, formState } = methods;

  async function autoSave() {
    setSavingState("saving");
    try {
      const values = getValues();
      const res = await fetch(`/api/focus-layers/${employeeId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responses: values }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const json = await res.json();
      setStatus(json.focusLayer.status);
      setSavingState("saved");
    } catch {
      setSavingState("idle");
    }
  }

  useEffect(() => {
    const sub = watch(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(autoSave, 800);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, employeeId]);

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await autoSave();
      const res = await fetch(`/api/focus-layers/${employeeId}/submit`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Submit failed");
      }
      const json = await res.json();
      setStatus(json.focusLayer.status);
      onChanged();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  const values = watch();
  const allReady = (Object.values(values) as string[]).every(
    (v) => v && v.trim().length >= 20
  );
  const showWarning = status === "confirmed" && formState.isDirty;

  return (
    <FormProvider {...methods}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FocusLayerStatusPill status={status} />
          <span className="text-xs text-muted-foreground">
            {savingState === "saving" ? "Saving..." : savingState === "saved" ? "Saved" : ""}
          </span>
        </div>
        {jobDescriptionAssigned && (
          <AiSuggestButton
            employeeId={employeeId}
            hasContent={Object.values(values).some((v) => (v ?? "").trim().length > 0)}
            onSuggested={(r) => {
              reset(r as Responses, { keepDirty: true });
              autoSave();
            }}
          />
        )}
      </div>

      {!jobDescriptionAssigned && (
        <p className="rounded border border-dashed p-4 text-sm text-muted-foreground mb-4">
          Once a job description is assigned to you, you&apos;ll be able to draft your Focus
          Layer.
        </p>
      )}

      {showWarning && (
        <p className="rounded border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm mb-4">
          Editing will require your manager to re-confirm this Focus Layer.
        </p>
      )}

      <div className="space-y-6">
        {FOCUS_LAYER_PROMPTS.map((p) => (
          <div key={p.key} className="space-y-1">
            <label className="text-sm font-medium">{p.label}</label>
            <p className="text-xs text-muted-foreground">{p.helper}</p>
            <Textarea
              rows={4}
              placeholder={p.placeholder || "Take a few sentences to share your perspective..."}
              {...register(p.key as keyof Responses)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        <Button onClick={submit} disabled={!allReady || submitting}>
          {submitting
            ? "Submitting..."
            : status === "confirmed"
              ? "Resubmit"
              : "Submit for confirmation"}
        </Button>
      </div>
    </FormProvider>
  );
}

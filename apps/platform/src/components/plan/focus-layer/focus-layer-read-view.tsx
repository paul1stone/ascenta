"use client";
import { FOCUS_LAYER_PROMPTS } from "@ascenta/db/focus-layer-constants";
import { FocusLayerStatusPill } from "./focus-layer-status-pill";

interface ReadViewProps {
  responses: Record<string, string>;
  status: "draft" | "submitted" | "confirmed";
  managerConfirmed?: {
    at: Date | string | null;
    byUserId: string | null;
    comment: string | null;
  };
  managerName?: string | null;
}

export function FocusLayerReadView({
  responses,
  status,
  managerConfirmed,
  managerName,
}: ReadViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-semibold">Focus Layer</h3>
        <FocusLayerStatusPill status={status} />
      </div>
      {FOCUS_LAYER_PROMPTS.map((p) => {
        const value = responses[p.key] || "";
        return (
          <div key={p.key} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{p.label}</p>
            {value ? (
              <p className="text-sm whitespace-pre-line">{value}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Not yet shared</p>
            )}
          </div>
        );
      })}
      {status === "confirmed" && managerConfirmed?.at && (
        <div className="rounded border bg-muted/40 p-3 text-xs">
          Confirmed by {managerName ?? "manager"} on{" "}
          {new Date(managerConfirmed.at).toLocaleDateString()}.
          {managerConfirmed.comment && (
            <p className="mt-1 italic">&ldquo;{managerConfirmed.comment}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}

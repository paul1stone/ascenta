"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  GuardrailResult,
  GuardrailEvaluationResult,
} from "@/lib/workflows/types";

interface GuardrailBannerProps {
  results: GuardrailEvaluationResult;
  rationales: Record<string, string>;
  onRationaleChange: (guardrailId: string, rationale: string) => void;
}

export function GuardrailBanner({
  results,
  rationales,
  onRationaleChange,
}: GuardrailBannerProps) {
  const [expanded, setExpanded] = useState(true);

  // Get only triggered guardrails (not passed)
  const triggeredGuardrails = results.results.filter((r) => !r.passed);

  if (triggeredGuardrails.length === 0) {
    return null;
  }

  const hardStops = triggeredGuardrails.filter((r) => r.severity === "hard_stop");
  const warnings = triggeredGuardrails.filter((r) => r.severity === "warning");
  const escalations = triggeredGuardrails.filter((r) => r.severity === "escalation");

  // Determine banner color based on most severe issue
  const hasHardStop = hardStops.length > 0;
  const hasEscalation = escalations.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        hasHardStop && "border-red-300 bg-red-50",
        !hasHardStop && hasEscalation && "border-orange-300 bg-orange-50",
        !hasHardStop && !hasEscalation && "border-yellow-300 bg-yellow-50"
      )}
    >
      {/* Header */}
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {hasHardStop ? (
            <XCircle className="size-5 text-red-600" />
          ) : hasEscalation ? (
            <AlertTriangle className="size-5 text-orange-600" />
          ) : (
            <AlertCircle className="size-5 text-yellow-600" />
          )}
          <span
            className={cn(
              "font-medium",
              hasHardStop && "text-red-800",
              !hasHardStop && hasEscalation && "text-orange-800",
              !hasHardStop && !hasEscalation && "text-yellow-800"
            )}
          >
            {hasHardStop
              ? "Cannot Proceed - Issues Must Be Resolved"
              : `${triggeredGuardrails.length} Guardrail${triggeredGuardrails.length > 1 ? "s" : ""} Triggered`}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Hard Stops */}
          {hardStops.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-800">
                Blocking Issues ({hardStops.length})
              </h4>
              {hardStops.map((guardrail) => (
                <GuardrailItem
                  key={guardrail.guardrailId}
                  guardrail={guardrail}
                  rationale={rationales[guardrail.guardrailId] || ""}
                  onRationaleChange={onRationaleChange}
                  variant="hard_stop"
                />
              ))}
            </div>
          )}

          {/* Escalations */}
          {escalations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-800">
                Requires Review ({escalations.length})
              </h4>
              {escalations.map((guardrail) => (
                <GuardrailItem
                  key={guardrail.guardrailId}
                  guardrail={guardrail}
                  rationale={rationales[guardrail.guardrailId] || ""}
                  onRationaleChange={onRationaleChange}
                  variant="escalation"
                />
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-yellow-800">
                Warnings ({warnings.length})
              </h4>
              {warnings.map((guardrail) => (
                <GuardrailItem
                  key={guardrail.guardrailId}
                  guardrail={guardrail}
                  rationale={rationales[guardrail.guardrailId] || ""}
                  onRationaleChange={onRationaleChange}
                  variant="warning"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface GuardrailItemProps {
  guardrail: GuardrailResult;
  rationale: string;
  onRationaleChange: (guardrailId: string, rationale: string) => void;
  variant: "hard_stop" | "warning" | "escalation";
}

function GuardrailItem({
  guardrail,
  rationale,
  onRationaleChange,
  variant,
}: GuardrailItemProps) {
  const needsRationale = guardrail.requiredAction === "rationale";
  const needsHRReview = guardrail.requiredAction === "hr_review";

  return (
    <div
      className={cn(
        "rounded-md border p-3",
        variant === "hard_stop" && "border-red-200 bg-white",
        variant === "escalation" && "border-orange-200 bg-white",
        variant === "warning" && "border-yellow-200 bg-white"
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-0.5 text-lg",
            variant === "hard_stop" && "text-red-500",
            variant === "escalation" && "text-orange-500",
            variant === "warning" && "text-yellow-500"
          )}
        >
          •
        </span>
        <div className="flex-1">
          <p
            className={cn(
              "font-medium",
              variant === "hard_stop" && "text-red-800",
              variant === "escalation" && "text-orange-800",
              variant === "warning" && "text-yellow-800"
            )}
          >
            {guardrail.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {guardrail.message}
          </p>

          {/* Rationale Input */}
          {needsRationale && (
            <div className="mt-3">
              <Label htmlFor={`rationale-${guardrail.guardrailId}`} className="text-xs">
                Provide rationale to proceed:
              </Label>
              <textarea
                id={`rationale-${guardrail.guardrailId}`}
                value={rationale}
                onChange={(e) =>
                  onRationaleChange(guardrail.guardrailId, e.target.value)
                }
                placeholder="Explain why you are proceeding despite this warning..."
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {rationale && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Rationale provided
                </p>
              )}
            </div>
          )}

          {/* HR Review Notice */}
          {needsHRReview && (
            <div className="mt-3 rounded bg-orange-100 p-2">
              <p className="text-xs text-orange-800">
                <strong>HR Review Required:</strong> This will be flagged for
                {guardrail.escalateTo
                  ? ` ${guardrail.escalateTo} review`
                  : " HR review"}{" "}
                before export.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple success banner when all guardrails pass
 */
export function GuardrailSuccessBanner() {
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-green-600">✓</span>
        <span className="font-medium text-green-800">
          All guardrails passed
        </span>
      </div>
      <p className="mt-1 text-sm text-green-700">
        No compliance issues detected. You may proceed.
      </p>
    </div>
  );
}

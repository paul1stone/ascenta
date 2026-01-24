"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit,
  Lock,
  Download,
  Loader2,
} from "lucide-react";
import type {
  WorkflowInputs,
  IntakeFieldDefinition,
  GeneratedArtifact,
  ArtifactTemplateDefinition,
} from "@/lib/workflows/types";

interface ReviewScreenProps {
  inputs: WorkflowInputs;
  intakeFields: IntakeFieldDefinition[];
  artifact: GeneratedArtifact;
  template: ArtifactTemplateDefinition;
  onEdit?: (sectionKey: string) => void;
  onExport: (
    format: "pdf" | "docx",
    confirmations: ReviewConfirmations
  ) => void;
  isExporting?: boolean;
}

export interface ReviewConfirmations {
  accuracyReviewed: boolean;
  noPHI: boolean;
  policyReferencesCorrect: boolean;
}

export function ReviewScreen({
  inputs,
  intakeFields,
  artifact,
  template,
  onEdit,
  onExport,
  isExporting = false,
}: ReviewScreenProps) {
  const [confirmations, setConfirmations] = useState<ReviewConfirmations>({
    accuracyReviewed: false,
    noPHI: false,
    policyReferencesCorrect: false,
  });

  const allConfirmed =
    confirmations.accuracyReviewed &&
    confirmations.noPHI &&
    confirmations.policyReferencesCorrect;

  // Group fields for display
  const groupedFields: Record<string, IntakeFieldDefinition[]> = {};
  for (const field of intakeFields) {
    const group = field.groupName || "General";
    if (!groupedFields[group]) {
      groupedFields[group] = [];
    }
    groupedFields[group].push(field);
  }

  return (
    <div className="flex h-full flex-col lg:flex-row gap-6">
      {/* Left Panel - Inputs Summary */}
      <div className="w-full lg:w-1/3">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Input Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4 pr-4">
                {Object.entries(groupedFields).map(([group, fields]) => (
                  <div key={group}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {group}
                    </p>
                    <div className="space-y-2">
                      {fields.map((field) => {
                        const value = inputs[field.fieldKey];
                        const displayValue = formatValue(value, field);

                        return (
                          <div key={field.fieldKey} className="text-sm">
                            <span className="text-muted-foreground">
                              {field.label}:
                            </span>{" "}
                            <span className="text-deep-blue">
                              {displayValue || (
                                <span className="italic text-muted-foreground">
                                  Not provided
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Generated Output */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <FileText className="size-4" />
                Generated Document
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Version {artifact.version}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-[calc(100vh-500px)]">
              <div className="space-y-6 pr-4">
                {template.sections.map((section) => {
                  const content = artifact.sections[section.key];
                  const isLocked = section.locked;

                  return (
                    <div key={section.key} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <Lock className="size-3 text-muted-foreground" />
                          ) : (
                            <Edit className="size-3 text-summit" />
                          )}
                          <h4 className="font-medium text-deep-blue">
                            {section.title}
                          </h4>
                        </div>
                        {!isLocked && onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onEdit(section.key)}
                          >
                            <Edit className="size-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-md border p-4 text-sm whitespace-pre-wrap",
                          isLocked
                            ? "bg-muted/50 border-dashed"
                            : "bg-white"
                        )}
                      >
                        {content || (
                          <span className="italic text-muted-foreground">
                            No content generated
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Confirmation Checkboxes */}
        <Card className="mt-4">
          <CardContent className="py-4">
            <h4 className="font-medium text-deep-blue mb-3">
              Review Confirmations
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Before exporting, please confirm the following:
            </p>

            <div className="space-y-3">
              <ConfirmationCheckbox
                id="accuracy"
                checked={confirmations.accuracyReviewed}
                onChange={(checked) =>
                  setConfirmations((prev) => ({
                    ...prev,
                    accuracyReviewed: checked,
                  }))
                }
                label="I have reviewed this document for accuracy"
                description="All facts, dates, and details have been verified against the original inputs."
              />

              <ConfirmationCheckbox
                id="phi"
                checked={confirmations.noPHI}
                onChange={(checked) =>
                  setConfirmations((prev) => ({
                    ...prev,
                    noPHI: checked,
                  }))
                }
                label="No Protected Health Information (PHI) is included"
                description="This document does not contain any medical or health-related information that could identify an individual."
              />

              <ConfirmationCheckbox
                id="policy"
                checked={confirmations.policyReferencesCorrect}
                onChange={(checked) =>
                  setConfirmations((prev) => ({
                    ...prev,
                    policyReferencesCorrect: checked,
                  }))
                }
                label="Policy references are appropriate"
                description="All policy citations are current and applicable to this situation."
              />
            </div>

            <Separator className="my-4" />

            {/* Export Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!allConfirmed || isExporting}
                onClick={() => onExport("docx", confirmations)}
              >
                {isExporting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Download className="size-4 mr-2" />
                )}
                Export as DOCX
              </Button>
              <Button
                className="flex-1 bg-summit hover:bg-summit-hover"
                disabled={!allConfirmed || isExporting}
                onClick={() => onExport("pdf", confirmations)}
              >
                {isExporting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Download className="size-4 mr-2" />
                )}
                Export as PDF
              </Button>
            </div>

            {!allConfirmed && (
              <p className="mt-3 text-xs text-muted-foreground text-center">
                <AlertCircle className="inline size-3 mr-1" />
                All confirmations must be checked before exporting
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ConfirmationCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

function ConfirmationCheckbox({
  id,
  checked,
  onChange,
  label,
  description,
}: ConfirmationCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
        checked
          ? "border-green-300 bg-green-50"
          : "border-border hover:bg-muted/50"
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 rounded"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-deep-blue">{label}</span>
          {checked && <CheckCircle2 className="size-4 text-green-600" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </label>
  );
}

/**
 * Format a field value for display
 */
function formatValue(
  value: unknown,
  field: IntakeFieldDefinition
): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (Array.isArray(value)) {
    // For checkbox groups, map values to labels if options exist
    if (field.options) {
      return value
        .map((v) => field.options?.find((o) => o.value === v)?.label || v)
        .join(", ");
    }
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // For dropdowns, show the label if options exist
  if (field.type === "dropdown" && field.options) {
    const option = field.options.find((o) => o.value === value);
    return option?.label || String(value);
  }

  // For dates, format nicely
  if (field.type === "date" && typeof value === "string") {
    try {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return value;
    }
  }

  return String(value);
}

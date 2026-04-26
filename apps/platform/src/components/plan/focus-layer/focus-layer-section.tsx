"use client";
import { useCallback, useEffect, useState } from "react";
import { FocusLayerForm } from "./focus-layer-form";
import { FocusLayerReadView } from "./focus-layer-read-view";
import { FocusLayerConfirmBar } from "./focus-layer-confirm-bar";

const EMPTY = {
  uniqueContribution: "",
  highImpactArea: "",
  signatureResponsibility: "",
  workingStyle: "",
};

interface SectionData {
  responses: typeof EMPTY;
  status: "draft" | "submitted" | "confirmed";
  managerConfirmed?: {
    at: Date | string | null;
    byUserId: string | null;
    comment: string | null;
  };
  jobDescriptionAssigned: boolean;
}

interface Props {
  employeeId: string;
  mode: "edit" | "view";
  /** When mode === "view" and the viewer has authority to confirm. */
  canConfirm?: boolean;
}

export function FocusLayerSection({ employeeId, mode, canConfirm }: Props) {
  const [data, setData] = useState<SectionData | null>(null);

  const load = useCallback(async () => {
    const [flRes, empRes] = await Promise.all([
      fetch(`/api/focus-layers/${employeeId}`),
      fetch(`/api/dashboard/employees/${employeeId}`).catch(() => null),
    ]);
    const fl = await flRes.json();
    const emp = empRes ? await empRes.json().catch(() => ({})) : {};
    setData({
      responses: fl.focusLayer?.responses ?? EMPTY,
      status: fl.focusLayer?.status ?? "draft",
      managerConfirmed: fl.focusLayer?.managerConfirmed,
      jobDescriptionAssigned: !!emp?.employee?.jobDescriptionId,
    });
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading Focus Layer...</p>;
  }

  if (mode === "edit") {
    return (
      <FocusLayerForm
        employeeId={employeeId}
        initialResponses={data.responses}
        initialStatus={data.status}
        jobDescriptionAssigned={data.jobDescriptionAssigned}
        onChanged={load}
      />
    );
  }

  return (
    <div className="space-y-3">
      <FocusLayerReadView
        responses={data.responses as unknown as Record<string, string>}
        status={data.status}
        managerConfirmed={data.managerConfirmed}
      />
      {canConfirm && data.status === "submitted" && (
        <FocusLayerConfirmBar employeeId={employeeId} onConfirmed={load} />
      )}
    </div>
  );
}

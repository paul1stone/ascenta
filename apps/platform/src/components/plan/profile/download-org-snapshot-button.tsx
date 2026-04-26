"use client";

import { Button } from "@ascenta/ui/button";
import { FileDown } from "lucide-react";

type Size = "sm" | "default" | "icon" | "icon-sm";

interface Props {
  employeeId: string;
  size?: Size;
  label?: string;
  iconOnly?: boolean;
}

export function DownloadOrgSnapshotButton({
  employeeId,
  size = "sm",
  label = "Download My Organization Snapshot",
  iconOnly = false,
}: Props) {
  const ariaLabel = label;
  const buttonSize: Size = iconOnly ? "icon-sm" : size;
  return (
    <Button
      variant="outline"
      size={buttonSize}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={() =>
        window.open(`/api/employees/${employeeId}/organization-pdf`)
      }
    >
      <FileDown className="size-4" />
      {!iconOnly && <span className="ml-1">{label}</span>}
    </Button>
  );
}

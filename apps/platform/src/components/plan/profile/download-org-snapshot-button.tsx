"use client";

import { Button } from "@ascenta/ui/button";
import { FileDown } from "lucide-react";

interface Props {
  employeeId: string;
  size?: "sm" | "default";
  label?: string;
}

export function DownloadOrgSnapshotButton({
  employeeId,
  size = "sm",
  label = "Download My Organization Snapshot",
}: Props) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() =>
        window.open(`/api/employees/${employeeId}/organization-pdf`)
      }
    >
      <FileDown className="size-4 mr-1" />
      {label}
    </Button>
  );
}

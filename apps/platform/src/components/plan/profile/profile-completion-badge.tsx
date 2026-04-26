"use client";

import { Badge } from "@ascenta/ui/badge";

interface Props {
  complete: number;
  total: number;
}

export function ProfileCompletionBadge({ complete, total }: Props) {
  if (total === 0) return null;
  if (complete === total) {
    return <Badge variant="default">Profile complete</Badge>;
  }
  return (
    <Badge variant="secondary">
      {complete} of {total} complete
    </Badge>
  );
}

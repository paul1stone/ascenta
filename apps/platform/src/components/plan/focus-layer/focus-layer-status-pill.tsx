"use client";
import { Badge } from "@ascenta/ui/badge";
import {
  FOCUS_LAYER_STATUS_LABELS,
  type FocusLayerStatus,
} from "@ascenta/db/focus-layer-constants";

const variants: Record<FocusLayerStatus, "secondary" | "outline" | "default"> = {
  draft: "outline",
  submitted: "secondary",
  confirmed: "default",
};

export function FocusLayerStatusPill({ status }: { status: FocusLayerStatus }) {
  return <Badge variant={variants[status]}>{FOCUS_LAYER_STATUS_LABELS[status]}</Badge>;
}

"use client";
import { useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Textarea } from "@ascenta/ui/textarea";

interface Props {
  employeeId: string;
  onConfirmed: () => void;
}

export function FocusLayerConfirmBar({ employeeId, onConfirmed }: Props) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/focus-layers/${employeeId}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Confirm failed");
      }
      onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <h4 className="text-sm font-semibold">Confirm this Focus Layer</h4>
      <Textarea
        rows={2}
        placeholder="Optional comment for the employee..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={confirm} disabled={submitting}>
        {submitting ? "Confirming..." : "Confirm Focus Layer"}
      </Button>
    </div>
  );
}

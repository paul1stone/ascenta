"use client";
import { useState } from "react";
import { Button } from "@ascenta/ui/button";
import { Sparkles } from "lucide-react";

interface Props {
  employeeId: string;
  hasContent: boolean;
  onSuggested: (responses: Record<string, string>) => void;
}

export function AiSuggestButton({ employeeId, hasContent, onSuggested }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggest() {
    if (hasContent && !confirm("Replace existing draft with AI suggestion?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/focus-layers/${employeeId}/suggest`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Request failed with ${res.status}`);
      }
      const json = await res.json();
      onSuggested(json.responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suggestion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={suggest} disabled={loading}>
        <Sparkles className="size-4 mr-1" />
        {loading ? "Generating..." : "Suggest from my role"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";
import { useAuth } from "@/lib/auth/auth-context";

type AiAssistButtonProps = {
  checkInId: string;
  field: string;
  label?: string;
  onSuggestion: (text: string) => void;
};

export function AiAssistButton({
  checkInId,
  field,
  label = "Suggest",
  onSuggestion,
}: AiAssistButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || !user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/grow/check-ins/${checkInId}/assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": user.id,
        },
        body: JSON.stringify({ field }),
      });
      if (res.ok) {
        const data = await res.json();
        onSuggestion(data.suggestion);
      }
    } catch {
      console.error("AI assist failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "text-xs text-[#44aa99] hover:text-[#44aa99]/80 bg-[#44aa99]/10 px-2.5 py-1 rounded transition-colors",
        loading && "opacity-50 cursor-wait",
      )}
    >
      {loading ? "Generating..." : `\u2726 ${label}`}
    </button>
  );
}

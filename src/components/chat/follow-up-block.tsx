"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FollowUpData } from "./workflow-blocks";
import { MarkdownRenderer } from "./markdown-renderer";

interface FollowUpBlockProps {
  data: FollowUpData;
  onSelect: (runId: string, type: "email" | "script") => void;
  onOther?: (value: string) => void;
}

export function FollowUpBlock({
  data,
  onSelect,
  onOther,
}: FollowUpBlockProps) {
  const [showDoc, setShowDoc] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-summit/20 bg-summit/5 p-4">
        <button
          type="button"
          onClick={() => setShowDoc(!showDoc)}
          className="text-sm font-medium text-summit hover:underline"
        >
          {showDoc ? "Hide document" : "View generated document"}
        </button>
        {showDoc && (
          <div className="mt-3 max-h-64 overflow-auto rounded-lg bg-white p-3 text-xs text-deep-blue">
            <MarkdownRenderer content={data.documentContent} />
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Would you like help giving {data.employeeName} this news?
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-summit/30 hover:bg-summit/10"
          onClick={() => onSelect(data.runId, "email")}
        >
          A. Format me an email
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-summit/30 hover:bg-summit/10"
          onClick={() => onSelect(data.runId, "script")}
        >
          B. In-person script to avoid legal trouble
        </Button>
        {onOther && (
          <div className="flex flex-1 min-w-[200px] items-center gap-2">
            <span className="text-sm text-muted-foreground">C. Other:</span>
            <Input
              placeholder="Ask something else..."
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otherValue.trim()) {
                  onOther(otherValue.trim());
                  setOtherValue("");
                }
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={!otherValue.trim()}
              onClick={() => {
                if (otherValue.trim()) {
                  onOther(otherValue.trim());
                  setOtherValue("");
                }
              }}
              className="bg-summit hover:bg-summit-hover"
            >
              Send
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

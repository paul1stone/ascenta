"use client";

import { useEffect, useRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@ascenta/ui/button";
import { Input } from "@ascenta/ui/input";
import {
  FUN_FACTS_MAX,
  FUN_FACTS_MIN,
} from "@ascenta/db/employee-profile-constants";
import { Plus, X } from "lucide-react";

export function FunFactsField({ name }: { name: string }) {
  const { control, register, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (fields.length > 0) return;
    const initial = getValues(name);
    if (Array.isArray(initial) && initial.length > 0) {
      for (const v of initial) append(typeof v === "string" ? v : "");
    } else {
      append("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Fun facts</label>
      <p className="text-xs text-muted-foreground">1–3 things that make you, you.</p>
      <div className="space-y-2">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-start gap-2">
            <Input
              {...register(`${name}.${idx}` as const)}
              placeholder="e.g., Once held a state record for sand-castle building"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => remove(idx)}
              disabled={fields.length <= FUN_FACTS_MIN}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => append("")}
        disabled={fields.length >= FUN_FACTS_MAX}
      >
        <Plus className="size-4 mr-1" /> Add fact
      </Button>
    </div>
  );
}

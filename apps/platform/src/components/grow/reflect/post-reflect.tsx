"use client";

import { useState } from "react";
import { cn } from "@ascenta/ui";

export type PostReflectPrompt = {
  id: string;
  label: string;
  prompt: string;
  type: "likert" | "text";
  helper?: string;
};

type PostReflectProps = {
  prompts: PostReflectPrompt[];
  role: "employee" | "manager";
};

export function PostReflectForm({ prompts, role }: PostReflectProps) {
  const [responses, setResponses] = useState<Record<string, string | number>>(
    {}
  );

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <header className="px-5 py-3 border-b border-border bg-muted/30">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Post-Reflect (within 24 hours)
        </h3>
        <p className="text-xs text-muted-foreground">
          Capture how the conversation landed. Your responses are private to
          you and seed your next cycle.
        </p>
      </header>

      <div className="divide-y divide-border">
        {prompts.map((p, idx) => (
          <div key={p.id} className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {idx + 1}
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">
                  {p.label}
                </p>
                <p className="text-sm text-foreground mt-1 leading-relaxed">
                  {p.prompt}
                </p>
                {p.helper && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {p.helper}
                  </p>
                )}
              </div>
            </div>

            <div className="pl-10">
              {p.type === "likert" ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isActive = responses[p.id] === n;
                    return (
                      <button
                        key={n}
                        onClick={() =>
                          setResponses((prev) => ({ ...prev, [p.id]: n }))
                        }
                        className={cn(
                          "flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                          isActive
                            ? "border-[#6688bb] bg-[#6688bb] text-white"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <span className="ml-3 text-xs text-muted-foreground">
                    1 = strongly disagree · 5 = strongly agree
                  </span>
                </div>
              ) : (
                <textarea
                  value={(responses[p.id] as string) ?? ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [p.id]: e.target.value,
                    }))
                  }
                  placeholder="Write a few sentences."
                  className="min-h-[70px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6688bb]/30"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="px-5 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground italic">
        {role === "employee"
          ? "Your responses are never shared with your manager directly. They feed only the perception gap engine."
          : "Your responses inform your next cycle context briefing and surface relevant Library content if patterns emerge."}
      </footer>
    </div>
  );
}

export const EMPLOYEE_POST_REFLECT: PostReflectPrompt[] = [
  {
    id: "epr-1",
    label: "Did I feel heard?",
    prompt:
      "Did you leave the conversation feeling genuinely understood, not just acknowledged?",
    type: "likert",
    helper:
      "Compared against your manager's response. Most important post-Reflect signal.",
  },
  {
    id: "epr-2",
    label: "Did I say what I needed to say?",
    prompt:
      "Did the conversation create enough safety for honesty? If you held back, what got in the way?",
    type: "text",
    helper:
      "Significant content held back can route a private signal into your manager's next Reflect prep.",
  },
  {
    id: "epr-3",
    label: "Your commitment",
    prompt:
      "Name the specific commitment you made in Move 6. This appears in your next pre-Check-in reflection until it's honored.",
    type: "text",
  },
  {
    id: "epr-4",
    label: "Next Reflect timing",
    prompt:
      "When do you think the next Reflect should happen? The earlier of your and your manager's recommendations always wins.",
    type: "text",
  },
];

export const MANAGER_POST_REFLECT: PostReflectPrompt[] = [
  {
    id: "mpr-1",
    label: "Employee experience of being heard",
    prompt:
      "Did the employee leave feeling genuinely understood? What in the conversation tells you that?",
    type: "likert",
    helper:
      "Compared against the employee's Heard response. Persistent divergence triggers a relationship quality signal.",
  },
  {
    id: "mpr-2",
    label: "Learning from upward feedback",
    prompt:
      "What did the employee's feedback teach you about how you show up as their manager?",
    type: "text",
    helper:
      "Becomes part of your manager development record within Leadership Library.",
  },
  {
    id: "mpr-3",
    label: "Your commitment",
    prompt:
      "Name the specific commitment you made in Move 6. This appears in your pre-Check-in context brief until the employee confirms it has been honored.",
    type: "text",
  },
  {
    id: "mpr-4",
    label: "Next Reflect timing",
    prompt:
      "When should the next Reflect be scheduled? Compared against the employee's recommendation — the earlier date wins.",
    type: "text",
  },
];

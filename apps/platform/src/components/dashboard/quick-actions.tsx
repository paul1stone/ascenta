"use client";

import Link from "next/link";
import { AlertTriangle, FileText, UserPlus, Target, Scale, Award } from "lucide-react";

const ACTIONS = [
  { label: "Written Warning", icon: AlertTriangle, href: "/chat", description: "Draft a corrective action" },
  { label: "Performance Plan", icon: FileText, href: "/chat", description: "Create a PIP" },
  { label: "Onboarding", icon: UserPlus, href: "/chat", description: "Set up a new hire" },
  { label: "Job Posting", icon: Target, href: "/chat", description: "Write a job description" },
  { label: "Policy Review", icon: Scale, href: "/chat", description: "Audit compliance" },
  { label: "Recognition", icon: Award, href: "/chat", description: "Celebrate an achievement" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md hover:border-summit/30 transition-all group text-center"
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-deep-blue/5 group-hover:bg-summit/10 transition-colors">
            <action.icon className="size-5 text-deep-blue group-hover:text-summit transition-colors" />
          </div>
          <div className="text-sm font-medium text-deep-blue">{action.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
        </Link>
      ))}
    </div>
  );
}

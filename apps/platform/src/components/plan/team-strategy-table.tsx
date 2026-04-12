"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ascenta/ui/table";
import { Check, X } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  hasTranslation: boolean;
  primaryContribution: string | null;
  supportAgreements: { goal: string; support: string }[];
}

interface TeamStrategyTableProps {
  team: TeamMember[];
  accentColor: string;
}

export function TeamStrategyTable({ team, accentColor }: TeamStrategyTableProps) {
  if (team.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-bold text-deep-blue">
        Team Strategy Overview
      </h3>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead className="text-center">Translation</TableHead>
              <TableHead>Primary Contribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="pl-4 font-medium text-sm">
                  {member.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.jobTitle}
                </TableCell>
                <TableCell className="text-center">
                  {member.hasTranslation ? (
                    <Check className="size-4 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="size-4 text-muted-foreground/40 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                  {member.primaryContribution ?? (
                    <span className="italic text-muted-foreground/50">No translation</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Support commitments */}
      {team.some((m) => m.supportAgreements.length > 0) && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Your Support Commitments
          </p>
          <div className="space-y-2">
            {team
              .filter((m) => m.supportAgreements.length > 0)
              .map((m) =>
                m.supportAgreements.map((sa, i) => (
                  <div key={`${m.id}-${i}`} className="text-sm">
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="text-muted-foreground"> — {sa.goal}: </span>
                    <span className="text-foreground">{sa.support}</span>
                  </div>
                )),
              )}
          </div>
        </div>
      )}
    </div>
  );
}

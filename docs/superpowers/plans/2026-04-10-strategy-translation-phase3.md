# Strategy Translation Phase 3: Role-Based Views

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "My Strategy" adaptive view that surfaces published translations to employees, managers, and HR users — each seeing a tailored version of how strategy translates to their role.

**Architecture:** Single page component that adapts rendering based on `useRole()` context. Fetches published translations from Phase 2's API. Employee sees personal contribution language, managers see team overview, HR sees cross-department governance. New nav entry under Plan category.

**Tech Stack:** React (components), Next.js App Router (page), Tailwind CSS (styling), shadcn/ui (cards, tables, badges)

**Depends on:** Phase 2 (StrategyTranslation schema, API routes, published translations)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `apps/platform/src/app/api/plan/my-strategy/route.ts` | Create | Personalized translation lookup API |
| `apps/platform/src/lib/constants/dashboard-nav.ts` | Modify | Add my-strategy page config |
| `apps/platform/src/components/plan/strategy-contribution-card.tsx` | Create | Reusable card for priority contribution |
| `apps/platform/src/components/plan/my-strategy-view.tsx` | Create | Main adaptive view |
| `apps/platform/src/components/plan/team-strategy-table.tsx` | Create | Manager's direct report table |
| `apps/platform/src/components/plan/translation-health-dashboard.tsx` | Create | HR governance stats |
| `apps/platform/src/app/my-strategy/page.tsx` | Create | Page route |

---

### Task 1: Personalized Translation Lookup API

**Files:**
- Create: `apps/platform/src/app/api/plan/my-strategy/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { Goal } from "@ascenta/db/goal-schema";

function inferRoleLevel(
  jobTitle: string,
): "executive" | "manager" | "individual_contributor" {
  const lower = jobTitle.toLowerCase();
  const exec = ["director", "vp", "vice president", "chief", "head of", "cto", "ceo", "cfo", "coo", "svp", "evp"];
  const mgr = ["manager", "lead", "supervisor", "team lead", "principal"];
  if (exec.some((kw) => lower.includes(kw))) return "executive";
  if (mgr.some((kw) => lower.includes(kw))) return "manager";
  return "individual_contributor";
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "employeeId is required" },
        { status: 400 },
      );
    }

    // Look up employee
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(employeeId);
    const employee = isObjectId
      ? await Employee.findById(employeeId).lean()
      : await Employee.findOne({ employeeId }).lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    const emp = employee as Record<string, unknown>;
    const department = emp.department as string;
    const jobTitle = emp.jobTitle as string;
    const empId = String(emp._id);
    const empName = `${emp.firstName} ${emp.lastName}`;

    // Find published translation for department
    const translation = await StrategyTranslation.findOne({
      department,
      status: "published",
    })
      .sort({ version: -1 })
      .lean();

    // Find the matching role entry
    let myRole = null;
    if (translation) {
      const t = translation as Record<string, unknown>;
      const roles = t.roles as { jobTitle: string; level: string; contributions: unknown[]; behaviors: unknown[]; decisionRights: unknown }[];

      // Exact title match first
      myRole = roles.find((r) => r.jobTitle.toLowerCase() === jobTitle.toLowerCase());

      // Fallback: match by inferred level
      if (!myRole) {
        const level = inferRoleLevel(jobTitle);
        myRole = roles.find((r) => r.level === level);
      }
    }

    // Load strategy goals for context
    const companyGoals = await StrategyGoal.find({
      scope: "company",
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1 })
      .lean();

    const departmentGoals = await StrategyGoal.find({
      scope: "department",
      department,
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1 })
      .lean();

    // Manager data: direct reports + their translations
    const directReports = await Employee.find({
      managerName: { $regex: new RegExp(empName, "i") },
      status: "active",
    }).lean();

    const teamData = [];
    for (const report of directReports) {
      const r = report as Record<string, unknown>;
      const rDept = r.department as string;
      const rTitle = r.jobTitle as string;
      const rId = String(r._id);

      // Find their translation
      let reportTranslation = null;
      if (rDept === department && translation) {
        const t = translation as Record<string, unknown>;
        const roles = t.roles as { jobTitle: string; level: string; contributions: { strategyGoalTitle: string; roleContribution: string }[] }[];
        reportTranslation = roles.find(
          (role) => role.jobTitle.toLowerCase() === rTitle.toLowerCase(),
        );
      } else {
        const otherTranslation = await StrategyTranslation.findOne({
          department: rDept,
          status: "published",
        }).lean();
        if (otherTranslation) {
          const ot = otherTranslation as Record<string, unknown>;
          const roles = ot.roles as { jobTitle: string; level: string; contributions: { strategyGoalTitle: string; roleContribution: string }[] }[];
          reportTranslation = roles.find(
            (role) => role.jobTitle.toLowerCase() === rTitle.toLowerCase(),
          );
        }
      }

      // Get active goal support agreements
      const activeGoals = await Goal.find({
        owner: rId,
        status: "active",
        supportAgreement: { $ne: "" },
      })
        .select("objectiveStatement supportAgreement")
        .lean();

      teamData.push({
        id: rId,
        name: `${r.firstName} ${r.lastName}`,
        jobTitle: rTitle,
        department: rDept,
        hasTranslation: !!reportTranslation,
        primaryContribution: reportTranslation?.contributions?.[0]?.roleContribution ?? null,
        supportAgreements: activeGoals.map((g) => ({
          goal: (g as Record<string, unknown>).objectiveStatement as string,
          support: (g as Record<string, unknown>).supportAgreement as string,
        })),
      });
    }

    // HR data: all departments' translation status
    const allDepartments = await Employee.distinct("department", { status: "active" });
    const allTranslations = await StrategyTranslation.find({ status: "published" })
      .select("department version updatedAt")
      .lean();

    const deptStatus = (allDepartments as string[]).filter(Boolean).map((d) => {
      const t = allTranslations.find(
        (tr) => (tr as Record<string, unknown>).department === d,
      );
      return {
        department: d,
        hasTranslation: !!t,
        version: t ? (t as Record<string, unknown>).version : null,
        updatedAt: t ? (t as Record<string, unknown>).updatedAt : null,
      };
    });

    return NextResponse.json({
      success: true,
      employee: {
        id: empId,
        name: empName,
        jobTitle,
        department,
        isManager: directReports.length > 0,
      },
      myRole,
      companyGoals: companyGoals.map((g) => {
        const goal = g as Record<string, unknown>;
        return {
          id: String(goal._id),
          title: goal.title,
          horizon: goal.horizon,
          status: goal.status,
        };
      }),
      departmentGoals: departmentGoals.map((g) => {
        const goal = g as Record<string, unknown>;
        return {
          id: String(goal._id),
          title: goal.title,
          horizon: goal.horizon,
          status: goal.status,
        };
      }),
      team: teamData,
      departmentTranslationStatus: deptStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("My strategy GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to load strategy" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/app/api/plan/my-strategy/route.ts
git commit -m "feat(api): add personalized strategy translation lookup endpoint"
```

---

### Task 2: Strategy Contribution Card

**Files:**
- Create: `apps/platform/src/components/plan/strategy-contribution-card.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { cn } from "@ascenta/ui";

interface StrategyContributionCardProps {
  strategyGoalTitle: string;
  horizon?: string;
  roleContribution: string;
  outcomes: string[];
  behaviors?: { valueName: string; expectation: string }[];
  alignmentDescriptors?: { strong: string; acceptable: string; poor: string };
  showAlignment?: boolean;
  accentColor: string;
}

const HORIZON_LABELS: Record<string, string> = {
  long_term: "Long-term",
  medium_term: "Mid-range",
  short_term: "Short-term",
};

export function StrategyContributionCard({
  strategyGoalTitle,
  horizon,
  roleContribution,
  outcomes,
  behaviors,
  alignmentDescriptors,
  showAlignment = false,
  accentColor,
}: StrategyContributionCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      {/* Priority header */}
      <div className="flex items-center gap-2">
        <div
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h4 className="font-display text-sm font-bold text-deep-blue flex-1">
          {strategyGoalTitle}
        </h4>
        {horizon && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {HORIZON_LABELS[horizon] ?? horizon}
          </span>
        )}
      </div>

      {/* Role contribution */}
      <p className="text-sm text-foreground leading-relaxed">
        {roleContribution}
      </p>

      {/* What success looks like */}
      {outcomes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            What Success Looks Like
          </p>
          <ul className="space-y-1">
            {outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Behaviors */}
      {behaviors && behaviors.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Behaviors Expected
          </p>
          <div className="space-y-1.5">
            {behaviors.map((b, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-foreground">{b.valueName}:</span>{" "}
                <span className="text-muted-foreground">{b.expectation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alignment descriptors (manager/HR only) */}
      {showAlignment && alignmentDescriptors && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(["strong", "acceptable", "poor"] as const).map((level) => (
            <div
              key={level}
              className={cn(
                "rounded-lg p-2.5 text-xs leading-relaxed",
                level === "strong" && "bg-emerald-50 text-emerald-800",
                level === "acceptable" && "bg-amber-50 text-amber-800",
                level === "poor" && "bg-rose-50 text-rose-800",
              )}
            >
              <p className="font-semibold capitalize mb-0.5">{level}</p>
              <p>{alignmentDescriptors[level]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/strategy-contribution-card.tsx
git commit -m "feat(ui): add strategy contribution card component"
```

---

### Task 3: Team Strategy Table

**Files:**
- Create: `apps/platform/src/components/plan/team-strategy-table.tsx`

- [ ] **Step 1: Create component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/team-strategy-table.tsx
git commit -m "feat(ui): add team strategy table for manager view"
```

---

### Task 4: Translation Health Dashboard

**Files:**
- Create: `apps/platform/src/components/plan/translation-health-dashboard.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ascenta/ui/card";
import { Languages, AlertTriangle, Check, Building2 } from "lucide-react";

interface DeptStatus {
  department: string;
  hasTranslation: boolean;
  version: number | null;
  updatedAt: string | null;
}

interface TranslationHealthDashboardProps {
  departments: DeptStatus[];
  accentColor: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: "red" | "green" | "amber";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            highlight === "red"
              ? "text-rose-600"
              : highlight === "green"
                ? "text-emerald-600"
                : highlight === "amber"
                  ? "text-amber-600"
                  : ""
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function TranslationHealthDashboard({
  departments,
  accentColor,
}: TranslationHealthDashboardProps) {
  const total = departments.length;
  const withTranslation = departments.filter((d) => d.hasTranslation).length;
  const missing = total - withTranslation;
  const coverage = total > 0 ? Math.round((withTranslation / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-bold text-deep-blue">
        Translation Health
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="Coverage"
          value={`${coverage}%`}
          icon={Languages}
          highlight={coverage === 100 ? "green" : coverage >= 50 ? "amber" : "red"}
        />
        <StatCard
          title="Departments Translated"
          value={`${withTranslation} / ${total}`}
          icon={Building2}
        />
        <StatCard
          title="Missing Translations"
          value={missing}
          icon={AlertTriangle}
          highlight={missing > 0 ? "red" : "green"}
        />
      </div>

      {/* Department list */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="divide-y">
          {departments.map((d) => (
            <div key={d.department} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-foreground">{d.department}</span>
              <div className="flex items-center gap-2">
                {d.hasTranslation ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">v{d.version}</span>
                  </>
                ) : (
                  <span className="text-xs text-rose-500 font-medium">Not translated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/translation-health-dashboard.tsx
git commit -m "feat(ui): add translation health dashboard for HR view"
```

---

### Task 5: My Strategy Main View

**Files:**
- Create: `apps/platform/src/components/plan/my-strategy-view.tsx`

- [ ] **Step 1: Create the adaptive view component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Compass } from "lucide-react";
import { useRole } from "@/lib/role/role-context";
import { StrategyContributionCard } from "./strategy-contribution-card";
import { TeamStrategyTable } from "./team-strategy-table";
import { TranslationHealthDashboard } from "./translation-health-dashboard";

const ACCENT_COLOR = "#6688bb";

interface Contribution {
  strategyGoalId: string;
  strategyGoalTitle: string;
  roleContribution: string;
  outcomes: string[];
  alignmentDescriptors: { strong: string; acceptable: string; poor: string };
}

interface MyRole {
  jobTitle: string;
  level: string;
  contributions: Contribution[];
  behaviors: { valueName: string; expectation: string }[];
  decisionRights: { canDecide: string[]; canRecommend: string[]; mustEscalate: string[] };
}

interface TeamMember {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  hasTranslation: boolean;
  primaryContribution: string | null;
  supportAgreements: { goal: string; support: string }[];
}

interface DeptStatus {
  department: string;
  hasTranslation: boolean;
  version: number | null;
  updatedAt: string | null;
}

interface StrategyData {
  employee: { id: string; name: string; jobTitle: string; department: string; isManager: boolean };
  myRole: MyRole | null;
  team: TeamMember[];
  departmentTranslationStatus: DeptStatus[];
}

export function MyStrategyView() {
  const { role, persona, loading: roleLoading } = useRole();
  const [data, setData] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading || !persona?.id) return;

    async function fetchStrategy() {
      try {
        setLoading(true);
        const res = await fetch(`/api/plan/my-strategy?employeeId=${persona!.id}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error ?? "Failed to load");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    fetchStrategy();
  }, [persona?.id, roleLoading]);

  if (loading || roleLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Compass className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Strategy
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  if (!data?.myRole) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Compass className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          No Translation Available
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          A strategic translation hasn&apos;t been published for your department yet.
          {role === "hr" && " Go to Strategy Studio → Translations to generate one."}
        </p>
      </div>
    );
  }

  const { employee, myRole, team, departmentTranslationStatus } = data;
  const isManager = role === "manager" || employee.isManager;
  const isHR = role === "hr";
  const showAlignment = isManager || isHR;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HR: Translation health first */}
        {isHR && departmentTranslationStatus.length > 0 && (
          <TranslationHealthDashboard
            departments={departmentTranslationStatus}
            accentColor={ACCENT_COLOR}
          />
        )}

        {/* Header */}
        <div>
          <p
            className="font-display text-[11px] font-semibold uppercase tracking-[0.08em] mb-1"
            style={{ color: ACCENT_COLOR }}
          >
            What This Means For You
          </p>
          <h2 className="font-display text-xl font-bold text-deep-blue">
            {employee.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {employee.jobTitle} · {employee.department}
          </p>
        </div>

        {/* Strategy Connection — contributions per priority */}
        <div className="space-y-4">
          <h3 className="font-display text-sm font-bold text-deep-blue">
            Strategy Connection
          </h3>
          {myRole.contributions.map((c, i) => (
            <StrategyContributionCard
              key={i}
              strategyGoalTitle={c.strategyGoalTitle}
              roleContribution={c.roleContribution}
              outcomes={c.outcomes}
              behaviors={myRole.behaviors}
              alignmentDescriptors={c.alignmentDescriptors}
              showAlignment={showAlignment}
              accentColor={ACCENT_COLOR}
            />
          ))}
        </div>

        {/* Decision Clarity */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold text-deep-blue mb-3">
            Decision Clarity
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-2">You Can Decide</p>
              <ul className="space-y-1">
                {myRole.decisionRights.canDecide.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-2">You Can Recommend</p>
              <ul className="space-y-1">
                {myRole.decisionRights.canRecommend.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-700 mb-2">Must Escalate</p>
              <ul className="space-y-1">
                {myRole.decisionRights.mustEscalate.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Manager: Team overview */}
        {isManager && team.length > 0 && (
          <TeamStrategyTable team={team} accentColor={ACCENT_COLOR} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/platform/src/components/plan/my-strategy-view.tsx
git commit -m "feat(ui): add adaptive My Strategy view with role-based sections"
```

---

### Task 6: Page Route + Navigation

**Files:**
- Create: `apps/platform/src/app/my-strategy/page.tsx`
- Modify: `apps/platform/src/lib/constants/dashboard-nav.ts`

- [ ] **Step 1: Create the page**

```tsx
"use client";

import { MyStrategyView } from "@/components/plan/my-strategy-view";

export default function MyStrategyPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MyStrategyView />
    </div>
  );
}
```

- [ ] **Step 2: Add nav entry**

In `apps/platform/src/lib/constants/dashboard-nav.ts`, find the `plan` category in `DASHBOARD_NAV` and add a sub-page. In the `subPages` array of the `plan` category, add:

```ts
      { key: "my-strategy", label: "My Strategy", icon: Compass },
```

Also, in the `PAGE_CONFIG` object (search for where page configs are defined), add an entry for `my-strategy`:

```ts
  "my-strategy": {
    description: "See how company strategy translates to your role.",
    tabs: [],
    suggestions: [],
    tools: [],
  },
```

- [ ] **Step 3: Commit**

```bash
git add apps/platform/src/app/my-strategy/page.tsx apps/platform/src/lib/constants/dashboard-nav.ts
git commit -m "feat(nav): add My Strategy page and navigation entry"
```

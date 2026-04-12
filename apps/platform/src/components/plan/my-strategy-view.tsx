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
          {role === "hr" && " Go to Strategy Studio \u2192 Translations to generate one."}
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
            {employee.jobTitle} &middot; {employee.department}
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
                  <li key={i} className="text-sm text-muted-foreground">&bull; {d}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-2">You Can Recommend</p>
              <ul className="space-y-1">
                {myRole.decisionRights.canRecommend.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">&bull; {d}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-700 mb-2">Must Escalate</p>
              <ul className="space-y-1">
                {myRole.decisionRights.mustEscalate.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground">&bull; {d}</li>
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

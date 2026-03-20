"use client";

import { useEffect, useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { GoalCard } from "@/components/grow/goal-card";

interface GoalData {
  id: string;
  title: string;
  description: string;
  category: string;
  measurementType: string;
  successMetric: string;
  timePeriod: { start: string; end: string };
  checkInCadence: string;
  alignment: string;
  status: string;
  lastCheckInDate: string | null;
  createdAt: string;
}

interface GoalsPanelProps {
  accentColor: string;
}

export function GoalsPanel({ accentColor }: GoalsPanelProps) {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        setError(null);

        // Look up the mock user (first employee matching "Jason")
        const empRes = await fetch("/api/dashboard/employees?search=Jason&limit=1");
        const empData = await empRes.json();

        if (!empData.employees || empData.employees.length === 0) {
          setError("No employee found. Run `pnpm db:seed` to populate employees.");
          setLoading(false);
          return;
        }

        const employee = empData.employees[0];
        const employeeId = employee.id ?? employee._id;
        setEmployeeInfo({
          id: employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
        });

        // Fetch goals for this employee
        const goalsRes = await fetch(`/api/grow/goals?employeeId=${employeeId}`);
        const goalsData = await goalsRes.json();

        if (goalsData.success) {
          setGoals(goalsData.goals ?? []);
        } else {
          setError(goalsData.error ?? "Failed to fetch goals");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load goals");
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Target className="size-10 text-muted-foreground/30 mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          Unable to Load Goals
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-deep-blue">
            My Goals
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {employeeInfo?.name ? `${employeeInfo.name} — ` : ""}
            {activeGoals.length} active goal{activeGoals.length !== 1 ? "s" : ""}
            {completedGoals.length > 0 && `, ${completedGoals.length} completed`}
          </p>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No Goals Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Use the Do chat to create your first goal. Goals you create will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
            ))}
            {completedGoals.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 pb-1">
                  Completed
                </p>
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

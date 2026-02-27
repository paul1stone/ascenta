"use client";

import { useState } from "react";
import {
  Target,
  CheckCircle,
  FileText,
  List,
  Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants/dashboard-nav";
import { CompassNav } from "@/components/compass-nav";
import { GoalForm } from "@/components/grow/goal-form";
import { GoalList } from "@/components/grow/goal-list";
import { PerformanceNoteForm } from "@/components/grow/performance-note-form";
import { CheckInForm } from "@/components/grow/check-in-form";
import { CheckInList } from "@/components/grow/check-in-list";

// ============================================================================
// GROW ACTION CARDS
// ============================================================================

interface GrowAction {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const GROW_ACTIONS: GrowAction[] = [
  {
    key: "create-goal",
    label: "Create Goal",
    description: "Set a new performance goal",
    icon: Target,
  },
  {
    key: "log-checkin",
    label: "Log Check-In",
    description: "Record progress on a goal",
    icon: CheckCircle,
  },
  {
    key: "add-note",
    label: "Add Note",
    description: "Capture a performance observation",
    icon: FileText,
  },
  {
    key: "view-goals",
    label: "View Goals",
    description: "See all goals and progress",
    icon: List,
  },
  {
    key: "view-checkins",
    label: "View Check-Ins",
    description: "Upcoming and past check-ins",
    icon: Calendar,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface ChatWelcomeProps {
  selectedCategory: string | null;
  onCategorySelect?: (key: string) => void;
}

export function ChatWelcome({ selectedCategory: selectedCategoryKey, onCategorySelect }: ChatWelcomeProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const selectedCategory = selectedCategoryKey
    ? DASHBOARD_NAV.find((c) => c.key === selectedCategoryKey)
    : null;

  function renderActiveActionComponent() {
    switch (activeAction) {
      case "create-goal":
        return (
          <GoalForm
            onSuccess={() => setActiveAction(null)}
            onCancel={() => setActiveAction(null)}
          />
        );
      case "view-goals":
        return <GoalList onBack={() => setActiveAction(null)} />;
      case "add-note":
        return (
          <PerformanceNoteForm
            onSuccess={() => setActiveAction(null)}
            onCancel={() => setActiveAction(null)}
          />
        );
      case "log-checkin":
        return (
          <CheckInForm
            onSuccess={() => setActiveAction(null)}
            onCancel={() => setActiveAction(null)}
          />
        );
      case "view-checkins":
        return <CheckInList onBack={() => setActiveAction(null)} />;
      default:
        return null;
    }
  }

  // --------------------------------------------------------------------------
  // No category selected: welcome screen with category cards
  // --------------------------------------------------------------------------
  if (!selectedCategoryKey) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full overflow-hidden">
        <CompassNav
          size={680}
          selected={null}
          onSelect={(key) => onCategorySelect?.(key)}
        />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Non-Grow categories: coming soon
  // --------------------------------------------------------------------------
  if (selectedCategoryKey !== "grow" || !selectedCategory) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl text-center">
          <p className="text-sm text-muted-foreground">
            Coming soon &mdash; {selectedCategory?.label ?? "This section"}{" "}
            features are in development.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Grow category: action cards
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold text-deep-blue">Grow</h2>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {GROW_ACTIONS.map((action) => (
            <button
              key={action.key}
              onClick={() => setActiveAction(action.key)}
              className={`group flex flex-col items-center gap-2.5 rounded-2xl border-2 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-summit/5 ${
                activeAction === action.key
                  ? "border-summit shadow-md shadow-summit/10"
                  : "border-transparent hover:border-summit/30"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-deep-blue to-deep-blue/80 shadow-md shadow-deep-blue/15 transition-transform group-hover:scale-105">
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-deep-blue">
                {action.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {action.description}
              </span>
            </button>
          ))}
        </div>

        {activeAction && (
          <div className="mt-6">{renderActiveActionComponent()}</div>
        )}
      </div>
    </div>
  );
}

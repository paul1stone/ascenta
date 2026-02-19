"use client";

import { useState } from "react";
import { Mountain } from "lucide-react";
import { PAGE_CONFIG, type PageConfig } from "@/lib/constants/dashboard-nav";

const tabs = ["Employee Relations", "Workflows", "Leadership Library"] as const;
type Tab = (typeof tabs)[number];

const employeeRelationsItems = [
  {
    title: "Corrective action",
    description: "Help me write a corrective action for an employee",
  },
  {
    title: "Performance improvement plan",
    description: "PLACEHOLDER: Draft a PIP for an underperforming employee",
  },
  {
    title: "Workplace investigation",
    description: "PLACEHOLDER: Guide me through a workplace investigation",
  },
  {
    title: "Accommodation request",
    description: "PLACEHOLDER: Process an ADA accommodation request",
  },
];

const workflowChecklists = [
  {
    heading: "New Hire Onboarding",
    items: [
      { id: "onboard-offer", label: "Offer letter sent" },
      { id: "onboard-bg", label: "Background check initiated" },
      { id: "onboard-equip", label: "Equipment provisioned" },
      { id: "onboard-schedule", label: "First-day schedule created" },
    ],
  },
  {
    heading: "Offboarding",
    items: [
      { id: "offboard-exit", label: "Exit interview scheduled" },
      { id: "offboard-access", label: "Access revocation requested" },
      { id: "offboard-pay", label: "Final paycheck processed" },
      { id: "offboard-equip", label: "Equipment return coordinated" },
    ],
  },
];

const leadershipLibraryItems = [
  {
    title: "Manager coaching",
    description: "PLACEHOLDER: Tips for giving constructive feedback",
  },
  {
    title: "Conflict resolution",
    description: "PLACEHOLDER: How to mediate a team conflict",
  },
  {
    title: "Team building",
    description: "PLACEHOLDER: Activities for improving team cohesion",
  },
  {
    title: "Difficult conversations",
    description: "PLACEHOLDER: Script for delivering tough news",
  },
];

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
  subPage?: string;
}

function SubPageWelcome({
  config,
  onSuggestionClick,
}: {
  config: PageConfig;
  onSuggestionClick: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-deep-blue to-deep-blue/80 shadow-lg shadow-deep-blue/20">
          <Mountain className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-deep-blue">
          {config.title}
        </h1>
        <p className="mt-2 text-center text-muted-foreground max-w-md">
          {config.description}
        </p>
      </div>
      <div className="w-full max-w-2xl grid grid-cols-1 gap-3 sm:grid-cols-2">
        {config.suggestions.map((item) => (
          <button
            key={item.title}
            onClick={() => onSuggestionClick(item.prompt)}
            className="group flex flex-col gap-1 rounded-2xl border border-border bg-white p-4 text-left transition-all hover:border-summit/30 hover:shadow-lg hover:shadow-summit/5 hover:-translate-y-0.5"
          >
            <p className="font-medium text-deep-blue">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatWelcome({ onSuggestionClick, subPage }: ChatWelcomeProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Employee Relations");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // If a sub-page is active, show contextual suggestions
  if (subPage && PAGE_CONFIG[subPage]) {
    return (
      <SubPageWelcome
        config={PAGE_CONFIG[subPage]}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  const toggleChecked = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-deep-blue to-deep-blue/80 shadow-lg shadow-deep-blue/20">
          <Mountain className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-deep-blue">
          Welcome to Ascenta
        </h1>
        <p className="mt-2 text-center text-muted-foreground max-w-md">
          Your AI-powered HR assistant. Ask me anything about policies,
          workflows, compliance, and more.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-summit text-white"
                : "bg-white text-deep-blue border border-border hover:bg-summit/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="w-full max-w-2xl">
        {activeTab === "Employee Relations" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {employeeRelationsItems.map((item) => (
              <button
                key={item.title}
                onClick={() => onSuggestionClick(item.description)}
                className="group flex flex-col gap-1 rounded-2xl border border-border bg-white p-4 text-left transition-all hover:border-summit/30 hover:shadow-lg hover:shadow-summit/5 hover:-translate-y-0.5"
              >
                <p className="font-medium text-deep-blue">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        )}

        {activeTab === "Workflows" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {workflowChecklists.map((checklist) => (
              <div
                key={checklist.heading}
                className="rounded-2xl border border-border bg-white p-4"
              >
                <h3 className="mb-3 font-semibold text-deep-blue">
                  {checklist.heading}
                </h3>
                <ul className="space-y-2">
                  {checklist.items.map((item) => {
                    const isChecked = !!checked[item.id];
                    return (
                      <li key={item.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecked(item.id)}
                          className="h-4 w-4 shrink-0 rounded border-gray-300 accent-summit cursor-pointer"
                        />
                        <button
                          onClick={() => onSuggestionClick(item.label)}
                          className={`text-sm text-left transition-colors hover:text-summit ${
                            isChecked
                              ? "line-through text-muted-foreground"
                              : "text-deep-blue"
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Leadership Library" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {leadershipLibraryItems.map((item) => (
              <button
                key={item.title}
                onClick={() => onSuggestionClick(item.description)}
                className="group flex flex-col gap-1 rounded-2xl border border-border bg-white p-4 text-left transition-all hover:border-summit/30 hover:shadow-lg hover:shadow-summit/5 hover:-translate-y-0.5"
              >
                <p className="font-medium text-deep-blue">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

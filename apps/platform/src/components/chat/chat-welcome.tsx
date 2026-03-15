"use client";

import { useState } from "react";
import {
  DASHBOARD_NAV,
  PAGE_CONFIG,
  DEFAULT_PAGE_CONFIG,
} from "@/lib/constants/dashboard-nav";

// TODO: Replace with real auth user once authentication is implemented
const USER_FIRST_NAME = "Paul";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(
    null
  );
  const [activeSubPageKey, setActiveSubPageKey] = useState("");

  const selectedCategory = DASHBOARD_NAV.find(
    (c) => c.key === selectedCategoryKey
  );

  // Determine which suggestions to show
  const config = activeSubPageKey
    ? PAGE_CONFIG[activeSubPageKey]
    : DEFAULT_PAGE_CONFIG;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Category icon cards (replaces logo) */}
      <div className="mb-6 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {DASHBOARD_NAV.map((category) => {
          const isSelected = selectedCategoryKey === category.key;
          return (
            <button
              key={category.key}
              onClick={() => {
                if (isSelected) {
                  setSelectedCategoryKey(null);
                  setActiveSubPageKey("");
                } else {
                  setSelectedCategoryKey(category.key);
                  setActiveSubPageKey(category.subPages[0]?.key || "");
                }
              }}
              className={`group flex flex-col items-center gap-2.5 rounded-2xl border-2 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-summit/5 ${
                isSelected
                  ? "border-summit shadow-md shadow-summit/10"
                  : "border-transparent hover:border-summit/30"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105 ${
                  isSelected
                    ? "bg-gradient-to-br from-summit to-summit-hover shadow-summit/20"
                    : "bg-gradient-to-br from-deep-blue to-deep-blue/80 shadow-deep-blue/15"
                }`}
              >
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <span
                className={`text-xs font-semibold ${
                  isSelected ? "text-summit" : "text-deep-blue"
                }`}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Greeting */}
      <div className="mb-6 flex flex-col items-center">
        <h1 className="font-display text-2xl font-bold text-deep-blue">
          Welcome {USER_FIRST_NAME}
        </h1>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          Choose from a suggested prompt, or ask anything to get started.
        </p>
      </div>

      {/* Sub-page pill tabs (only when a category is selected) */}
      {selectedCategory && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {selectedCategory.subPages.map((sp) => {
            const isActive = activeSubPageKey === sp.key;
            return (
              <button
                key={sp.key}
                onClick={() => setActiveSubPageKey(sp.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-summit text-white"
                    : "border border-border bg-white text-deep-blue hover:bg-summit/10"
                }`}
              >
                {sp.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Description */}
      {config && selectedCategory && config.description && (
        <div className="w-full max-w-2xl">
          <p className="mb-3 text-center text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { Mountain, FileText, Users, Calendar, Shield } from "lucide-react";

const suggestions = [
  {
    icon: FileText,
    title: "Corrective action",
    description: "Help me make a corrective action for John Smith",
  },
  {
    icon: Users,
    title: "Onboarding help",
    description: "New hire checklist for engineering",
  },
  {
    icon: Calendar,
    title: "PTO question",
    description: "Calculate remaining vacation days",
  },
  {
    icon: Shield,
    title: "Compliance check",
    description: "FMLA eligibility requirements",
  },
];

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
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

      {/* Suggestion cards */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            onClick={() => onSuggestionClick(suggestion.description)}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-white p-4 text-left transition-all hover:border-summit/30 hover:shadow-lg hover:shadow-summit/5 hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-summit/10 text-summit transition-colors group-hover:bg-summit group-hover:text-white">
              <suggestion.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-deep-blue">{suggestion.title}</p>
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

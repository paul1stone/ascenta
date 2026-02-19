import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  Shield,
  Magnet,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Scale,
  Target,
  Heart,
  Award,
} from "lucide-react";

// ============================================================================
// NAV TYPES
// ============================================================================

export interface SubPage {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface NavCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  subPages: SubPage[];
}

// ============================================================================
// NAV DATA
// ============================================================================

export const DASHBOARD_NAV: NavCategory[] = [
  {
    key: "launch",
    label: "Launch",
    icon: Rocket,
    subPages: [
      { key: "launch/onboarding", label: "Onboarding", icon: UserPlus },
      { key: "launch/training", label: "Training Plans", icon: BookOpen },
      { key: "launch/probation", label: "Probation Review", icon: ClipboardCheck },
    ],
  },
  {
    key: "protect",
    label: "Protect",
    icon: Shield,
    subPages: [
      { key: "protect/warnings", label: "Written Warnings", icon: AlertTriangle },
      { key: "protect/pip", label: "PIP Management", icon: FileText },
      { key: "protect/compliance", label: "Compliance", icon: Scale },
    ],
  },
  {
    key: "attract",
    label: "Attract",
    icon: Magnet,
    subPages: [
      { key: "attract/recruitment", label: "Recruitment", icon: Target },
      { key: "attract/engagement", label: "Engagement", icon: Heart },
      { key: "attract/recognition", label: "Recognition", icon: Award },
    ],
  },
];

// ============================================================================
// SUB-PAGE TITLES
// ============================================================================

export const SUB_PAGE_TITLES: Record<string, string> = {
  "launch/onboarding": "Onboarding",
  "launch/training": "Training Plans",
  "launch/probation": "Probation Review",
  "protect/warnings": "Written Warnings",
  "protect/pip": "PIP Management",
  "protect/compliance": "Compliance",
  "attract/recruitment": "Recruitment",
  "attract/engagement": "Engagement",
  "attract/recognition": "Recognition",
};

// ============================================================================
// PAGE CONFIGS (contextual chat suggestions)
// ============================================================================

export interface PageConfig {
  title: string;
  description: string;
  suggestions: { title: string; prompt: string }[];
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  "launch/onboarding": {
    title: "Onboarding",
    description: "Set up new hires for success with structured onboarding workflows.",
    suggestions: [
      { title: "Create onboarding plan", prompt: "Help me create an onboarding plan for a new employee" },
      { title: "First-day checklist", prompt: "Generate a first-day checklist for a new hire" },
      { title: "30-60-90 day plan", prompt: "Draft a 30-60-90 day onboarding plan" },
      { title: "Welcome email", prompt: "Write a welcome email for a new team member" },
    ],
  },
  "launch/training": {
    title: "Training Plans",
    description: "Build and manage training programs for employee development.",
    suggestions: [
      { title: "Training curriculum", prompt: "Help me design a training curriculum for a new role" },
      { title: "Skills assessment", prompt: "Create a skills gap assessment template" },
      { title: "Learning objectives", prompt: "Draft learning objectives for a training program" },
      { title: "Training schedule", prompt: "Build a training schedule for the first quarter" },
    ],
  },
  "launch/probation": {
    title: "Probation Review",
    description: "Manage probationary periods with structured reviews and documentation.",
    suggestions: [
      { title: "Probation review", prompt: "Help me write a probation period review" },
      { title: "Performance criteria", prompt: "Define probation performance criteria for a role" },
      { title: "Extension notice", prompt: "Draft a probation extension notice" },
      { title: "Confirmation letter", prompt: "Write a probation confirmation letter" },
    ],
  },
  "protect/warnings": {
    title: "Written Warnings",
    description: "Issue and manage written warnings with proper documentation and compliance.",
    suggestions: [
      { title: "Draft a written warning", prompt: "Help me write a corrective action for an employee" },
      { title: "Attendance warning", prompt: "Draft a written warning for attendance issues" },
      { title: "Conduct warning", prompt: "Write a written warning for a code of conduct violation" },
      { title: "Final warning", prompt: "Draft a final written warning before termination" },
    ],
  },
  "protect/pip": {
    title: "PIP Management",
    description: "Create and manage Performance Improvement Plans with clear goals and timelines.",
    suggestions: [
      { title: "Create a PIP", prompt: "Draft a Performance Improvement Plan for an underperforming employee" },
      { title: "PIP progress review", prompt: "Help me write a PIP mid-point progress review" },
      { title: "PIP completion", prompt: "Draft a PIP completion assessment" },
      { title: "PIP goals", prompt: "Help me define measurable PIP goals and milestones" },
    ],
  },
  "protect/compliance": {
    title: "Compliance",
    description: "Ensure HR processes meet legal and regulatory requirements.",
    suggestions: [
      { title: "Policy audit", prompt: "Help me audit our HR policies for compliance gaps" },
      { title: "Documentation review", prompt: "Review our employee documentation for compliance issues" },
      { title: "Regulatory update", prompt: "What recent labor law changes should I be aware of?" },
      { title: "Accommodation request", prompt: "Guide me through processing an ADA accommodation request" },
    ],
  },
  "attract/recruitment": {
    title: "Recruitment",
    description: "Streamline hiring with job postings, screening, and offer management.",
    suggestions: [
      { title: "Job description", prompt: "Help me write a job description for a new role" },
      { title: "Interview questions", prompt: "Generate structured interview questions for a role" },
      { title: "Offer letter", prompt: "Draft an offer letter for a new hire" },
      { title: "Candidate scorecard", prompt: "Create a candidate evaluation scorecard" },
    ],
  },
  "attract/engagement": {
    title: "Engagement",
    description: "Boost employee satisfaction, retention, and workplace culture.",
    suggestions: [
      { title: "Engagement survey", prompt: "Help me design an employee engagement survey" },
      { title: "Stay interview", prompt: "Draft stay interview questions for key employees" },
      { title: "Action plan", prompt: "Create an action plan from engagement survey results" },
      { title: "Recognition program", prompt: "Help me design an employee recognition program" },
    ],
  },
  "attract/recognition": {
    title: "Recognition",
    description: "Celebrate achievements and build a culture of appreciation.",
    suggestions: [
      { title: "Award nomination", prompt: "Help me write an employee award nomination" },
      { title: "Milestone celebration", prompt: "Plan a work anniversary milestone celebration" },
      { title: "Team shoutout", prompt: "Write a team recognition announcement for a project win" },
      { title: "Peer recognition", prompt: "Design a peer-to-peer recognition program" },
    ],
  },
};

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  title: "Ascenta",
  description: "Your AI-powered HR assistant.",
  suggestions: [
    { title: "Written warning", prompt: "Help me write a corrective action for an employee" },
    { title: "Performance plan", prompt: "Draft a PIP for an underperforming employee" },
    { title: "Policy question", prompt: "What is our policy on remote work?" },
    { title: "Employee lookup", prompt: "Look up information about an employee" },
  ],
};

// ============================================================================
// TAB TYPES
// ============================================================================

export type TabKey = "do" | "learn" | "status" | "insights";

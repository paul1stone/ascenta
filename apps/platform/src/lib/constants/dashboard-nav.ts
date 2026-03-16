import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  Shield,
  Magnet,
  Compass,
  Heart,
  TrendingUp,
  BarChart3,
  BookOpen,
  Play,
  Lightbulb,
  Building2,
  Users,
  Target,
  FileSearch,
  MessageSquareText,
  Gavel,
  Handshake,
  GraduationCap,
  Library,
  CalendarCheck,
  ClipboardList,
  Wrench,
  Gift,
  BadgeDollarSign,
  CalendarDays,
  ShieldAlert,
  FolderSearch,
  FileText,
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
  color: string;
  subPages: SubPage[];
}

// ============================================================================
// NAV DATA
// ============================================================================

export const DASHBOARD_NAV: NavCategory[] = [
  {
    key: "plan",
    label: "Plan",
    icon: Compass,
    color: "#6688bb",
    subPages: [
      { key: "plan/strategy-studio", label: "Strategy Studio", icon: Lightbulb },
      { key: "plan/org-design", label: "Org Design & Operating Model", icon: Building2 },
      { key: "plan/workforce-planning", label: "Workforce Planning & Analytics", icon: Users },
      { key: "plan/goals-rhythm", label: "Goals & Operating Rhythm", icon: Target },
    ],
  },
  {
    key: "attract",
    label: "Attract",
    icon: Magnet,
    color: "#aa8866",
    subPages: [
      { key: "attract/requisition", label: "Requisition & Role Intake", icon: FileSearch },
      { key: "attract/interview-kits", label: "Interview Kits & Scorecards", icon: ClipboardList },
      { key: "attract/debrief", label: "Debrief & Decision", icon: MessageSquareText },
      { key: "attract/offer", label: "Offer & Pre-Hire", icon: Handshake },
    ],
  },
  {
    key: "launch",
    label: "Launch",
    icon: Rocket,
    color: "#bb6688",
    subPages: [
      { key: "launch/day-one", label: "Day One Ready", icon: CalendarCheck },
      { key: "launch/ramp-plans", label: "30-60-90 Ramp Plans", icon: TrendingUp },
      { key: "launch/training", label: "Training & Enablement", icon: GraduationCap },
      { key: "launch/provisioning", label: "Access & Equipment", icon: Wrench },
    ],
  },
  {
    key: "grow",
    label: "Grow",
    icon: TrendingUp,
    color: "#44aa99",
    subPages: [
      { key: "grow/performance", label: "Performance System", icon: BarChart3 },
      { key: "grow/coaching", label: "Coaching & Corrective Action", icon: Gavel },
      { key: "grow/learning", label: "Learning & Development", icon: GraduationCap },
      { key: "grow/leadership-library", label: "Leadership Library", icon: Library },
    ],
  },
  {
    key: "care",
    label: "Care",
    icon: Heart,
    color: "#cc6677",
    subPages: [
      { key: "care/total-rewards", label: "Total Rewards", icon: Gift },
      { key: "care/benefits", label: "Benefits Hub", icon: BadgeDollarSign },
      { key: "care/leave", label: "Leave & Benefits Orchestrator", icon: CalendarDays },
    ],
  },
  {
    key: "protect",
    label: "Protect",
    icon: Shield,
    color: "#8888aa",
    subPages: [
      { key: "protect/feedback", label: "Protected Feedback", icon: ShieldAlert },
      { key: "protect/case-management", label: "Employee Case Management", icon: FolderSearch },
    ],
  },
];

// ============================================================================
// SUB-PAGE TITLES
// ============================================================================

export const SUB_PAGE_TITLES: Record<string, string> = {
  "plan/strategy-studio": "Strategy Studio",
  "plan/org-design": "Org Design & Operating Model",
  "plan/workforce-planning": "Workforce Planning & Analytics",
  "plan/goals-rhythm": "Goals & Operating Rhythm",
  "attract/requisition": "Requisition & Role Intake",
  "attract/interview-kits": "Interview Kits & Scorecards",
  "attract/debrief": "Debrief & Decision",
  "attract/offer": "Offer & Pre-Hire",
  "launch/day-one": "Day One Ready",
  "launch/ramp-plans": "30-60-90 Ramp Plans",
  "launch/training": "Training & Enablement",
  "launch/provisioning": "Access & Equipment",
  "grow/performance": "Performance System",
  "grow/coaching": "Coaching & Corrective Action",
  "grow/learning": "Learning & Development",
  "grow/leadership-library": "Leadership Library",
  "care/total-rewards": "Total Rewards",
  "care/benefits": "Benefits Hub",
  "care/leave": "Leave & Benefits Orchestrator",
  "protect/feedback": "Protected Feedback",
  "protect/case-management": "Employee Case Management",
};

// ============================================================================
// PAGE CONFIGS (contextual chat suggestions)
// ============================================================================

export interface ToolSuggestion {
  label: string;
  promptTemplate: string;
}

export interface PageTool {
  key: string;
  label: string;
  icon: LucideIcon;
  promptSuggestions?: ToolSuggestion[];
}

export interface PageConfig {
  title: string;
  description: string;
  tools?: PageTool[];
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  "plan/strategy-studio": {
    title: "Strategy Studio",
    description: "Define and align your people strategy with business objectives.",
  },
  "plan/org-design": {
    title: "Org Design & Operating Model",
    description: "Design organizational structures and operating models for effectiveness.",
  },
  "plan/workforce-planning": {
    title: "Workforce Planning & Analytics",
    description: "Forecast workforce needs and leverage people analytics for decisions.",
  },
  "plan/goals-rhythm": {
    title: "Goals & Operating Rhythm",
    description: "Set organizational goals and establish a consistent operating cadence.",
  },
  "attract/requisition": {
    title: "Requisition & Role Intake",
    description: "Streamline job requisitions and role definition for effective hiring.",
  },
  "attract/interview-kits": {
    title: "Interview Kits & Scorecards",
    description: "Build structured interview processes with consistent evaluation criteria.",
  },
  "attract/debrief": {
    title: "Debrief & Decision",
    description: "Facilitate hiring debriefs and make data-driven selection decisions.",
  },
  "attract/offer": {
    title: "Offer & Pre-Hire",
    description: "Manage offer creation, negotiation, and pre-hire processes.",
  },
  "launch/day-one": {
    title: "Day One Ready",
    description: "Ensure every new hire has a seamless, organized first day.",
  },
  "launch/ramp-plans": {
    title: "30-60-90 Ramp Plans",
    description: "Structure the first 90 days for new hires to accelerate productivity.",
  },
  "launch/training": {
    title: "Training & Enablement",
    description: "Build and manage training programs for new hire enablement.",
  },
  "launch/provisioning": {
    title: "Access & Equipment",
    description: "Manage system access, equipment, and tooling provisioning for new hires.",
  },
  "grow/performance": {
    title: "Performance System",
    description: "Manage performance reviews, goals, and check-ins for continuous growth.",
    tools: [
      {
        key: "startGoalCreation",
        label: "Create Goal",
        icon: Target,
        promptSuggestions: [
          { label: "Goal from job description", promptTemplate: "Create a goal for {{directReport}} based on their job description" },
          { label: "Leadership development goal", promptTemplate: "Create a development goal for {{directReport}} focused on leadership skills" },
          { label: "Q2 performance goals", promptTemplate: "Set up Q2 performance goals for {{directReport}} aligned to department objectives" },
        ],
      },
      {
        key: "startCheckIn",
        label: "Run Check-in",
        icon: CalendarCheck,
        promptSuggestions: [
          { label: "Weekly check-in", promptTemplate: "Run a weekly check-in with {{directReport}}" },
          { label: "Goal progress review", promptTemplate: "Run a check-in with {{directReport}} focused on goal progress" },
          { label: "Mid-quarter review", promptTemplate: "Run a mid-quarter performance check-in with {{directReport}}" },
        ],
      },
      {
        key: "startPerformanceNote",
        label: "Add Note",
        icon: FileText,
        promptSuggestions: [
          { label: "Coaching observation", promptTemplate: "Add a coaching note for {{directReport}} about today's meeting" },
          { label: "Recognition note", promptTemplate: "Add a recognition note for {{directReport}} for outstanding work" },
          { label: "Development observation", promptTemplate: "Add a development note for {{directReport}} on areas for growth" },
        ],
      },
    ],
  },
  "grow/coaching": {
    title: "Coaching & Corrective Action",
    description: "Guide managers through coaching conversations and corrective action workflows.",
  },
  "grow/learning": {
    title: "Learning & Development",
    description: "Build a culture of continuous learning with the Culture Gym and skill development.",
  },
  "grow/leadership-library": {
    title: "Leadership Library",
    description: "Access leadership principles, frameworks, and development resources.",
  },
  "care/total-rewards": {
    title: "Total Rewards",
    description: "Design and communicate comprehensive total rewards packages.",
  },
  "care/benefits": {
    title: "Benefits Hub",
    description: "Manage employee benefits programs and communications.",
  },
  "care/leave": {
    title: "Leave & Benefits Orchestrator",
    description: "Coordinate leave management and benefits administration workflows.",
  },
  "protect/feedback": {
    title: "Protected Feedback",
    description: "Collect and manage sensitive employee feedback with confidentiality protections.",
  },
  "protect/case-management": {
    title: "Employee Case Management",
    description: "Manage employee relations cases with proper documentation and compliance.",
  },
};

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  title: "Ascenta",
  description: "Your AI-powered HR assistant.",
};

// ============================================================================
// NAV HELPERS
// ============================================================================

export function findNavContext(categoryKey: string, subKey: string) {
  const category = DASHBOARD_NAV.find((c) => c.key === categoryKey);
  if (!category) return null;
  const subPage = category.subPages.find((s) => s.key === `${categoryKey}/${subKey}`);
  if (!subPage) return null;
  return { category, subPage };
}

// ============================================================================
// TAB TYPES
// ============================================================================

export type TabKey = "do" | "learn";

export interface FunctionTab {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FUNCTION_TABS: FunctionTab[] = [
  { key: "do", label: "Do", icon: Play, title: "Action Center", description: "Primary workspace for executing tasks" },
  { key: "learn", label: "Learn", icon: BookOpen, title: "Knowledge Base", description: "Documentation, guides, and training" },
];

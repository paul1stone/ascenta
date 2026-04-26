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
  Brain,
  MessageCircle,
  ClipboardCheck,
  Dumbbell,
  Settings,
  UserCircle,
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
      { key: "plan/org-design", label: "Organizational Design", icon: Building2 },
      { key: "plan/operations", label: "Operations", icon: Settings },
      { key: "my-strategy", label: "My Strategy", icon: Compass },
    ],
  },
  {
    key: "attract",
    label: "Attract",
    icon: Magnet,
    color: "#aa8866",
    subPages: [
      { key: "attract/talent-outreach", label: "Talent Outreach", icon: Users },
      { key: "attract/interview-kits", label: "Interview Kits & Scorecards", icon: ClipboardList },
    ],
  },
  {
    key: "launch",
    label: "Launch",
    icon: Rocket,
    color: "#bb6688",
    subPages: [
      { key: "launch/arrival-orchestration", label: "Arrival Orchestration", icon: CalendarCheck },
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
    ],
  },
  {
    key: "care",
    label: "Care",
    icon: Heart,
    color: "#cc6677",
    subPages: [
      { key: "care/benefits", label: "Benefits Hub", icon: BadgeDollarSign },
    ],
  },
  {
    key: "protect",
    label: "Protect",
    icon: Shield,
    color: "#8888aa",
    subPages: [
      { key: "protect/feedback", label: "Protected Feedback", icon: ShieldAlert },
      { key: "protect/investigations", label: "Investigations", icon: FolderSearch },
      { key: "protect/policy-governance", label: "Policy Governance", icon: FileText },
    ],
  },
];

// ============================================================================
// TOP-LEVEL NAV ITEMS (standalone pages, not part of category/sub routing)
// ============================================================================

export interface TopLevelNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export const TOP_LEVEL_NAV: TopLevelNavItem[] = [
  { key: "strategy-studio", label: "Strategy Studio", icon: Lightbulb, href: "/strategy-studio", color: "#6688bb" },
  { key: "culture-gym", label: "Culture Gym", icon: Dumbbell, href: "/culture-gym", color: "#44aa99" },
  { key: "leadership-library", label: "Leadership Library", icon: Library, href: "/leadership-library", color: "#8b5cf6" },
];

// ============================================================================
// SUB-PAGE TITLES
// ============================================================================

export const SUB_PAGE_TITLES: Record<string, string> = {
  "plan/org-design": "Organizational Design",
  "plan/operations": "Operations",
  "attract/talent-outreach": "Talent Outreach",
  "attract/interview-kits": "Interview Kits & Scorecards",
  "launch/arrival-orchestration": "Arrival Orchestration",
  "grow/performance": "Performance System",
  "grow/coaching": "Coaching & Corrective Action",
  "care/benefits": "Benefits Hub",
  "protect/feedback": "Protected Feedback",
  "protect/investigations": "Investigations",
  "protect/policy-governance": "Policy Governance",
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

export interface PageTab {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface PageConfig {
  title: string;
  description: string;
  tools?: PageTool[];
  tabs?: PageTab[];
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  "plan/org-design": {
    title: "Organizational Design",
    description: "Design organizational structures and operating models for effectiveness.",
    tabs: [
      { key: "job-descriptions", label: "Job Descriptions", icon: FileText },
      { key: "my-profile", label: "My Profile", icon: UserCircle },
      { key: "org-chart", label: "Org Chart", icon: Building2 },
    ],
  },
  "plan/operations": {
    title: "Operations",
    description: "Workforce planning, goals, and operating rhythm for your organization.",
  },
  "attract/talent-outreach": {
    title: "Talent Outreach",
    description: "Source, engage, and attract top talent to your organization.",
  },
  "attract/interview-kits": {
    title: "Interview Kits & Scorecards",
    description: "Build structured interview processes with consistent evaluation criteria.",
  },
  "launch/arrival-orchestration": {
    title: "Arrival Orchestration",
    description: "Orchestrate seamless onboarding experiences from offer to full productivity.",
  },
  "grow/performance": {
    title: "Performance System",
    description: "Manage performance reviews, goals, and check-ins for continuous growth.",
    tabs: [
      { key: "goals", label: "Goals", icon: Target },
      { key: "reviews", label: "Performance Reviews", icon: ClipboardCheck },
      { key: "checkins", label: "Check-ins", icon: MessageCircle },
      { key: "reflect", label: "Reflect", icon: Brain },
    ],
    tools: [
      {
        key: "startGoalWorkflow",
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
      {
        key: "startPerformanceReview",
        label: "Start Review",
        icon: ClipboardCheck,
        promptSuggestions: [
          { label: "Start performance review", promptTemplate: "Start a performance review for [employee name]" },
          { label: "Begin Q1 team review", promptTemplate: "Begin Q1 review for my team" },
        ],
      },
    ],
  },
  "grow/coaching": {
    title: "Coaching & Corrective Action",
    description: "Guide managers through coaching conversations and corrective action workflows.",
  },
  "care/benefits": {
    title: "Benefits Hub",
    description: "Manage employee benefits programs and communications.",
  },
  "protect/feedback": {
    title: "Protected Feedback",
    description: "Collect and manage sensitive employee feedback with confidentiality protections.",
  },
  "protect/investigations": {
    title: "Investigations",
    description: "Manage workplace investigations with proper documentation and compliance.",
  },
  "protect/policy-governance": {
    title: "Policy Governance",
    description: "Create, manage, and enforce organizational policies and compliance frameworks.",
  },
  "my-strategy": {
    title: "My Strategy",
    description: "See how company strategy translates to your role.",
    tabs: [],
    tools: [],
  },
  "do": {
    title: "Compass",
    description: "Your AI workspace — brainstorm strategy, create goals, run check-ins, and more.",
  },
  "strategy-studio": {
    title: "Strategy Studio",
    description: "Define and align your people strategy with business objectives.",
    tabs: [
      { key: "foundation", label: "Foundation", icon: Compass },
      { key: "strategy", label: "Strategy", icon: Target },
      { key: "translations", label: "Translations", icon: MessageSquareText },
    ],
  },
  "culture-gym": {
    title: "Culture Gym",
    description: "Build a culture of continuous learning, skill development, and team growth.",
  },
  "leadership-library": {
    title: "Leadership Library",
    description: "Access leadership principles, frameworks, and development resources.",
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
  { key: "do", label: "Compass", icon: Compass, title: "Action Center", description: "Primary workspace for executing tasks" },
  { key: "learn", label: "Learn", icon: BookOpen, title: "Knowledge Base", description: "Documentation, guides, and training" },
];

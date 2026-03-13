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
  CircleDot,
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

export interface PageTool {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface PageConfig {
  title: string;
  description: string;
  suggestions: { title: string; prompt: string }[];
  tools?: PageTool[];
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  "plan/strategy-studio": {
    title: "Strategy Studio",
    description: "Define and align your people strategy with business objectives.",
    suggestions: [
      { title: "People strategy", prompt: "Help me draft a people strategy aligned to our business goals" },
      { title: "Strategic priorities", prompt: "Identify the top HR strategic priorities for next quarter" },
      { title: "Culture assessment", prompt: "Help me assess our current organizational culture" },
      { title: "Change roadmap", prompt: "Create a change management roadmap for a new initiative" },
    ],
  },
  "plan/org-design": {
    title: "Org Design & Operating Model",
    description: "Design organizational structures and operating models for effectiveness.",
    suggestions: [
      { title: "Org structure review", prompt: "Review our current org structure for optimization opportunities" },
      { title: "Operating model", prompt: "Help me design an operating model for a new department" },
      { title: "Role mapping", prompt: "Map roles and responsibilities for a restructuring" },
      { title: "Span of control", prompt: "Analyze our span of control and recommend improvements" },
    ],
  },
  "plan/workforce-planning": {
    title: "Workforce Planning & Analytics",
    description: "Forecast workforce needs and leverage people analytics for decisions.",
    suggestions: [
      { title: "Headcount forecast", prompt: "Help me forecast headcount needs for next quarter" },
      { title: "Turnover analysis", prompt: "Analyze our turnover data and identify retention risks" },
      { title: "Skills gap analysis", prompt: "Conduct a skills gap analysis for my department" },
      { title: "Workforce metrics", prompt: "What workforce metrics should I be tracking?" },
    ],
  },
  "plan/goals-rhythm": {
    title: "Goals & Operating Rhythm",
    description: "Set organizational goals and establish a consistent operating cadence.",
    suggestions: [
      { title: "OKR framework", prompt: "Help me set up OKRs for my department" },
      { title: "Operating rhythm", prompt: "Design a quarterly operating rhythm for the HR team" },
      { title: "Goal alignment", prompt: "Align team goals with company-wide strategic priorities" },
      { title: "Review cadence", prompt: "Establish a goal review cadence for the organization" },
    ],
  },
  "attract/requisition": {
    title: "Requisition & Role Intake",
    description: "Streamline job requisitions and role definition for effective hiring.",
    suggestions: [
      { title: "Job description", prompt: "Help me write a job description for a new role" },
      { title: "Requisition form", prompt: "Create a standardized requisition intake form" },
      { title: "Role leveling", prompt: "Help me define leveling criteria for a role family" },
      { title: "Hiring justification", prompt: "Draft a business case for a new headcount request" },
    ],
  },
  "attract/interview-kits": {
    title: "Interview Kits & Scorecards",
    description: "Build structured interview processes with consistent evaluation criteria.",
    suggestions: [
      { title: "Interview questions", prompt: "Generate structured interview questions for a role" },
      { title: "Scorecard template", prompt: "Create a candidate evaluation scorecard" },
      { title: "Interview guide", prompt: "Build an interview guide for hiring managers" },
      { title: "Competency assessment", prompt: "Design competency-based interview questions" },
    ],
  },
  "attract/debrief": {
    title: "Debrief & Decision",
    description: "Facilitate hiring debriefs and make data-driven selection decisions.",
    suggestions: [
      { title: "Debrief template", prompt: "Create a structured hiring debrief template" },
      { title: "Candidate comparison", prompt: "Help me compare candidates objectively" },
      { title: "Decision framework", prompt: "Design a hiring decision framework for our team" },
      { title: "Feedback synthesis", prompt: "Synthesize interviewer feedback for a candidate" },
    ],
  },
  "attract/offer": {
    title: "Offer & Pre-Hire",
    description: "Manage offer creation, negotiation, and pre-hire processes.",
    suggestions: [
      { title: "Offer letter", prompt: "Draft an offer letter for a new hire" },
      { title: "Comp benchmarking", prompt: "Compare our compensation to market benchmarks for a role" },
      { title: "Pre-hire checklist", prompt: "Create a pre-hire onboarding checklist" },
      { title: "Counter-offer response", prompt: "Help me respond to a candidate's counter-offer" },
    ],
  },
  "launch/day-one": {
    title: "Day One Ready",
    description: "Ensure every new hire has a seamless, organized first day.",
    suggestions: [
      { title: "First-day checklist", prompt: "Generate a first-day checklist for a new hire" },
      { title: "Welcome email", prompt: "Write a welcome email for a new team member" },
      { title: "Orientation agenda", prompt: "Create a new hire orientation agenda" },
      { title: "Manager prep", prompt: "Build a manager preparation guide for a new hire's first day" },
    ],
  },
  "launch/ramp-plans": {
    title: "30-60-90 Ramp Plans",
    description: "Structure the first 90 days for new hires to accelerate productivity.",
    suggestions: [
      { title: "30-60-90 plan", prompt: "Draft a 30-60-90 day onboarding plan" },
      { title: "Milestone checkpoints", prompt: "Define milestone checkpoints for a new hire ramp" },
      { title: "Role-specific ramp", prompt: "Create a role-specific ramp plan for an engineer" },
      { title: "Ramp assessment", prompt: "Build a ramp progress assessment template" },
    ],
  },
  "launch/training": {
    title: "Training & Enablement",
    description: "Build and manage training programs for new hire enablement.",
    suggestions: [
      { title: "Training curriculum", prompt: "Help me design a training curriculum for a new role" },
      { title: "Learning objectives", prompt: "Draft learning objectives for a training program" },
      { title: "Training schedule", prompt: "Build a training schedule for the first quarter" },
      { title: "Skills assessment", prompt: "Create a skills gap assessment template" },
    ],
  },
  "launch/provisioning": {
    title: "Access & Equipment",
    description: "Manage system access, equipment, and tooling provisioning for new hires.",
    suggestions: [
      { title: "Provisioning checklist", prompt: "Create an IT provisioning checklist for new hires" },
      { title: "Access request", prompt: "Draft a system access request for a new team member" },
      { title: "Equipment list", prompt: "Build a standard equipment list by role" },
      { title: "Deprovisioning plan", prompt: "Create a deprovisioning checklist for offboarding" },
    ],
  },
  "grow/performance": {
    title: "Performance System",
    description: "Manage performance reviews, goals, and check-ins for continuous growth.",
    suggestions: [
      { title: "Performance review", prompt: "Create a performance review template for my team" },
      { title: "Goal setting", prompt: "Help me draft SMART goals for a team member" },
      { title: "Check-in template", prompt: "Build a structured manager-employee check-in template" },
      { title: "Self-assessment", prompt: "Draft a self-assessment guide for employees" },
    ],
    tools: [
      { key: "startGoalCreation", label: "Create Goal", icon: Target },
      { key: "startCheckIn", label: "Run Check-in", icon: CalendarCheck },
      { key: "startPerformanceNote", label: "Add Note", icon: FileText },
    ],
  },
  "grow/coaching": {
    title: "Coaching & Corrective Action",
    description: "Guide managers through coaching conversations and corrective action workflows.",
    suggestions: [
      { title: "Written warning", prompt: "Help me write a corrective action for an employee" },
      { title: "Coaching script", prompt: "Draft a coaching conversation script for a performance issue" },
      { title: "PIP", prompt: "Draft a Performance Improvement Plan for an underperforming employee" },
      { title: "Documentation guide", prompt: "Help me document a coaching conversation properly" },
    ],
  },
  "grow/learning": {
    title: "Learning & Development",
    description: "Build a culture of continuous learning with the Culture Gym and skill development.",
    suggestions: [
      { title: "Culture Gym rep", prompt: "Show me today's Culture Gym daily rep" },
      { title: "Skill campaign", prompt: "Help me create a learning skill campaign for my team" },
      { title: "Development plan", prompt: "Create an individual development plan for an employee" },
      { title: "Learning path", prompt: "Design a learning path for an emerging leader" },
    ],
  },
  "grow/leadership-library": {
    title: "Leadership Library",
    description: "Access leadership principles, frameworks, and development resources.",
    suggestions: [
      { title: "Leadership principle", prompt: "Explain a leadership principle I can apply today" },
      { title: "Coaching framework", prompt: "Recommend a coaching framework for a difficult conversation" },
      { title: "Leadership assessment", prompt: "Help me assess my leadership strengths and gaps" },
      { title: "Team development", prompt: "Suggest leadership development activities for my team" },
    ],
  },
  "care/total-rewards": {
    title: "Total Rewards",
    description: "Design and communicate comprehensive total rewards packages.",
    suggestions: [
      { title: "Rewards summary", prompt: "Summarize our total rewards package for a role" },
      { title: "Compensation review", prompt: "Help me run a compensation equity analysis" },
      { title: "Merit increases", prompt: "Draft merit increase recommendations for my team" },
      { title: "Rewards strategy", prompt: "Design a total rewards strategy for retention" },
    ],
  },
  "care/benefits": {
    title: "Benefits Hub",
    description: "Manage employee benefits programs and communications.",
    suggestions: [
      { title: "Benefits overview", prompt: "Create a benefits overview for new employees" },
      { title: "Open enrollment", prompt: "Draft open enrollment communications" },
      { title: "Benefits comparison", prompt: "Compare our benefits to industry benchmarks" },
      { title: "Wellness program", prompt: "Design an employee wellness program" },
    ],
  },
  "care/leave": {
    title: "Leave & Benefits Orchestrator",
    description: "Coordinate leave management and benefits administration workflows.",
    suggestions: [
      { title: "Leave policy", prompt: "Help me draft a leave of absence policy" },
      { title: "FMLA guidance", prompt: "Guide me through processing an FMLA request" },
      { title: "Return to work", prompt: "Create a return-to-work plan after extended leave" },
      { title: "Leave tracking", prompt: "Set up a leave tracking process for my team" },
    ],
  },
  "protect/feedback": {
    title: "Protected Feedback",
    description: "Collect and manage sensitive employee feedback with confidentiality protections.",
    suggestions: [
      { title: "Feedback channel", prompt: "Help me set up a protected feedback channel" },
      { title: "Anonymous survey", prompt: "Design an anonymous employee feedback survey" },
      { title: "Concern triage", prompt: "Help me triage and respond to an employee concern" },
      { title: "Whistleblower policy", prompt: "Draft a whistleblower protection policy" },
    ],
  },
  "protect/case-management": {
    title: "Employee Case Management",
    description: "Manage employee relations cases with proper documentation and compliance.",
    suggestions: [
      { title: "Investigation plan", prompt: "Help me plan a workplace investigation" },
      { title: "Case documentation", prompt: "Guide me through documenting an employee relations case" },
      { title: "Policy violation", prompt: "How should I handle a policy violation report?" },
      { title: "Resolution summary", prompt: "Draft a case resolution summary" },
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

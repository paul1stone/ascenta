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
  TrendingUp,
  BarChart3,
  MessageSquare,
  ArrowRightLeft,
  UserMinus,
  Briefcase,
  Search,
  PieChart,
  CalendarCheck,
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
  {
    key: "develop",
    label: "Develop",
    icon: TrendingUp,
    subPages: [
      { key: "develop/reviews", label: "Performance Reviews", icon: ClipboardCheck },
      { key: "develop/goals", label: "Goal Setting", icon: Target },
      { key: "develop/feedback", label: "360 Feedback", icon: MessageSquare },
    ],
  },
  {
    key: "transition",
    label: "Transition",
    icon: ArrowRightLeft,
    subPages: [
      { key: "transition/offboarding", label: "Offboarding", icon: UserMinus },
      { key: "transition/transfers", label: "Transfers", icon: Briefcase },
      { key: "transition/succession", label: "Succession Planning", icon: CalendarCheck },
    ],
  },
  {
    key: "analyze",
    label: "Analyze",
    icon: PieChart,
    subPages: [
      { key: "analyze/turnover", label: "Turnover Analytics", icon: BarChart3 },
      { key: "analyze/headcount", label: "Headcount Planning", icon: Search },
      { key: "analyze/compensation", label: "Compensation Review", icon: Scale },
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
  "develop/reviews": "Performance Reviews",
  "develop/goals": "Goal Setting",
  "develop/feedback": "360 Feedback",
  "transition/offboarding": "Offboarding",
  "transition/transfers": "Transfers",
  "transition/succession": "Succession Planning",
  "analyze/turnover": "Turnover Analytics",
  "analyze/headcount": "Headcount Planning",
  "analyze/compensation": "Compensation Review",
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
  "develop/reviews": {
    title: "Performance Reviews",
    description: "Conduct fair, structured performance evaluations.",
    suggestions: [
      { title: "Review template", prompt: "Create a performance review template for my team" },
      { title: "Self-assessment", prompt: "Draft a self-assessment guide for employees" },
      { title: "Rating calibration", prompt: "Help me prepare for a rating calibration session" },
      { title: "Review summary", prompt: "Write a performance review summary for an employee" },
    ],
  },
  "develop/goals": {
    title: "Goal Setting",
    description: "Set clear, measurable goals aligned with business objectives.",
    suggestions: [
      { title: "OKR framework", prompt: "Help me set up OKRs for my department" },
      { title: "SMART goals", prompt: "Draft SMART goals for a team member" },
      { title: "Mid-year check-in", prompt: "Prepare a mid-year goal progress check-in" },
      { title: "Development plan", prompt: "Create an individual development plan for an employee" },
    ],
  },
  "develop/feedback": {
    title: "360 Feedback",
    description: "Gather multi-directional feedback for holistic employee development.",
    suggestions: [
      { title: "Feedback survey", prompt: "Design a 360-degree feedback survey" },
      { title: "Peer questions", prompt: "Generate peer feedback questions for a review cycle" },
      { title: "Feedback summary", prompt: "Summarize 360 feedback results for an employee" },
      { title: "Action items", prompt: "Create development action items from feedback results" },
    ],
  },
  "transition/offboarding": {
    title: "Offboarding",
    description: "Manage employee departures with structured offboarding workflows.",
    suggestions: [
      { title: "Exit checklist", prompt: "Generate an offboarding checklist for a departing employee" },
      { title: "Exit interview", prompt: "Draft exit interview questions" },
      { title: "Knowledge transfer", prompt: "Create a knowledge transfer plan for a departing employee" },
      { title: "Final communications", prompt: "Write a team announcement about an employee departure" },
    ],
  },
  "transition/transfers": {
    title: "Transfers",
    description: "Facilitate smooth internal transfers and role changes.",
    suggestions: [
      { title: "Transfer letter", prompt: "Draft an internal transfer offer letter" },
      { title: "Transition plan", prompt: "Create a role transition plan for an internal move" },
      { title: "Handoff checklist", prompt: "Build a responsibility handoff checklist" },
      { title: "Team notification", prompt: "Write a team announcement about an internal transfer" },
    ],
  },
  "transition/succession": {
    title: "Succession Planning",
    description: "Identify and develop future leaders for critical roles.",
    suggestions: [
      { title: "Succession map", prompt: "Help me create a succession plan for key roles" },
      { title: "Readiness assessment", prompt: "Assess succession readiness for a leadership position" },
      { title: "Talent pipeline", prompt: "Build a talent pipeline for critical roles" },
      { title: "Development roadmap", prompt: "Create a leadership development roadmap for a successor" },
    ],
  },
  "analyze/turnover": {
    title: "Turnover Analytics",
    description: "Understand attrition patterns and identify retention risks.",
    suggestions: [
      { title: "Turnover report", prompt: "Help me analyze our quarterly turnover data" },
      { title: "Flight risk", prompt: "Identify flight risk indicators for my team" },
      { title: "Exit trends", prompt: "Summarize common themes from recent exit interviews" },
      { title: "Retention strategy", prompt: "Draft a retention strategy for high-turnover departments" },
    ],
  },
  "analyze/headcount": {
    title: "Headcount Planning",
    description: "Plan workforce capacity and forecast hiring needs.",
    suggestions: [
      { title: "Headcount forecast", prompt: "Help me forecast headcount needs for next quarter" },
      { title: "Org structure", prompt: "Review our current org structure for optimization" },
      { title: "Hiring plan", prompt: "Draft a hiring plan based on projected growth" },
      { title: "Budget analysis", prompt: "Analyze headcount budget vs. actual spend" },
    ],
  },
  "analyze/compensation": {
    title: "Compensation Review",
    description: "Evaluate pay equity and maintain competitive compensation.",
    suggestions: [
      { title: "Pay equity audit", prompt: "Help me run a pay equity analysis for my department" },
      { title: "Market comparison", prompt: "Compare our compensation to market benchmarks" },
      { title: "Raise recommendations", prompt: "Draft merit increase recommendations for my team" },
      { title: "Total rewards", prompt: "Summarize our total rewards package for a role" },
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

export type TabKey = "do" | "learn" | "status" | "dashboard";

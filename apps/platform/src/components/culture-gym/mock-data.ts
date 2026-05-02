export type Lane = "employee" | "manager" | "hr";

export const LANE_LABELS: Record<Lane, string> = {
  employee: "Employee",
  manager: "Manager",
  hr: "HR / People Ops",
};

export const LANE_COLORS: Record<Lane, string> = {
  employee: "#44aa99",
  manager: "#aa8866",
  hr: "#6688bb",
};

export const EMPLOYEE_CATEGORIES = [
  "Self Leadership",
  "Professional Communication",
  "Collaboration",
  "Execution and Productivity",
  "Ethical Practice",
  "Cultural Intelligence",
  "Critical Thinking and Problem Solving",
];

export const MANAGER_CATEGORIES = [
  "Expectation Setting",
  "Coaching and Development",
  "Conflict and Performance Management",
  "Team Leadership",
  "Ethical Leadership",
  "Cultural Intelligence",
  "Change Leadership",
];

export const HR_CATEGORIES = [
  "Documentation and Compliance",
  "Workplace Investigations",
  "Workplace Risk Management",
  "Leadership Enablement",
  "Ethical Practice",
  "Cultural Intelligence",
  "Consultation and Strategic Advisory",
  "Analytical Aptitude",
];

export type DailyWorkout = {
  id: string;
  day: number;
  lane: Lane;
  category: string;
  principle: string;
  skill: string;
  teach: string;
  example: string;
  application: string;
  quiz: QuizQuestion[];
  reflection: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
};

export const TODAYS_EMPLOYEE_WORKOUT: DailyWorkout = {
  id: "wk-emp-d127",
  day: 127,
  lane: "employee",
  category: "Professional Communication",
  principle:
    "Clarity is a form of respect — it saves your colleagues the cost of decoding intent.",
  skill: "Surfacing the ask in the first sentence",
  teach:
    "Most workplace messages bury the request three paragraphs deep. Naming the ask first lets the reader frame everything that follows. State what you need, then give the context, not the other way around.",
  example:
    "Instead of opening with five sentences of background, try: \"I need a 30-min review on the launch deck before Thursday — context follows.\" The reader now knows the ask, the urgency, and the shape of the response you expect.",
  application:
    "Take a Slack message you'll send today and rewrite the first sentence to lead with the ask. Notice how much shorter your second draft becomes.",
  quiz: [
    {
      id: "q1",
      question:
        "Your manager pings you with a long context paragraph and ends with: 'just wanted to flag this'. What's the strongest first move?",
      options: [
        "Ask: 'Got it — is there a specific decision or action you'd like from me?'",
        "Reply 'sounds good' and wait for follow-up.",
        "Restate everything they said back to them.",
      ],
      correctIndex: 0,
      rationale:
        "Surface the ask. A short clarifying question turns a flag into a workable request without re-litigating the context.",
    },
    {
      id: "q2",
      question: "Which subject line lands the ask first?",
      options: [
        "'Quick question about Q2 planning'",
        "'Need 15 min before Thursday — Q2 planning'",
        "'Following up on yesterday'",
      ],
      correctIndex: 1,
      rationale:
        "Subject lines should compress the ask. The reader sees what you need and the deadline before opening.",
    },
    {
      id: "q3",
      question: "When can you safely lead with context first?",
      options: [
        "When you're delivering hard news that requires emotional framing.",
        "When the message is to a peer.",
        "Always — context-first is more polite.",
      ],
      correctIndex: 0,
      rationale:
        "Hard news is the exception. For sensitive or high-stakes messages, leading with framing protects the relationship.",
    },
  ],
  reflection: "Did leading with the ask feel rushed, respectful, or both?",
};

export const TODAYS_MANAGER_WORKOUT: DailyWorkout = {
  id: "wk-mgr-d127",
  day: 127,
  lane: "manager",
  category: "Coaching and Development",
  principle:
    "Coaching beats correcting — a question that surfaces the answer outlasts an answer that ends the conversation.",
  skill: "Asking the question before giving the advice",
  teach:
    "When a direct report brings you a problem, the fastest move is to solve it. The most developmental move is to ask one question first. The question signals trust and gives them the chance to think.",
  example:
    "Direct report: 'I'm stuck on how to scope the migration.' Instead of mapping the scope yourself: 'Where in the work do you feel most uncertain right now?' That single question often surfaces the actual blocker.",
  application:
    "In your next 1:1, hold one question for the moment you'd usually give advice. Note what your direct report says when given room to think.",
  quiz: [
    {
      id: "q1",
      question:
        "A new hire asks how to handle a customer escalation. The strongest opening?",
      options: [
        "'Here's exactly what to do, step by step.'",
        "'What have you already considered?'",
        "'I'll handle it for you this time.'",
      ],
      correctIndex: 1,
      rationale:
        "Questions before answers. Even when speed matters, a 30-second question reveals whether they need direction or confidence.",
    },
    {
      id: "q2",
      question: "When is direct advice the right move?",
      options: [
        "When the cost of getting it wrong is high and the person is new to the work.",
        "Always — questions waste time.",
        "Never — coaching is always superior.",
      ],
      correctIndex: 0,
      rationale:
        "Coaching matches readiness. New work + high stakes calls for direct teaching, then a coaching question to confirm understanding.",
    },
  ],
  reflection: "What did you learn from holding back your answer?",
};

export type StatusMetrics = {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  masteryScore: number;
  level: { label: string; current: number; nextThreshold: number };
  categoryStrengths: { category: string; score: number }[];
  momentum: "rising" | "steady" | "falling";
};

export const EMPLOYEE_STATUS: StatusMetrics = {
  currentStreak: 14,
  bestStreak: 47,
  totalCompleted: 127,
  masteryScore: 78,
  level: { label: "Builder", current: 127, nextThreshold: 250 },
  categoryStrengths: [
    { category: "Professional Communication", score: 86 },
    { category: "Collaboration", score: 81 },
    { category: "Execution and Productivity", score: 79 },
    { category: "Cultural Intelligence", score: 75 },
    { category: "Ethical Practice", score: 73 },
    { category: "Self Leadership", score: 71 },
    { category: "Critical Thinking and Problem Solving", score: 68 },
  ],
  momentum: "rising",
};

export const MANAGER_STATUS: StatusMetrics = {
  currentStreak: 9,
  bestStreak: 32,
  totalCompleted: 84,
  masteryScore: 72,
  level: { label: "Practitioner", current: 84, nextThreshold: 121 },
  categoryStrengths: [
    { category: "Coaching and Development", score: 80 },
    { category: "Expectation Setting", score: 77 },
    { category: "Team Leadership", score: 74 },
    { category: "Ethical Leadership", score: 72 },
    { category: "Cultural Intelligence", score: 71 },
    { category: "Change Leadership", score: 64 },
    { category: "Conflict and Performance Management", score: 58 },
  ],
  momentum: "steady",
};

export const TEAM_METRICS = [
  { label: "Team participation (7d)", value: "82%", color: "#44aa99" },
  { label: "Team participation (30d)", value: "76%", color: "#44aa99" },
  { label: "Average team streak", value: "11 days", color: "#6688bb" },
  { label: "Team momentum score", value: "74", color: "#aa8866" },
];

export const HR_INSIGHTS = {
  participation: { today: "61%", sevenDay: "78%", thirtyDay: "72%" },
  averageMastery: { overall: 73, employee: 76, manager: 71, hr: 68 },
  managerEngagement: "84%",
  cultureMomentum: 71,
  heatmap: [
    { lane: "employee", category: "Professional Communication", score: 82 },
    { lane: "employee", category: "Collaboration", score: 79 },
    { lane: "employee", category: "Self Leadership", score: 74 },
    { lane: "employee", category: "Critical Thinking", score: 67 },
    { lane: "manager", category: "Coaching and Development", score: 78 },
    { lane: "manager", category: "Conflict and Performance", score: 58 },
    { lane: "manager", category: "Change Leadership", score: 64 },
    { lane: "manager", category: "Team Leadership", score: 73 },
    { lane: "hr", category: "Documentation and Compliance", score: 81 },
    { lane: "hr", category: "Workplace Investigations", score: 71 },
    { lane: "hr", category: "Strategic Advisory", score: 76 },
    { lane: "hr", category: "Risk Management", score: 67 },
  ],
  riskIndicators: [
    {
      label: "Conflict and Performance Management",
      lane: "Manager",
      detail: "Average mastery 58 — below 65 threshold for critical category",
    },
    {
      label: "Documentation and Compliance",
      lane: "HR",
      detail: "Two managers below mastery floor flagged for support",
    },
  ],
  capabilitySignals: [
    {
      label: "Coaching skill gap",
      detail: "12 managers below mastery 65 in Coaching and Development",
    },
    {
      label: "High conflict escalation",
      detail: "3 managers with 2+ corrective actions and low conflict-management score",
    },
  ],
  cultureDrift: [
    {
      label: "Recognition language sliding generic",
      detail: "Recognition prompts averaging 8% lower specificity vs Q1",
    },
  ],
};

export const SKILL_BADGES = [
  { name: "Communication Builder", earned: true },
  { name: "Conflict Navigator", earned: false },
  { name: "Accountability Champion", earned: true },
  { name: "Team Builder", earned: false },
  { name: "Problem Solver", earned: true },
];

export const HR_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Q2 Coaching Reset",
    audience: "Managers",
    start: "Apr 1, 2026",
    end: "Jun 30, 2026",
    status: "active",
    completion: 64,
  },
  {
    id: "camp-2",
    name: "Onboarding Cohort: April Cohort",
    audience: "New hires",
    start: "Apr 15, 2026",
    end: "May 30, 2026",
    status: "active",
    completion: 41,
  },
  {
    id: "camp-3",
    name: "Documentation Hardening",
    audience: "HR / People Ops",
    start: "Mar 1, 2026",
    end: "Mar 31, 2026",
    status: "completed",
    completion: 100,
  },
];

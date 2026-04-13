// packages/db/src/performance-review-categories.ts

/**
 * Performance Review Categories, Rating Scale, and V2 Enums
 * Client-safe — no mongoose dependency.
 * Source: docs/reqs/perf-reviews.md
 */

export const REVIEW_CATEGORY_KEYS = [
  "job_knowledge",
  "quality_of_work",
  "productivity",
  "communication",
  "collaboration",
  "initiative",
  "professionalism",
  "leadership",
  "learning_development",
  "culture_values",
] as const;

export type ReviewCategoryKey = (typeof REVIEW_CATEGORY_KEYS)[number];

export interface ReviewCategory {
  key: ReviewCategoryKey;
  label: string;
  definition: string;
  subcategories: string[];
  competencies: string[];
  guidedPrompts: string[];
}

export const REVIEW_CATEGORIES: Record<ReviewCategoryKey, ReviewCategory> = {
  job_knowledge: {
    key: "job_knowledge",
    label: "Job Knowledge and Technical Competence",
    definition:
      "Ability to perform the role effectively using relevant skills, systems, and professional expertise.",
    subcategories: [
      "Technical skills related to the job",
      "Industry knowledge and best practices",
      "Understanding of tools/systems/technology",
      "Application of professional expertise",
      "Accuracy of work product",
    ],
    competencies: [
      "Demonstrates strong understanding of job responsibilities",
      "Maintains knowledge of relevant tools, systems, and processes",
      "Applies technical skills effectively in daily work",
      "Maintains awareness of industry standards or best practices",
      "Uses technology and systems effectively",
    ],
    guidedPrompts: [
      "Does the employee understand the role and responsibilities?",
      "Do they use required tools correctly?",
      "Do they apply expertise to solve problems?",
    ],
  },
  quality_of_work: {
    key: "quality_of_work",
    label: "Quality of Work",
    definition:
      "Produces accurate, thorough, and reliable work that meets organizational standards.",
    subcategories: [
      "Accuracy and attention to detail",
      "Thoroughness and completeness",
      "Work standards and consistency",
      "Error prevention",
    ],
    competencies: [
      "Accuracy and attention to detail",
      "Completeness and reliability of work",
      "Consistency of performance",
      "Adherence to professional standards",
      "Minimizes errors and rework",
    ],
    guidedPrompts: [
      "Does the employee produce dependable work?",
      "Do they maintain quality standards?",
      "Do they complete tasks correctly the first time?",
    ],
  },
  productivity: {
    key: "productivity",
    label: "Productivity and Time Management",
    definition:
      "Manages workload effectively and completes responsibilities in a timely manner.",
    subcategories: [
      "Work output",
      "Meeting deadlines",
      "Work prioritization",
      "Efficiency and workflow management",
      "Time management",
    ],
    competencies: [
      "Meets deadlines and commitments",
      "Prioritizes work effectively",
      "Maintains appropriate work pace",
      "Demonstrates efficient use of time",
      "Manages workload independently",
    ],
    guidedPrompts: [
      "Does the employee complete work within expected timeframes?",
      "Do they manage competing priorities?",
      "Do they use time productively?",
    ],
  },
  communication: {
    key: "communication",
    label: "Communication",
    definition:
      "Communicates information clearly, professionally, and effectively with others.",
    subcategories: [
      "Verbal communication",
      "Written communication",
      "Listening skills",
      "Clarity of messaging",
      "Responsiveness",
    ],
    competencies: [
      "Communicates clearly and respectfully",
      "Demonstrates strong listening skills",
      "Shares relevant information with stakeholders",
      "Writes professional and effective communications",
      "Responds appropriately and timely",
    ],
    guidedPrompts: [
      "Does the employee communicate clearly?",
      "Do they provide timely updates?",
      "Do they maintain professional communication?",
    ],
  },
  collaboration: {
    key: "collaboration",
    label: "Collaboration and Interpersonal Effectiveness",
    definition:
      "Works effectively with others and contributes positively to team success.",
    subcategories: [
      "Team collaboration",
      "Respect and professionalism",
      "Relationship building",
      "Conflict resolution",
      "Stakeholder engagement",
    ],
    competencies: [
      "Demonstrates respect for colleagues",
      "Contributes to team goals",
      "Builds positive working relationships",
      "Supports collaboration across teams",
      "Resolves disagreements professionally",
    ],
    guidedPrompts: [
      "Does the employee contribute positively to the team?",
      "Do they support coworkers?",
      "Do they collaborate effectively?",
    ],
  },
  initiative: {
    key: "initiative",
    label: "Initiative and Problem Solving",
    definition:
      "Demonstrates ownership of work and proactively addresses challenges.",
    subcategories: [
      "Initiative and ownership",
      "Problem identification",
      "Decision making",
      "Continuous improvement",
      "Creativity and innovation",
    ],
    competencies: [
      "Takes initiative to address challenges",
      "Identifies opportunities for improvement",
      "Uses sound judgment in decision making",
      "Demonstrates critical thinking",
      "Suggests innovative solutions",
    ],
    guidedPrompts: [
      "Does the employee solve problems independently?",
      "Do they contribute ideas?",
      "Do they take ownership of outcomes?",
    ],
  },
  professionalism: {
    key: "professionalism",
    label: "Professionalism and Accountability",
    definition:
      "Demonstrates reliability, integrity, and adherence to organizational standards.",
    subcategories: [
      "Reliability and dependability",
      "Attendance and punctuality",
      "Ethical conduct",
      "Compliance with policies",
      "Responsibility for results",
    ],
    competencies: [
      "Demonstrates dependability and reliability",
      "Maintains punctuality and attendance",
      "Accepts responsibility for outcomes",
      "Follows policies and procedures",
      "Demonstrates ethical behavior",
    ],
    guidedPrompts: [
      "Does the employee behave professionally?",
      "Do they follow policies?",
      "Do they take accountability for work?",
    ],
  },
  leadership: {
    key: "leadership",
    label: "Leadership and Influence",
    definition:
      "Demonstrates behaviors that positively influence others and contribute to organizational success.",
    subcategories: [
      "Leadership potential",
      "Mentoring and coaching others",
      "Influencing positive outcomes",
      "Decision making",
      "Strategic thinking",
    ],
    competencies: [
      "Demonstrates leadership behaviors",
      "Supports and mentors colleagues",
      "Encourages collaboration and engagement",
      "Demonstrates confidence in decision making",
      "Positively influences team culture",
    ],
    guidedPrompts: [
      "Does the employee demonstrate leadership potential?",
      "Do they support the growth of others?",
      "Do they positively influence the team?",
    ],
  },
  learning_development: {
    key: "learning_development",
    label: "Learning and Development",
    definition:
      "Demonstrates commitment to continuous improvement and professional growth.",
    subcategories: [
      "Skill development",
      "Training completion",
      "Professional certifications",
      "Learning new responsibilities",
      "Career development effort",
    ],
    competencies: [
      "Participates in training or development opportunities",
      "Demonstrates willingness to learn new skills",
      "Applies new knowledge to work",
      "Seeks feedback and coaching",
      "Demonstrates adaptability to change",
    ],
    guidedPrompts: [
      "Does the employee pursue growth opportunities?",
      "Do they learn new skills?",
      "Do they adapt to new expectations?",
    ],
  },
  culture_values: {
    key: "culture_values",
    label: "Culture and Values Alignment",
    definition:
      "Demonstrates behaviors that align with the organization's mission, values, and culture.",
    subcategories: [
      "Integrity",
      "Respect",
      "Accountability",
      "Service orientation",
      "Team support",
    ],
    competencies: [
      "Demonstrates respect and integrity",
      "Treats others fairly and professionally",
      "Supports a positive workplace culture",
      "Demonstrates commitment to organizational values",
      "Contributes positively to the work environment",
    ],
    guidedPrompts: [
      "Does the employee reflect company values in daily work?",
      "Do they contribute positively to the culture?",
    ],
  },
};

export const RATING_SCALE = {
  1: {
    label: "Improvement Needed",
    description:
      "Performance does not consistently meet expectations; requires significant development.",
  },
  2: {
    label: "Developing",
    description:
      "Partially meets expectations; developing toward full competency.",
  },
  3: {
    label: "Meets Expectations",
    description:
      "Consistently meets role expectations; reliable, competent performance.",
  },
  4: {
    label: "Exceeds Expectations",
    description:
      "Regularly exceeds expectations; notable contributions beyond the role.",
  },
  5: {
    label: "Exceptional",
    description:
      "Consistently exceptional; recognized impact beyond immediate role.",
  },
} as const;

export type RatingValue = keyof typeof RATING_SCALE;

export const REVIEW_TYPES = [
  "annual",
  "mid_year",
  "ninety_day",
  "custom",
] as const;

export type ReviewType = (typeof REVIEW_TYPES)[number];

export const CYCLE_STATUSES = ["draft", "open", "closed"] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];

export const SELF_ASSESSMENT_STATUSES = [
  "not_started",
  "in_progress",
  "submitted",
] as const;
export type SelfAssessmentStatus = (typeof SELF_ASSESSMENT_STATUSES)[number];

export const MANAGER_ASSESSMENT_STATUSES = [
  "not_started",
  "in_progress",
  "submitted",
] as const;
export type ManagerAssessmentStatus =
  (typeof MANAGER_ASSESSMENT_STATUSES)[number];

export const DEVELOPMENT_PLAN_STATUSES = [
  "not_started",
  "draft",
  "finalized",
] as const;
export type DevelopmentPlanStatus =
  (typeof DEVELOPMENT_PLAN_STATUSES)[number];

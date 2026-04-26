export const LEVEL_OPTIONS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "manager",
  "director",
  "executive",
] as const;
export type Level = (typeof LEVEL_OPTIONS)[number];

export const EMPLOYMENT_TYPE_OPTIONS = [
  "full_time",
  "part_time",
  "contract",
  "intern",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPE_OPTIONS)[number];

export const STATUS_OPTIONS = ["draft", "published"] as const;
export type JdStatus = (typeof STATUS_OPTIONS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
  manager: "Manager",
  director: "Director",
  executive: "Executive",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export const STATUS_LABELS: Record<JdStatus, string> = {
  draft: "Draft",
  published: "Published",
};

import { describe, it, expect } from "vitest";
import {
  jobDescriptionInputSchema,
  jobDescriptionPatchSchema,
  assignEmployeesSchema,
} from "@/lib/validations/job-description";

const valid = {
  title: "Software Engineer",
  department: "Engineering",
  level: "mid" as const,
  employmentType: "full_time" as const,
  roleSummary: "Builds high-quality software systems for the company.",
  coreResponsibilities: ["Write code", "Review pull requests"],
  requiredQualifications: ["3+ years experience"],
  preferredQualifications: [],
  competencies: ["Ownership", "Communication"],
  status: "published" as const,
};

describe("jobDescriptionInputSchema", () => {
  it("accepts valid payload", () => {
    expect(jobDescriptionInputSchema.parse(valid)).toMatchObject({
      title: "Software Engineer",
    });
  });

  it("defaults preferredQualifications to []", () => {
    const { preferredQualifications: _drop, ...withoutPref } = valid;
    const parsed = jobDescriptionInputSchema.parse(withoutPref);
    expect(parsed.preferredQualifications).toEqual([]);
  });

  it("defaults status to 'published'", () => {
    const { status: _drop, ...withoutStatus } = valid;
    const parsed = jobDescriptionInputSchema.parse(withoutStatus);
    expect(parsed.status).toBe("published");
  });

  it("rejects title shorter than 2 chars", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, title: "x" }),
    ).toThrow();
  });

  it("rejects empty coreResponsibilities", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, coreResponsibilities: [] }),
    ).toThrow();
  });

  it("rejects roleSummary shorter than 20 chars", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, roleSummary: "too short" }),
    ).toThrow();
  });

  it("rejects invalid level enum", () => {
    expect(() =>
      jobDescriptionInputSchema.parse({ ...valid, level: "junior" }),
    ).toThrow();
  });
});

describe("jobDescriptionPatchSchema", () => {
  it("accepts a single-field update", () => {
    expect(jobDescriptionPatchSchema.parse({ title: "Updated" })).toEqual({
      title: "Updated",
    });
  });

  it("accepts an empty patch", () => {
    expect(jobDescriptionPatchSchema.parse({})).toEqual({});
  });
});

describe("assignEmployeesSchema", () => {
  it("requires at least one id", () => {
    expect(() => assignEmployeesSchema.parse({ employeeIds: [] })).toThrow();
  });

  it("accepts list of ids", () => {
    expect(assignEmployeesSchema.parse({ employeeIds: ["a", "b"] })).toEqual({
      employeeIds: ["a", "b"],
    });
  });
});

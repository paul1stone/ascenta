import { describe, it, expect, beforeAll } from "vitest";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import {
  startJobDescriptionWorkflowTool,
  openJobDescriptionDocumentTool,
} from "./job-description-tools";

const SKIP_NO_DB = !process.env.MONGODB_URI;

describe.skipIf(SKIP_NO_DB)("startJobDescriptionWorkflowTool", () => {
  let jdId: string;

  beforeAll(async () => {
    await connectDB();
    const jd = await JobDescription.create({
      title: "Staff Engineer",
      department: "Platform",
      level: "senior",
      employmentType: "full_time",
      roleSummary: "Owns platform reliability.",
      coreResponsibilities: ["Drive incident response"],
      requiredQualifications: ["8+ yrs"],
      preferredQualifications: ["Distributed systems"],
      competencies: ["Mentorship"],
      status: "published",
    });
    jdId = String(jd._id);
  });

  it("returns null existing + option lists when called without jdId", async () => {
    const result = await (
      startJobDescriptionWorkflowTool.execute as unknown as (args: {
        jdId?: string;
      }) => Promise<{
        success: boolean;
        existing: unknown;
        levelOptions: string[];
        employmentTypeOptions: string[];
      }>
    )({});
    expect(result.success).toBe(true);
    expect(result.existing).toBeNull();
    expect(result.levelOptions.length).toBeGreaterThan(0);
    expect(result.employmentTypeOptions.length).toBeGreaterThan(0);
  });

  it("loads existing JD when jdId is provided", async () => {
    const result = await (
      startJobDescriptionWorkflowTool.execute as unknown as (args: {
        jdId?: string;
      }) => Promise<{
        success: boolean;
        existing: { title: string } | null;
      }>
    )({ jdId });
    expect(result.success).toBe(true);
    expect(result.existing?.title).toBe("Staff Engineer");
  });
});

describe("openJobDescriptionDocumentTool", () => {
  it("emits a [ASCENTA_WORKING_DOC] with mode=create when no jdId", async () => {
    const result = await (
      openJobDescriptionDocumentTool.execute as unknown as (args: {
        title: string;
        department: string;
        level: string;
        employmentType: string;
        roleSummary: string;
        coreResponsibilities: string[];
        requiredQualifications: string[];
        preferredQualifications: string[];
        competencies: string[];
        status: string;
      }) => Promise<{ workingDocBlock: string }>
    )({
      title: "New Role",
      department: "Eng",
      level: "mid",
      employmentType: "full_time",
      roleSummary: "Builds things.",
      coreResponsibilities: ["Ship code"],
      requiredQualifications: ["3+ yrs"],
      preferredQualifications: [],
      competencies: ["Communication"],
      status: "published",
    });

    const json = result.workingDocBlock.match(
      /\[ASCENTA_WORKING_DOC\]([\s\S]+?)\[\/ASCENTA_WORKING_DOC\]/,
    )?.[1];
    const parsed = JSON.parse(json ?? "{}");
    expect(parsed.workflowType).toBe("create-job-description");
    expect(parsed.prefilled.mode).toBe("create");
    expect(parsed.prefilled.title).toBe("New Role");
  });

  it("emits mode=edit with jdId when jdId is provided", async () => {
    const result = await (
      openJobDescriptionDocumentTool.execute as unknown as (args: {
        jdId?: string;
        title: string;
        department: string;
        level: string;
        employmentType: string;
        roleSummary: string;
        coreResponsibilities: string[];
        requiredQualifications: string[];
        preferredQualifications: string[];
        competencies: string[];
        status: string;
      }) => Promise<{ workingDocBlock: string }>
    )({
      jdId: "abc123",
      title: "Existing Role",
      department: "Eng",
      level: "senior",
      employmentType: "full_time",
      roleSummary: "Refined.",
      coreResponsibilities: ["Ship code"],
      requiredQualifications: ["5+ yrs"],
      preferredQualifications: [],
      competencies: ["Mentorship"],
      status: "published",
    });

    const json = result.workingDocBlock.match(
      /\[ASCENTA_WORKING_DOC\]([\s\S]+?)\[\/ASCENTA_WORKING_DOC\]/,
    )?.[1];
    const parsed = JSON.parse(json ?? "{}");
    expect(parsed.prefilled.mode).toBe("edit");
    expect(parsed.prefilled.jdId).toBe("abc123");
  });
});

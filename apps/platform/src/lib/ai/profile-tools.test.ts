import { describe, it, expect, beforeAll } from "vitest";
import { connectDB } from "@ascenta/db";
import mongoose from "mongoose";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import {
  startMyRoleWorkflowTool,
  openMyRoleDocumentTool,
  suggestFromJDTool,
} from "./profile-tools";

const SKIP_NO_DB = !process.env.MONGODB_URI;

describe.skipIf(SKIP_NO_DB)("startMyRoleWorkflowTool", () => {
  let employeeId: string;

  beforeAll(async () => {
    await connectDB();
    const jd = await JobDescription.create({
      title: "Engineer",
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
    const employee = await Employee.create({
      employeeId: `TEST-${Date.now()}`,
      firstName: "Test",
      lastName: "User",
      email: `test-${Date.now()}@example.com`,
      department: "Eng",
      jobTitle: "Engineer",
      managerName: "Manager One",
      hireDate: new Date("2022-01-01"),
      jobDescriptionId: jd._id,
      profile: {
        pronouns: "they/them",
        getToKnow: { hometown: "Brooklyn" },
      },
    });
    employeeId = String(employee._id);
    await FocusLayer.create({
      employeeId: employee._id,
      responses: {
        uniqueContribution: "I bridge product and engineering on hard problems.",
        highImpactArea: "",
        signatureResponsibility: "",
        workingStyle: "",
      },
      status: "draft",
    });
  });

  it("loads existing About Me + Focus Layer + JD info", async () => {
    const result = await (startMyRoleWorkflowTool.execute as unknown as (
      args: { employeeId: string; employeeName: string },
    ) => Promise<{
      success: boolean;
      existing: {
        aboutMe: { pronouns?: string | null; getToKnow?: { hometown?: string } };
        focusLayer: Record<string, string>;
      };
      jdSnippet: { title: string; coreResponsibilities: string[] } | null;
    }>)({ employeeId, employeeName: "Test User" });

    expect(result.success).toBe(true);
    expect(result.existing.aboutMe.pronouns).toBe("they/them");
    expect(result.existing.aboutMe.getToKnow?.hometown).toBe("Brooklyn");
    expect(result.existing.focusLayer.uniqueContribution).toContain(
      "bridge product",
    );
    expect(result.jdSnippet?.title).toBe("Engineer");
  });

  it("returns null jdSnippet when employee has no JD assigned", async () => {
    const employee = await Employee.create({
      employeeId: `NOJD-${Date.now()}`,
      firstName: "No",
      lastName: "JD",
      email: `nojd-${Date.now()}@example.com`,
      department: "Eng",
      jobTitle: "Mystery",
      managerName: "Manager Two",
      hireDate: new Date("2022-01-01"),
    });
    const result = await (startMyRoleWorkflowTool.execute as unknown as (
      args: { employeeId: string; employeeName: string },
    ) => Promise<{ success: boolean; jdSnippet: unknown }>)({
      employeeId: String(employee._id),
      employeeName: "No JD",
    });
    expect(result.success).toBe(true);
    expect(result.jdSnippet).toBeNull();
  });
});

describe.skipIf(SKIP_NO_DB)("suggestFromJDTool", () => {
  it("returns success: false with a friendly message when the employee has no JD", async () => {
    await connectDB();
    const employee = await Employee.create({
      employeeId: `SUG-${Date.now()}`,
      firstName: "Sug",
      lastName: "Gest",
      email: `sug-${Date.now()}@example.com`,
      department: "Eng",
      jobTitle: "Engineer",
      managerName: "Mgr Mgr",
      hireDate: new Date(),
    });

    const result = await (suggestFromJDTool.execute as unknown as (
      args: { employeeId: string; employeeName: string },
    ) => Promise<{ success: boolean; message: string }>)({
      employeeId: String(employee._id),
      employeeName: "Sug Gest",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/no job description/i);
  });
});

describe("openMyRoleDocumentTool", () => {
  it("emits a [ASCENTA_WORKING_DOC] block with build-my-role workflowType", async () => {
    const result = await (openMyRoleDocumentTool.execute as unknown as (
      args: {
        employeeId: string;
        employeeName: string;
        aboutMe: Record<string, unknown>;
        focusLayer: Record<string, string>;
      },
    ) => Promise<{ workingDocBlock: string }>)({
      employeeId: "abc123",
      employeeName: "Test User",
      aboutMe: { pronouns: "they/them" },
      focusLayer: {
        uniqueContribution: "x".repeat(25),
        highImpactArea: "x".repeat(25),
        signatureResponsibility: "x".repeat(25),
        workingStyle: "x".repeat(25),
      },
    });

    expect(result.workingDocBlock).toContain("[ASCENTA_WORKING_DOC]");
    expect(result.workingDocBlock).toContain("build-my-role");
    const json = result.workingDocBlock.match(
      /\[ASCENTA_WORKING_DOC\]([\s\S]+?)\[\/ASCENTA_WORKING_DOC\]/,
    )?.[1];
    const parsed = JSON.parse(json ?? "{}");
    expect(parsed.workflowType).toBe("build-my-role");
    expect(parsed.action).toBe("open_working_document");
    expect(parsed.prefilled.aboutMe.pronouns).toBe("they/them");
  });
});

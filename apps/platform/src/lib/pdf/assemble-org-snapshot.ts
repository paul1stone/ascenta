import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { FocusLayer } from "@ascenta/db/focus-layer-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";

export interface OrgSnapshotData {
  generatedAt: Date;
  employee: {
    id: string;
    name: string;
    pronouns: string | null;
    jobTitle: string;
    department: string;
    hireDate: Date;
    photoBase64: string | null;
  };
  jobDescription: {
    title: string;
    roleSummary: string;
    coreResponsibilities: string[];
    competencies: string[];
  } | null;
  reportingLine: {
    skipLevelName: string | null;
    managerName: string | null;
    directReportNames: string[];
  };
  team: Array<{ id: string; name: string; jobTitle: string; isSelf: boolean }>;
  focusLayer: {
    status: "confirmed";
    responses: {
      uniqueContribution: string;
      highImpactArea: string;
      signatureResponsibility: string;
      workingStyle: string;
    };
  } | null;
  foundation: {
    mission: string | null;
    vision: string | null;
    coreValues: string[];
  } | null;
}

type EmployeeDoc = {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerName: string;
  hireDate: Date;
  jobDescriptionId?: mongoose.Types.ObjectId | null;
  profile?: { pronouns?: string | null; photoBase64?: string | null };
};

const fullName = (e: { firstName: string; lastName: string }) =>
  `${e.firstName} ${e.lastName}`;
const norm = (s: string) => s.trim().toLowerCase();

function parseValues(values: string | null | undefined): string[] {
  if (!values || !values.trim()) return [];
  return values
    .split(/[,\n]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function assembleOrgSnapshot(
  employeeId: string,
): Promise<OrgSnapshotData> {
  await connectDB();
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new Error("Invalid employee id");
  }
  const me = (await Employee.findById(employeeId).lean()) as EmployeeDoc | null;
  if (!me) throw new Error("Employee not found");

  const [allEmployeesRaw, foundationDoc] = await Promise.all([
    Employee.find({ status: "active" }).lean(),
    CompanyFoundation.findOne({ status: "published" })
      .lean()
      .catch(() => null),
  ]);
  const allEmployees = allEmployeesRaw as unknown as EmployeeDoc[];

  const byName = new Map<string, EmployeeDoc>(
    allEmployees.map((e) => [norm(fullName(e)), e]),
  );
  const manager = me.managerName ? (byName.get(norm(me.managerName)) ?? null) : null;
  const skip =
    manager && manager.managerName
      ? (byName.get(norm(manager.managerName)) ?? null)
      : null;

  const meName = norm(fullName(me));
  const directReports = allEmployees
    .filter((e) => norm(e.managerName ?? "") === meName)
    .map((e) => fullName(e));

  const team = allEmployees
    .filter((e) => e.department === me.department)
    .slice(0, 8)
    .map((e) => ({
      id: String(e._id),
      name: fullName(e),
      jobTitle: e.jobTitle ?? "",
      isSelf: String(e._id) === String(me._id),
    }));

  let jd: OrgSnapshotData["jobDescription"] = null;
  if (me.jobDescriptionId) {
    const found = (await JobDescription.findById(me.jobDescriptionId).lean()) as {
      title: string;
      roleSummary: string;
      coreResponsibilities?: string[];
      competencies?: string[];
    } | null;
    if (found) {
      jd = {
        title: found.title,
        roleSummary: found.roleSummary,
        coreResponsibilities: found.coreResponsibilities ?? [],
        competencies: found.competencies ?? [],
      };
    }
  }

  let focusLayer: OrgSnapshotData["focusLayer"] = null;
  const fl = (await FocusLayer.findOne({ employeeId: me._id }).lean()) as {
    status?: string;
    responses?: OrgSnapshotData["focusLayer"] extends infer T
      ? T extends { responses: infer R }
        ? R
        : never
      : never;
  } | null;
  if (fl && fl.status === "confirmed" && fl.responses) {
    focusLayer = {
      status: "confirmed",
      responses: fl.responses as NonNullable<
        OrgSnapshotData["focusLayer"]
      >["responses"],
    };
  }

  const foundation = foundationDoc
    ? {
        mission:
          (foundationDoc as { mission?: string | null }).mission?.trim() || null,
        vision:
          (foundationDoc as { vision?: string | null }).vision?.trim() || null,
        coreValues: parseValues(
          (foundationDoc as { values?: string | null }).values,
        ),
      }
    : null;

  return {
    generatedAt: new Date(),
    employee: {
      id: String(me._id),
      name: fullName(me),
      pronouns: me.profile?.pronouns ?? null,
      jobTitle: me.jobTitle,
      department: me.department,
      hireDate: me.hireDate,
      photoBase64: me.profile?.photoBase64 ?? null,
    },
    jobDescription: jd,
    reportingLine: {
      skipLevelName: skip ? fullName(skip) : null,
      managerName: manager ? fullName(manager) : null,
      directReportNames: directReports,
    },
    team,
    focusLayer,
    foundation,
  };
}

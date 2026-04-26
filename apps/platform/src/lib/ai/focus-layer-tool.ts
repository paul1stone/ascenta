import { generateObject } from "ai";
import { z } from "zod";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { JobDescription } from "@ascenta/db/job-description-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { resolveModel } from "./providers";

const responseSchema = z.object({
  uniqueContribution: z.string().min(20).max(2000),
  highImpactArea: z.string().min(20).max(2000),
  signatureResponsibility: z.string().min(20).max(2000),
  workingStyle: z.string().min(20).max(2000),
});

export type FocusLayerSuggestion = z.infer<typeof responseSchema>;

interface EmployeeShape {
  _id: unknown;
  firstName: string;
  lastName: string;
  department: string;
  jobDescriptionId?: unknown;
}

interface JdShape {
  title: string;
  coreResponsibilities: string[];
  competencies: string[];
}

interface CheckInShape {
  participate?: { employeeKeyTakeaways?: string | null };
  employeePrepare?: { distilledPreview?: string | null };
}

interface FoundationShape {
  mission?: string;
}

export async function generateFocusLayerSuggestion(
  employeeId: string
): Promise<FocusLayerSuggestion> {
  await connectDB();
  const employee = await Employee.findById(employeeId).lean<EmployeeShape>();
  if (!employee) throw new Error("Employee not found");
  if (!employee.jobDescriptionId) {
    throw new Error("Assign a job description before generating suggestions");
  }
  const jd = await JobDescription.findById(employee.jobDescriptionId).lean<JdShape>();
  if (!jd) throw new Error("Job description not found");

  const recentCheckIns = await CheckIn.find({ employee: employee._id })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean<CheckInShape[]>();
  const foundation = await CompanyFoundation.findOne().lean<FoundationShape>();

  const checkInSummary =
    recentCheckIns
      .map(
        (c) =>
          c.participate?.employeeKeyTakeaways || c.employeePrepare?.distilledPreview || ""
      )
      .filter(Boolean)
      .join(" / ") || "(no recent check-ins)";

  const prompt = `You are helping ${employee.firstName} ${employee.lastName}, a ${jd.title} in ${employee.department}, draft the Focus Layer for their role.

Role responsibilities: ${jd.coreResponsibilities.slice(0, 5).join("; ")}.
Role competencies: ${jd.competencies.join(", ")}.
Recent check-in themes: ${checkInSummary}.
${foundation?.mission ? `Org mission: ${foundation.mission}.` : ""}

Generate first-draft responses to these four prompts. Each response should be 2-3 sentences in plain, first-person language. Ground each in the actual responsibilities and observed work, not generic platitudes:

1. What I bring uniquely — what does this person bring that no one else does in quite the same way?
2. Where I create the most impact — what work creates the biggest result for the team?
3. Responsibilities I own that shape the team — what do they own in a way that shapes how others work?
4. How I prefer to work and collaborate — what working patterns help them and the team thrive?`;

  const { object } = await generateObject({
    model: resolveModel(),
    schema: responseSchema,
    prompt,
  });
  return object;
}

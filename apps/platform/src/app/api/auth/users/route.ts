import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { NextResponse } from "next/server";
import type { Types } from "mongoose";

type EmployeeLean = {
  _id: Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  managerName: string;
  demoPersona: "employee" | "manager" | "hr";
};

const PERSONA_ORDER: Record<EmployeeLean["demoPersona"], number> = {
  employee: 0,
  manager: 1,
  hr: 2,
};

export async function GET() {
  await connectDB();

  const personas = (await Employee.find({
    demoPersona: { $in: ["employee", "manager", "hr"] },
    status: "active",
  })
    .select("employeeId firstName lastName department jobTitle managerName demoPersona")
    .lean()) as unknown as EmployeeLean[];

  // Resolve managerId for each persona by managerName lookup, so the FE
  // has the same shape as before.
  const allByName = new Map<string, Types.ObjectId>();
  if (personas.some((p) => p.managerName)) {
    const lookup = (await Employee.find({
      $or: personas.map((p) => {
        const parts = p.managerName.split(" ");
        return {
          firstName: new RegExp(`^${parts[0] ?? ""}$`, "i"),
          lastName: new RegExp(`^${parts[parts.length - 1] ?? ""}$`, "i"),
          status: "active",
        };
      }),
    })
      .select("_id firstName lastName")
      .lean()) as unknown as { _id: Types.ObjectId; firstName: string; lastName: string }[];
    for (const m of lookup) {
      allByName.set(`${m.firstName} ${m.lastName}`.toLowerCase(), m._id);
    }
  }

  const users = personas
    .sort((a, b) => PERSONA_ORDER[a.demoPersona] - PERSONA_ORDER[b.demoPersona])
    .map((emp) => {
      const managerId = allByName.get(emp.managerName.toLowerCase());
      return {
        id: emp._id.toString(),
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department,
        title: emp.jobTitle,
        role: emp.demoPersona,
        managerId: managerId ? managerId.toString() : undefined,
        managerName: emp.managerName,
      };
    });

  return NextResponse.json({ users });
}

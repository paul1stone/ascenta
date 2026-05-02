import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import type { NextRequest } from "next/server";
import type { Types } from "mongoose";
import type { UserRole } from "./auth-context";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type EmployeeLean = {
  _id: Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  managerName: string;
  demoPersona: "employee" | "manager" | "hr" | null;
};

export type ServerUser = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  role: UserRole;
};

export async function getServerUser(req: NextRequest): Promise<ServerUser | null> {
  const userId = req.headers.get("x-dev-user-id");
  if (!userId) return null;

  await connectDB();
  const employee = (await Employee.findById(userId)
    .select("employeeId firstName lastName department jobTitle managerName demoPersona")
    .lean()) as unknown as EmployeeLean | null;
  if (!employee) return null;

  let role: UserRole;
  if (employee.demoPersona) {
    role = employee.demoPersona;
  } else if (/human resources|people ops|\bhr\b/i.test(employee.department)) {
    role = "hr";
  } else {
    const directReportCount = await Employee.countDocuments({
      managerName: {
        $regex: new RegExp(
          `${escapeRegex(employee.firstName)}.*${escapeRegex(employee.lastName)}`,
          "i",
        ),
      },
      status: "active",
    });
    role = directReportCount > 0 ? "manager" : "employee";
  }

  return {
    id: employee._id.toString(),
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    department: employee.department,
    role,
  };
}

import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { NextRequest, NextResponse } from "next/server";
import type { Types } from "mongoose";

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

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  await connectDB();
  const employee = (await Employee.findById(userId)
    .select("employeeId firstName lastName department jobTitle managerName demoPersona")
    .lean()) as unknown as EmployeeLean | null;

  if (!employee) {
    return NextResponse.json({ user: null });
  }

  const directReports = (await Employee.find({
    managerName: {
      $regex: new RegExp(`${escapeRegex(employee.firstName)}.*${escapeRegex(employee.lastName)}`, "i"),
    },
    status: "active",
  })
    .select("_id")
    .lean()) as unknown as { _id: Types.ObjectId }[];

  const hasDirectReports = directReports.length > 0;

  let managerId: string | undefined;
  if (employee.managerName) {
    const nameParts = employee.managerName.split(" ");
    const manager = (await Employee.findOne({
      firstName: { $regex: new RegExp(escapeRegex(nameParts[0]), "i") },
      lastName: { $regex: new RegExp(escapeRegex(nameParts[nameParts.length - 1]), "i") },
      status: "active",
    })
      .select("_id")
      .lean()) as unknown as { _id: Types.ObjectId } | null;
    if (manager) {
      managerId = manager._id.toString();
    }
  }

  // Demo personas carry their role explicitly; everything else falls back to
  // the legacy heuristic (HR by department, manager by direct reports).
  const role = employee.demoPersona
    ? employee.demoPersona
    : /human resources|people ops|\bhr\b/i.test(employee.department)
      ? "hr"
      : hasDirectReports
        ? "manager"
        : "employee";

  return NextResponse.json({
    user: {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role,
      title: employee.jobTitle,
      department: employee.department,
      managerId,
      directReports: hasDirectReports
        ? directReports.map((r) => r._id.toString())
        : undefined,
    },
  });
}

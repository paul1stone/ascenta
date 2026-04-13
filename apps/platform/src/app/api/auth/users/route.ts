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
};

export async function GET() {
  await connectDB();

  const employees = (await Employee.find({ status: "active" })
    .select("employeeId firstName lastName department jobTitle managerName")
    .sort({ lastName: 1 })
    .lean()) as unknown as EmployeeLean[];

  const users = employees.map((emp) => {
    const hasDirectReports = employees.some(
      (e) =>
        e.managerName &&
        e.managerName.toLowerCase().includes(emp.firstName.toLowerCase()) &&
        e.managerName.toLowerCase().includes(emp.lastName.toLowerCase())
    );

    // Best-effort manager lookup by matching managerName to another employee
    let managerId: string | undefined;
    if (emp.managerName) {
      const nameParts = emp.managerName.split(" ");
      const manager = employees.find(
        (e) =>
          e.firstName.toLowerCase() === nameParts[0].toLowerCase() &&
          e.lastName.toLowerCase() ===
            nameParts[nameParts.length - 1].toLowerCase()
      );
      if (manager) {
        managerId = manager._id.toString();
      }
    }

    // Determine role: hr > manager > employee
    const isHR = /human resources|people ops|\bhr\b/i.test(emp.department);
    const role = isHR ? "hr" : hasDirectReports ? "manager" : "employee";

    return {
      id: emp._id.toString(),
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      title: emp.jobTitle,
      role,
      managerId,
      managerName: emp.managerName,
    };
  });

  return NextResponse.json({ users });
}

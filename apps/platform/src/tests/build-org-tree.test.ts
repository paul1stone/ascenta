// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildOrgTree } from "@ascenta/db/employees";

const baseEmp = (over: Partial<Record<string, unknown>>) => ({
  _id: { toString: () => (over.id as string | undefined) ?? "x" },
  id: over.id as string | undefined,
  employeeId: over.id as string | undefined,
  firstName: "F",
  lastName: "L",
  jobTitle: "T",
  department: "D",
  managerName: "",
  ...over,
});

describe("buildOrgTree", () => {
  it("returns empty roots for empty input", () => {
    const r = buildOrgTree([], []);
    expect(r.roots).toEqual([]);
    expect(r.totalEmployees).toBe(0);
  });

  it("builds linear chain CEO → Manager → IC", () => {
    const ceo = baseEmp({ id: "1", firstName: "Cee", lastName: "Eo", managerName: "" });
    const mgr = baseEmp({ id: "2", firstName: "Mary", lastName: "Manager", managerName: "Cee Eo" });
    const ic = baseEmp({ id: "3", firstName: "Ian", lastName: "Cee", managerName: "Mary Manager" });
    const r = buildOrgTree([ceo, mgr, ic], []);
    expect(r.roots).toHaveLength(1);
    expect(r.roots[0].name).toBe("Cee Eo");
    expect(r.roots[0].children).toHaveLength(1);
    expect(r.roots[0].children[0].children).toHaveLength(1);
    expect(r.resolvedEdges).toBe(2);
  });

  it("makes unresolved employees roots and lists them in unresolvedEmployees", () => {
    const a = baseEmp({ id: "1", firstName: "A", lastName: "One", managerName: "" });
    const orphan = baseEmp({ id: "2", firstName: "Or", lastName: "Phan", managerName: "Nobody Real" });
    const r = buildOrgTree([a, orphan], []);
    expect(r.roots.map((n) => n.name).sort()).toEqual(["A One", "Or Phan"]);
    expect(r.unresolvedEmployees).toContain("Or Phan");
  });

  it("groups unfilled JDs by department", () => {
    const r = buildOrgTree(
      [],
      [
        { id: "j1", title: "Eng", department: "Engineering", level: "senior", assignedCount: 0 },
        { id: "j2", title: "AE", department: "Sales", level: "mid", assignedCount: 0 },
        { id: "j3", title: "Filled", department: "Sales", level: "lead", assignedCount: 5 },
      ],
    );
    expect(r.unfilledRoles).toHaveLength(2);
    expect(r.unfilledRoles.find((c) => c.department === "Sales")?.roles).toHaveLength(1);
  });
});

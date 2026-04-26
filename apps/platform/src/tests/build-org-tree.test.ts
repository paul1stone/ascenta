// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildOrgTree, buildOrgNeighborhood } from "@ascenta/db/employees";

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

  it("treats placeholder managerName sentinels as intentional roots, not unresolved", () => {
    const ceo = baseEmp({ id: "1", firstName: "Cee", lastName: "Eo", managerName: "Executive Team" });
    const ic = baseEmp({ id: "2", firstName: "Ian", lastName: "Cee", managerName: "Cee Eo" });
    const r = buildOrgTree([ceo, ic], []);
    expect(r.roots).toHaveLength(1);
    expect(r.roots[0].name).toBe("Cee Eo");
    expect(r.unresolvedEmployees).not.toContain("Cee Eo");
  });

  it("buildOrgNeighborhood trims to skip-up + manager + peers + focal + reports + skip-down", () => {
    // CEO -> VP -> Mgr -> {Focal, Peer}; Focal -> {Report -> {Grand}}
    const ceo = baseEmp({ id: "1", firstName: "C", lastName: "Eo", managerName: "Executive Team" });
    const vp = baseEmp({ id: "2", firstName: "V", lastName: "Pee", managerName: "C Eo" });
    const mgr = baseEmp({ id: "3", firstName: "M", lastName: "Gr", managerName: "V Pee" });
    const focal = baseEmp({ id: "4", firstName: "F", lastName: "Cl", managerName: "M Gr" });
    const peer = baseEmp({ id: "5", firstName: "P", lastName: "Eer", managerName: "M Gr" });
    const report = baseEmp({ id: "6", firstName: "R", lastName: "Pt", managerName: "F Cl" });
    const grand = baseEmp({ id: "7", firstName: "G", lastName: "Rd", managerName: "R Pt" });
    const unrelated = baseEmp({ id: "8", firstName: "U", lastName: "Nr", managerName: "C Eo" });

    const tree = buildOrgTree([ceo, vp, mgr, focal, peer, report, grand, unrelated], []);
    const nbhd = buildOrgNeighborhood(tree.roots, "4");

    // Top of neighborhood is the skip-up (VP)
    expect(nbhd).toHaveLength(1);
    expect(nbhd[0].id).toBe("2");
    // VP has only the manager as a child (not the unrelated branch)
    expect(nbhd[0].children).toHaveLength(1);
    expect(nbhd[0].children[0].id).toBe("3");
    // Manager shows focal + peers
    const mgrNode = nbhd[0].children[0];
    expect(mgrNode.children.map((c) => c.id).sort()).toEqual(["4", "5"]);
    // Peer is a leaf (no team shown)
    const peerNode = mgrNode.children.find((c) => c.id === "5")!;
    expect(peerNode.children).toHaveLength(0);
    // Focal shows reports → skip-down (grand) as leaf
    const focalNode = mgrNode.children.find((c) => c.id === "4")!;
    expect(focalNode.children.map((c) => c.id)).toEqual(["6"]);
    expect(focalNode.children[0].children.map((c) => c.id)).toEqual(["7"]);
    expect(focalNode.children[0].children[0].children).toHaveLength(0);
  });

  it("buildOrgNeighborhood returns full roots when focal id is missing", () => {
    const ceo = baseEmp({ id: "1", firstName: "C", lastName: "Eo", managerName: "Executive Team" });
    const tree = buildOrgTree([ceo], []);
    const nbhd = buildOrgNeighborhood(tree.roots, "missing-id");
    expect(nbhd).toBe(tree.roots);
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

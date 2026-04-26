/**
 * Pure org-tree builder utilities — no Mongoose imports, safe to use
 * from client components. Server code that needs the DB-backed view
 * should keep importing the API endpoint result; this module only owns
 * the data shapes and the in-memory tree-shaping logic.
 */

export type OrgEmpInput = {
  id?: string;
  _id?: { toString: () => string };
  employeeId?: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerName: string;
  jobDescriptionId?: string | null;
  profile?: { photoBase64?: string | null };
};

export type OrgJdInput = {
  id: string;
  title: string;
  department: string;
  level: string;
  assignedCount: number;
};

export interface OrgNode {
  id: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  managerId: string | null;
  photoBase64: string | null;
  jobDescriptionTitle: string | null;
  children: OrgNode[];
}

export interface UnfilledRoleCluster {
  department: string;
  roles: Array<{ jobDescriptionId: string; title: string; level: string }>;
}

export interface OrgTreeResponse {
  roots: OrgNode[];
  unfilledRoles: UnfilledRoleCluster[];
  totalEmployees: number;
  resolvedEdges: number;
  unresolvedEmployees: string[];
}

const orgIdOf = (e: OrgEmpInput): string =>
  e.id ?? (e._id ? e._id.toString() : "");
const orgFullName = (e: OrgEmpInput): string => `${e.firstName} ${e.lastName}`;
const orgNorm = (s: string): string => s.trim().toLowerCase();

// Placeholder managerName values that indicate an intentional root
// (e.g. CEO reporting to "the Board") rather than a data quality issue.
const ROOT_SENTINELS = new Set([
  "executive team",
  "board",
  "board of directors",
  "external",
  "n/a",
  "none",
]);

export function buildOrgTree(
  employees: OrgEmpInput[],
  jobDescriptions: OrgJdInput[],
  jdTitleById: Map<string, string> = new Map(jobDescriptions.map((j) => [j.id, j.title])),
): OrgTreeResponse {
  const byName = new Map<string, OrgEmpInput>();
  for (const e of employees) byName.set(orgNorm(orgFullName(e)), e);

  const nodes = new Map<string, OrgNode>();
  for (const e of employees) {
    const id = orgIdOf(e);
    nodes.set(id, {
      id,
      employeeId: e.employeeId ?? id,
      name: orgFullName(e),
      firstName: e.firstName,
      lastName: e.lastName,
      jobTitle: e.jobTitle,
      department: e.department,
      managerId: null,
      photoBase64: e.profile?.photoBase64 ?? null,
      jobDescriptionTitle: e.jobDescriptionId
        ? jdTitleById.get(String(e.jobDescriptionId)) ?? null
        : null,
      children: [],
    });
  }

  const unresolved: string[] = [];
  let resolvedEdges = 0;
  for (const e of employees) {
    const id = orgIdOf(e);
    const mgrName = (e.managerName ?? "").trim();
    if (!mgrName || ROOT_SENTINELS.has(orgNorm(mgrName))) continue;
    const mgr = byName.get(orgNorm(mgrName));
    if (!mgr) {
      unresolved.push(orgFullName(e));
      continue;
    }
    const mgrId = orgIdOf(mgr);
    if (mgrId === id) continue; // self-reference; skip
    const node = nodes.get(id)!;
    node.managerId = mgrId;
    resolvedEdges++;
  }

  // Cycle detection: walking managerId chains must terminate.
  for (const node of nodes.values()) {
    const seen = new Set<string>([node.id]);
    let cur = node.managerId ? nodes.get(node.managerId) : null;
    while (cur) {
      if (seen.has(cur.id)) {
        node.managerId = null;
        if (!unresolved.includes(node.name)) unresolved.push(node.name);
        break;
      }
      seen.add(cur.id);
      cur = cur.managerId ? nodes.get(cur.managerId) : null;
    }
  }

  for (const node of nodes.values()) {
    if (node.managerId) {
      const parent = nodes.get(node.managerId);
      if (parent) parent.children.push(node);
    }
  }
  for (const node of nodes.values()) {
    node.children.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }
  const roots = Array.from(nodes.values())
    .filter((n) => !n.managerId)
    .sort(
      (a, b) =>
        a.department.localeCompare(b.department) || a.lastName.localeCompare(b.lastName),
    );

  const unfilledByDept = new Map<string, UnfilledRoleCluster>();
  for (const j of jobDescriptions) {
    if (j.assignedCount > 0) continue;
    if (!unfilledByDept.has(j.department)) {
      unfilledByDept.set(j.department, { department: j.department, roles: [] });
    }
    unfilledByDept.get(j.department)!.roles.push({
      jobDescriptionId: j.id,
      title: j.title,
      level: j.level,
    });
  }

  return {
    roots,
    unfilledRoles: Array.from(unfilledByDept.values()),
    totalEmployees: employees.length,
    resolvedEdges,
    unresolvedEmployees: unresolved,
  };
}

function findOrgPath(
  roots: OrgNode[],
  targetId: string,
  trail: OrgNode[] = [],
): OrgNode[] | null {
  for (const n of roots) {
    const next = [...trail, n];
    if (n.id === targetId) return next;
    const hit = findOrgPath(n.children, targetId, next);
    if (hit) return hit;
  }
  return null;
}

/**
 * Trim the org tree to the focal person's local neighborhood:
 * skip-up (focal's manager's manager) → manager (with focal's peers as
 * leaf nodes) → focal (with direct reports → skip-down as leaf nodes).
 * Returns the original roots when the focal id isn't found.
 */
export function buildOrgNeighborhood(roots: OrgNode[], focalId: string): OrgNode[] {
  const path = findOrgPath(roots, focalId);
  if (!path) return roots;

  const focal = path[path.length - 1];
  const manager = path.length >= 2 ? path[path.length - 2] : null;
  const skipUp = path.length >= 3 ? path[path.length - 3] : null;

  const trimmedFocal: OrgNode = {
    ...focal,
    children: focal.children.map((child) => ({
      ...child,
      children: child.children.map((g) => ({ ...g, children: [] })),
    })),
  };

  if (!manager) return [trimmedFocal];

  const trimmedManager: OrgNode = {
    ...manager,
    children: manager.children.map((sib) =>
      sib.id === focalId ? trimmedFocal : { ...sib, children: [] },
    ),
  };

  if (!skipUp) return [trimmedManager];

  return [{ ...skipUp, children: [trimmedManager] }];
}

"use client";

interface NodeProps {
  node: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    jobDescriptionTitle: string | null;
    department: string;
    photoBase64: string | null;
  };
  dimmed: boolean;
  highlighted: boolean;
  showPhoto: boolean;
  onClick: () => void;
}

function deptColor(department: string): string {
  const known: Record<string, string> = {
    Engineering: "#6688bb",
    Product: "#6688bb",
    People: "#44aa99",
    "Human Resources": "#44aa99",
    Sales: "#aa8866",
    Marketing: "#aa8866",
    Operations: "#bb6688",
    Finance: "#cc6677",
    Legal: "#8888aa",
  };
  return known[department] ?? "#94a3b8";
}

export function OrgChartNode({ node, dimmed, highlighted, showPhoto, onClick }: NodeProps) {
  const initials = `${node.firstName[0] ?? ""}${node.lastName[0] ?? ""}`;
  const color = deptColor(node.department);
  return (
    <div
      onClick={onClick}
      style={{
        opacity: dimmed ? 0.3 : 1,
        boxShadow: highlighted ? `0 0 0 2px ${color}` : "0 1px 2px rgba(0,0,0,0.06)",
        borderLeft: `3px solid ${color}`,
      }}
      className="cursor-pointer bg-white rounded-md border h-full px-2 py-1 flex items-center gap-2"
    >
      <div className="size-7 rounded-full bg-muted/40 grid place-items-center text-[10px] font-semibold overflow-hidden flex-shrink-0">
        {showPhoto && node.photoBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.photoBase64} alt="" className="size-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{node.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {node.jobDescriptionTitle ?? node.jobTitle}
        </p>
      </div>
    </div>
  );
}

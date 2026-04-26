import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OrgChartCanvas } from "@/components/plan/org-chart/org-chart-canvas";

const sample = {
  roots: [
    {
      id: "1",
      employeeId: "E1",
      name: "A One",
      firstName: "A",
      lastName: "One",
      jobTitle: "CEO",
      jobDescriptionTitle: null,
      department: "Operations",
      managerId: null,
      photoBase64: null,
      children: [
        {
          id: "2",
          employeeId: "E2",
          name: "B Two",
          firstName: "B",
          lastName: "Two",
          jobTitle: "Eng",
          jobDescriptionTitle: null,
          department: "Engineering",
          managerId: "1",
          photoBase64: null,
          children: [],
        },
      ],
    },
  ],
};

describe("OrgChartCanvas", () => {
  it("renders one foreignObject per node", () => {
    const { container } = render(
      <OrgChartCanvas
        roots={sample.roots as never}
        selectedDepartments={new Set()}
        highlightedNodeId={null}
        onNodeClick={() => {}}
      />,
    );
    const fos = container.querySelectorAll("foreignObject");
    expect(fos.length).toBe(2);
  });
});

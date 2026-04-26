import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FocusLayerForm } from "@/components/plan/focus-layer/focus-layer-form";

const initial = {
  uniqueContribution: "",
  highImpactArea: "",
  signatureResponsibility: "",
  workingStyle: "",
};

describe("FocusLayerForm", () => {
  it("renders all 4 prompt fields", () => {
    render(
      <FocusLayerForm
        employeeId="x"
        initialResponses={initial}
        initialStatus="draft"
        jobDescriptionAssigned={true}
        onChanged={() => {}}
      />
    );
    expect(screen.getByText(/What I bring uniquely/)).toBeInTheDocument();
    expect(screen.getByText(/Where I create the most impact/)).toBeInTheDocument();
    expect(screen.getByText(/Responsibilities I own/)).toBeInTheDocument();
    expect(screen.getByText(/How I prefer to work/)).toBeInTheDocument();
  });

  it("hides AI button when no JD assigned", () => {
    render(
      <FocusLayerForm
        employeeId="x"
        initialResponses={initial}
        initialStatus="draft"
        jobDescriptionAssigned={false}
        onChanged={() => {}}
      />
    );
    expect(screen.queryByText(/Suggest from my role/)).not.toBeInTheDocument();
  });
});

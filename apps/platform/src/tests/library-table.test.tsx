import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LibraryTable } from "@/components/plan/job-descriptions/library-table";

const item = {
  id: "1",
  title: "Software Engineer",
  department: "Engineering",
  level: "mid" as const,
  employmentType: "full_time" as const,
  roleSummary: "Builds software systems for the company.",
  coreResponsibilities: ["x"],
  requiredQualifications: ["y"],
  preferredQualifications: [],
  competencies: ["z"],
  status: "published" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignedCount: 3,
};

describe("LibraryTable", () => {
  it("renders rows from items", () => {
    render(<LibraryTable items={[item]} onSelect={vi.fn()} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows empty state when items is empty", () => {
    render(<LibraryTable items={[]} onSelect={vi.fn()} />);
    expect(screen.getByText(/No job descriptions/i)).toBeInTheDocument();
  });

  it("calls onSelect when row clicked", () => {
    const onSelect = vi.fn();
    render(<LibraryTable items={[item]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Software Engineer"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });
});

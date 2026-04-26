import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { JdForm } from "@/components/plan/job-descriptions/jd-form";

describe("JdForm", () => {
  it("renders all required fields", () => {
    render(<JdForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Responsibilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Required Qualifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Competencies/i)).toBeInTheDocument();
  });

  it("shows validation errors when submit is clicked with empty form", async () => {
    render(<JdForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });
});

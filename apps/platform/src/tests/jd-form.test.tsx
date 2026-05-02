import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { JdForm } from "@/components/plan/job-descriptions/jd-form";
import { AuthContext } from "@/lib/auth/auth-context";

const fakeUser = {
  id: "user-1",
  employeeId: "E1",
  name: "Jane HR",
  firstName: "Jane",
  lastName: "HR",
  role: "hr" as const,
  title: "HR Manager",
  department: "People Ops",
};

function renderWithAuth(ui: React.ReactElement) {
  return render(
    <AuthContext.Provider
      value={{
        user: fakeUser,
        switchUser: vi.fn(async () => {}),
        isDevMode: true,
        loading: false,
      }}
    >
      {ui}
    </AuthContext.Provider>,
  );
}

describe("JdForm", () => {
  it("renders all required fields", () => {
    renderWithAuth(
      <JdForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Responsibilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Required Qualifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Competencies/i)).toBeInTheDocument();
  });

  it("shows validation errors when submit is clicked with empty form", async () => {
    renderWithAuth(
      <JdForm mode="create" onSuccess={vi.fn()} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("locks department field when lockedDepartment is provided", () => {
    renderWithAuth(
      <JdForm
        mode="create"
        lockedDepartment="Engineering"
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const dept = screen.getByLabelText(/Department/i) as HTMLInputElement;
    expect(dept).toBeDisabled();
    expect(dept.value).toBe("Engineering");
  });
});

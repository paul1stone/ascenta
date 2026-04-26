// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/dashboard/employees/")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            employee: {
              _id: "x",
              firstName: "Jane",
              lastName: "Doe",
              jobTitle: "Engineer",
              department: "Engineering",
              managerName: "Mgr",
            },
            notes: [],
            documents: [],
          }),
        });
      }
      if (url.includes("/api/employees/") && url.endsWith("/profile")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            profile: {
              getToKnow: { personalBio: "Hi.", hobbies: "Running" },
            },
            completion: {
              complete: 2,
              total: 7,
              percent: 28,
              missingKeys: [],
            },
          }),
        });
      }
      if (url.includes("/api/focus-layers/")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ focusLayer: null }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    })
  );
});

import { EmployeeProfileCard } from "@/components/plan/profile/employee-profile-card";

describe("EmployeeProfileCard inline mode", () => {
  it("renders employee header and completion badge", async () => {
    render(<EmployeeProfileCard employeeId="x" mode="inline" />);
    expect(await screen.findByText(/Jane Doe/)).toBeInTheDocument();
    expect(await screen.findByText(/2 of 7 complete/)).toBeInTheDocument();
  });

  it("renders Personal bio and Hobbies values", async () => {
    render(<EmployeeProfileCard employeeId="x" mode="inline" />);
    expect(await screen.findByText("Hi.")).toBeInTheDocument();
    expect(await screen.findByText("Running")).toBeInTheDocument();
  });
});

describe("EmployeeProfileCard with confirmed focus layer", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/dashboard/employees/")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              employee: {
                _id: "x",
                firstName: "Jane",
                lastName: "Doe",
                jobTitle: "Engineer",
                department: "Engineering",
                managerName: "Mgr",
              },
              notes: [],
              documents: [],
            }),
          });
        }
        if (url.includes("/api/employees/") && url.endsWith("/profile")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              profile: { getToKnow: {} },
              completion: { complete: 0, total: 7, percent: 0, missingKeys: [] },
            }),
          });
        }
        if (url.includes("/api/focus-layers/")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              focusLayer: {
                status: "confirmed",
                responses: { uniqueContribution: "Ship Q3 features" },
                managerConfirmed: {
                  at: "2026-04-01T00:00:00Z",
                  byUserId: "m",
                  comment: "looks good",
                },
              },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );
  });

  it("shows focus layer block when confirmed", async () => {
    render(<EmployeeProfileCard employeeId="x" mode="inline" />);
    expect(await screen.findByText(/Focus Layer/)).toBeInTheDocument();
    expect(await screen.findByText(/Ship Q3 features/)).toBeInTheDocument();
  });
});

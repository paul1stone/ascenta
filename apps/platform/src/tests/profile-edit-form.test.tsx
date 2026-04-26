// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ProfileEditForm } from "@/components/plan/profile/profile-edit-form";

const initial = {
  photoBase64: null,
  pronouns: "",
  preferredChannel: "",
  getToKnow: {
    personalBio: "",
    hobbies: "",
    funFacts: [""],
    askMeAbout: "",
    hometown: "",
    currentlyConsuming: "",
    employeeChoice: { label: "", value: "" },
  },
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as never)
  );
});

describe("ProfileEditForm", () => {
  it("renders all GET_TO_KNOW_FIELDS", () => {
    render(
      <ProfileEditForm
        employeeId="x"
        initialProfile={initial as never}
        onChanged={() => {}}
      />
    );
    expect(screen.getByText(/Personal bio/)).toBeInTheDocument();
    expect(screen.getByText(/Hobbies and interests/)).toBeInTheDocument();
    expect(screen.getByText(/Ask me about/)).toBeInTheDocument();
    expect(screen.getByText(/Hometown or background/)).toBeInTheDocument();
    expect(screen.getByText(/Currently reading or listening to/)).toBeInTheDocument();
  });

  it("renders the fun-facts add button and one initial input", async () => {
    const { container } = render(
      <ProfileEditForm
        employeeId="x"
        initialProfile={initial as never}
        onChanged={() => {}}
      />
    );
    await waitFor(() => {
      const inputs = container.querySelectorAll<HTMLInputElement>(
        'input[placeholder*="state record"]'
      );
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByRole("button", { name: /Add fact/ })).toBeInTheDocument();
  });

  it("renders separate label and value for employee choice", () => {
    render(
      <ProfileEditForm
        employeeId="x"
        initialProfile={initial as never}
        onChanged={() => {}}
      />
    );
    expect(screen.getByPlaceholderText(/Field name/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Field content/)).toBeInTheDocument();
  });
});

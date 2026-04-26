// @vitest-environment node
import { describe, it, expect } from "vitest";
import { profilePatchSchema } from "@/lib/validations/employee-profile";
import { computeProfileCompletion } from "@ascenta/db/employees";

describe("profilePatchSchema", () => {
  it("accepts partial input", () => {
    expect(profilePatchSchema.parse({})).toEqual({});
    expect(
      profilePatchSchema.parse({ getToKnow: { personalBio: "x" } })
    ).toBeDefined();
  });

  it("rejects funFacts > 3", () => {
    expect(() =>
      profilePatchSchema.parse({ getToKnow: { funFacts: ["a", "b", "c", "d"] } })
    ).toThrow();
  });

  it("rejects non-data-URL photo", () => {
    expect(() =>
      profilePatchSchema.parse({ photoBase64: "not a data url" })
    ).toThrow();
  });

  it("rejects photo over 280KB", () => {
    expect(() =>
      profilePatchSchema.parse({
        photoBase64: "data:image/png;base64," + "A".repeat(280_001),
      })
    ).toThrow();
  });

  it("accepts a valid data-URL photo", () => {
    const photo = "data:image/jpeg;base64," + "A".repeat(1000);
    expect(profilePatchSchema.parse({ photoBase64: photo })).toBeDefined();
  });
});

describe("computeProfileCompletion", () => {
  it("returns 0 of 7 when profile is empty", () => {
    const c = computeProfileCompletion({ getToKnow: {} } as never);
    expect(c.complete).toBe(0);
    expect(c.total).toBe(7);
    expect(c.percent).toBe(0);
  });

  it("counts each field as it fills in", () => {
    const c = computeProfileCompletion({
      getToKnow: {
        personalBio: "x",
        hobbies: "y",
        funFacts: ["a"],
        askMeAbout: "",
        hometown: "z",
        currentlyConsuming: "",
        employeeChoice: { label: "L", value: "" },
      },
    } as never);
    expect(c.complete).toBe(4);
    expect(c.missingKeys).toEqual([
      "askMeAbout",
      "currentlyConsuming",
      "employeeChoice",
    ]);
  });

  it("returns 7 of 7 when fully populated", () => {
    const c = computeProfileCompletion({
      getToKnow: {
        personalBio: "x",
        hobbies: "y",
        funFacts: ["a"],
        askMeAbout: "z",
        hometown: "w",
        currentlyConsuming: "v",
        employeeChoice: { label: "L", value: "V" },
      },
    } as never);
    expect(c.complete).toBe(7);
    expect(c.percent).toBe(100);
    expect(c.missingKeys).toEqual([]);
  });

  it("does not count whitespace-only strings as complete", () => {
    const c = computeProfileCompletion({
      getToKnow: {
        personalBio: "   ",
        hobbies: "  ",
        funFacts: ["   "],
        askMeAbout: "",
        hometown: "",
        currentlyConsuming: "",
        employeeChoice: { label: "  ", value: " " },
      },
    } as never);
    expect(c.complete).toBe(0);
  });
});

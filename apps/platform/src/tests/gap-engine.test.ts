// @vitest-environment node
import { describe, it, expect } from "vitest";
import { computeGapSignals, getGapLevel } from "@/lib/check-in/gap-engine";

describe("computeGapSignals", () => {
  it("computes correct deltas between manager and employee scores", () => {
    const manager = { clarity: 4, recognition: 5, development: 4, safety: 5 };
    const employee = {
      heard: 4,
      clarity: 5,
      recognition: 4,
      development: 3,
      safety: 5,
    };

    const gaps = computeGapSignals(manager, employee);

    expect(gaps.clarity).toBe(-1); // manager 4 - employee 5
    expect(gaps.recognition).toBe(1); // manager 5 - employee 4
    expect(gaps.development).toBe(1); // manager 4 - employee 3
    expect(gaps.safety).toBe(0); // manager 5 - employee 5
  });

  it("returns null for dimensions with missing manager score", () => {
    const manager = {
      clarity: null,
      recognition: 5,
      development: null,
      safety: 3,
    };
    const employee = {
      heard: 4,
      clarity: 5,
      recognition: 4,
      development: 3,
      safety: 5,
    };

    const gaps = computeGapSignals(manager, employee);

    expect(gaps.clarity).toBeNull();
    expect(gaps.recognition).toBe(1);
    expect(gaps.development).toBeNull();
    expect(gaps.safety).toBe(-2);
  });

  it("returns null for dimensions with missing employee score", () => {
    const manager = { clarity: 4, recognition: 5, development: 4, safety: 5 };
    const employee = {
      heard: null,
      clarity: null,
      recognition: null,
      development: 3,
      safety: 5,
    };

    const gaps = computeGapSignals(manager, employee);

    expect(gaps.clarity).toBeNull();
    expect(gaps.recognition).toBeNull();
    expect(gaps.development).toBe(1);
    expect(gaps.safety).toBe(0);
  });

  it("returns all nulls when both have all nulls", () => {
    const manager = {
      clarity: null,
      recognition: null,
      development: null,
      safety: null,
    };
    const employee = {
      heard: null,
      clarity: null,
      recognition: null,
      development: null,
      safety: null,
    };

    const gaps = computeGapSignals(manager, employee);

    expect(gaps.clarity).toBeNull();
    expect(gaps.recognition).toBeNull();
    expect(gaps.development).toBeNull();
    expect(gaps.safety).toBeNull();
  });

  it("computes all zeros when scores are identical", () => {
    const manager = { clarity: 3, recognition: 3, development: 3, safety: 3 };
    const employee = {
      heard: 3,
      clarity: 3,
      recognition: 3,
      development: 3,
      safety: 3,
    };

    const gaps = computeGapSignals(manager, employee);

    expect(gaps.clarity).toBe(0);
    expect(gaps.recognition).toBe(0);
    expect(gaps.development).toBe(0);
    expect(gaps.safety).toBe(0);
  });

  it("handles large negative deltas (employee scores much higher)", () => {
    const manager = { clarity: 1, recognition: 1, development: 1, safety: 1 };
    const employee = {
      heard: 5,
      clarity: 5,
      recognition: 5,
      development: 5,
      safety: 5,
    };

    const gaps = computeGapSignals(manager, employee);

    expect(gaps.clarity).toBe(-4);
    expect(gaps.recognition).toBe(-4);
    expect(gaps.development).toBe(-4);
    expect(gaps.safety).toBe(-4);
  });
});

describe("getGapLevel", () => {
  it('returns "aligned" for delta of 0', () => {
    expect(getGapLevel(0)).toBe("aligned");
  });

  it('returns "watch" for delta of 1', () => {
    expect(getGapLevel(1)).toBe("watch");
  });

  it('returns "watch" for delta of -1', () => {
    expect(getGapLevel(-1)).toBe("watch");
  });

  it('returns "gap" for delta of 2', () => {
    expect(getGapLevel(2)).toBe("gap");
  });

  it('returns "gap" for delta of -2', () => {
    expect(getGapLevel(-2)).toBe("gap");
  });

  it('returns "gap" for delta of 3', () => {
    expect(getGapLevel(3)).toBe("gap");
  });

  it('returns "gap" for delta of -4', () => {
    expect(getGapLevel(-4)).toBe("gap");
  });

  it("returns null for null delta", () => {
    expect(getGapLevel(null)).toBeNull();
  });
});

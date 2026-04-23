import { describe, it, expect } from "vitest";
import { computeOverallRating } from "@/lib/perf-reviews/overall-rating";

function sections(ratings: Array<number | null>) {
  return ratings.map((rating) => ({ rating }));
}

describe("computeOverallRating", () => {
  it("returns nulls when no ratings are present", () => {
    const out = computeOverallRating(sections([null, null, null]));
    expect(out.average).toBeNull();
    expect(out.level).toBeNull();
    expect(out.label).toBeNull();
    expect(out.ratedCount).toBe(0);
    expect(out.complete).toBe(false);
  });

  it("averages 10 identical ratings of 3 to level 3", () => {
    const out = computeOverallRating(sections(Array(10).fill(3)));
    expect(out.average).toBe(3);
    expect(out.level).toBe(3);
    expect(out.label).toBe("Meets Expectations");
    expect(out.ratedCount).toBe(10);
    expect(out.totalCount).toBe(10);
    expect(out.complete).toBe(true);
  });

  it("averages mixed ratings correctly", () => {
    const out = computeOverallRating(sections([5, 4, 4, 3, 5, 4, 3, 4, 5, 3]));
    // sum 40 / 10 = 4.0
    expect(out.average).toBe(4);
    expect(out.level).toBe(4);
    expect(out.label).toBe("Exceeds Expectations");
    expect(out.complete).toBe(true);
  });

  it("rounds half-up: 2.5 → 3", () => {
    const out = computeOverallRating(sections([2, 3]));
    expect(out.average).toBe(2.5);
    expect(out.level).toBe(3);
  });

  it("rounds half-up: 3.5 → 4", () => {
    const out = computeOverallRating(sections([3, 4]));
    expect(out.average).toBe(3.5);
    expect(out.level).toBe(4);
  });

  it("rounds down below the half mark: 2.4 → 2", () => {
    const out = computeOverallRating(sections([2, 2, 3]));
    expect(out.average).toBeCloseTo(7 / 3, 5);
    expect(out.level).toBe(2);
  });

  it("partial coverage flags complete=false and uses expectedCount", () => {
    const out = computeOverallRating(sections([4, 4, null, null, null]), 10);
    expect(out.average).toBe(4);
    expect(out.ratedCount).toBe(2);
    expect(out.totalCount).toBe(10);
    expect(out.complete).toBe(false);
  });

  it("clamps level to 5 when average rounds above 5", () => {
    const out = computeOverallRating(sections([5, 5, 5]));
    expect(out.average).toBe(5);
    expect(out.level).toBe(5);
  });

  it("clamps level to 1 when average rounds below 1", () => {
    // Not a realistic case (RATING_SCALE starts at 1) but guards against bad data
    const out = computeOverallRating(sections([1, 1, 1]));
    expect(out.level).toBe(1);
    expect(out.label).toBe("Improvement Needed");
  });

  it("complete is true only when totalCount equals ratedCount and totalCount > 0", () => {
    const allRated = computeOverallRating(sections([3, 4, 5]), 3);
    expect(allRated.complete).toBe(true);

    const oneMissing = computeOverallRating(sections([3, 4, null]), 3);
    expect(oneMissing.complete).toBe(false);

    const empty = computeOverallRating([], 0);
    expect(empty.complete).toBe(false); // no sections at all -> not complete
  });
});

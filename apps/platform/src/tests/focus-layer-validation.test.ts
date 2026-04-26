// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  focusLayerDraftSchema,
  focusLayerSubmitSchema,
  focusLayerConfirmSchema,
} from "@/lib/validations/focus-layer";

const fullResponses = {
  uniqueContribution: "I bring deep cross-team alignment experience to engineering.",
  highImpactArea: "I create the most impact when translating product strategy to backlog.",
  signatureResponsibility: "I own the architectural narrative across squads.",
  workingStyle: "I work best in focused 90-minute blocks and async pair sessions.",
};

describe("focus-layer validation", () => {
  it("draft schema accepts partial input", () => {
    expect(
      focusLayerDraftSchema.parse({ responses: { uniqueContribution: "x" } })
    ).toBeDefined();
  });

  it("draft schema rejects field longer than 2000", () => {
    const long = "x".repeat(2001);
    expect(() =>
      focusLayerDraftSchema.parse({ responses: { uniqueContribution: long } })
    ).toThrow();
  });

  it("submit schema accepts complete input", () => {
    expect(focusLayerSubmitSchema.parse({ responses: fullResponses })).toBeDefined();
  });

  it("submit schema rejects fields < 20 chars", () => {
    expect(() =>
      focusLayerSubmitSchema.parse({
        responses: { ...fullResponses, uniqueContribution: "too short" },
      })
    ).toThrow();
  });

  it("confirm schema accepts optional comment", () => {
    expect(focusLayerConfirmSchema.parse({})).toEqual({});
    expect(focusLayerConfirmSchema.parse({ comment: "looks good" })).toEqual({
      comment: "looks good",
    });
  });
});

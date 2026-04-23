import { describe, it, expect } from "vitest";
import {
  computeConversationCadence,
  CONVERSATION_GRACE_PERIOD_DAYS,
  MEDIUM_THRESHOLD_DAYS,
  HIGH_THRESHOLD_DAYS,
} from "@/lib/perf-reviews/conversation-cadence";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-04-22T12:00:00Z");

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * DAY);
}

describe("computeConversationCadence", () => {
  it("not flagged when a check-in was completed within 90 days", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(365),
      employeeStatus: "active",
      lastCheckInAt: daysAgo(30),
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("none");
    expect(result.daysSince).toBe(30);
  });

  it("not flagged when a performance note exists within 90 days", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(400),
      employeeStatus: "active",
      lastCheckInAt: null,
      lastNoteAt: daysAgo(45),
      lastReviewAt: null,
    });
    expect(result.severity).toBe("none");
  });

  it("not flagged when a finalized review landed within 90 days", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(800),
      employeeStatus: "active",
      lastCheckInAt: null,
      lastNoteAt: null,
      lastReviewAt: daysAgo(80),
    });
    expect(result.severity).toBe("none");
  });

  it("flags medium when nothing in 91 days", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(500),
      employeeStatus: "active",
      lastCheckInAt: daysAgo(91),
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("medium");
    expect(result.daysSince).toBe(91);
  });

  it("flags high when nothing in 120+ days", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(500),
      employeeStatus: "active",
      lastCheckInAt: daysAgo(125),
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("high");
    expect(result.daysSince).toBe(125);
  });

  it("new hire within grace period with no conversations is not flagged", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(30),
      employeeStatus: "active",
      lastCheckInAt: null,
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("none");
  });

  it("employee hired 100 days ago with no conversations is flagged (grace expired)", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(100),
      employeeStatus: "active",
      lastCheckInAt: null,
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("medium");
    expect(result.daysSince).toBe(100);
  });

  it("terminated employee is never flagged", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(500),
      employeeStatus: "terminated",
      lastCheckInAt: daysAgo(500),
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("none");
  });

  it("on_leave employee is never flagged", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(500),
      employeeStatus: "on_leave",
      lastCheckInAt: daysAgo(500),
      lastNoteAt: null,
      lastReviewAt: null,
    });
    expect(result.severity).toBe("none");
  });

  it("picks most recent among check-in, note, review (tie-break test)", () => {
    const result = computeConversationCadence({
      now: NOW,
      hireDate: daysAgo(800),
      employeeStatus: "active",
      lastCheckInAt: daysAgo(95),
      lastNoteAt: daysAgo(30),
      lastReviewAt: daysAgo(200),
    });
    expect(result.severity).toBe("none");
    expect(result.daysSince).toBe(30);
  });

  it("thresholds are exported constants", () => {
    expect(MEDIUM_THRESHOLD_DAYS).toBe(90);
    expect(HIGH_THRESHOLD_DAYS).toBe(120);
    expect(CONVERSATION_GRACE_PERIOD_DAYS).toBe(90);
  });
});

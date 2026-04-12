import { describe, it, expect } from "vitest";
import {
  canTransition,
  getNextStatus,
  getStaleTransitions,
} from "@/lib/check-in/transitions";

describe("canTransition", () => {
  describe("valid transitions", () => {
    it("allows preparing -> ready", () => {
      expect(canTransition("preparing", "ready")).toBe(true);
    });

    it("allows preparing -> cancelled", () => {
      expect(canTransition("preparing", "cancelled")).toBe(true);
    });

    it("allows ready -> in_progress", () => {
      expect(canTransition("ready", "in_progress")).toBe(true);
    });

    it("allows ready -> missed", () => {
      expect(canTransition("ready", "missed")).toBe(true);
    });

    it("allows in_progress -> reflecting", () => {
      expect(canTransition("in_progress", "reflecting")).toBe(true);
    });

    it("allows in_progress -> missed", () => {
      expect(canTransition("in_progress", "missed")).toBe(true);
    });

    it("allows reflecting -> completed", () => {
      expect(canTransition("reflecting", "completed")).toBe(true);
    });
  });

  describe("invalid transitions", () => {
    it("blocks preparing -> in_progress (must go through ready)", () => {
      expect(canTransition("preparing", "in_progress")).toBe(false);
    });

    it("blocks preparing -> completed", () => {
      expect(canTransition("preparing", "completed")).toBe(false);
    });

    it("blocks ready -> completed (must go through in_progress)", () => {
      expect(canTransition("ready", "completed")).toBe(false);
    });

    it("blocks ready -> reflecting", () => {
      expect(canTransition("ready", "reflecting")).toBe(false);
    });

    it("blocks completed -> anything", () => {
      expect(canTransition("completed", "preparing")).toBe(false);
      expect(canTransition("completed", "ready")).toBe(false);
      expect(canTransition("completed", "in_progress")).toBe(false);
      expect(canTransition("completed", "reflecting")).toBe(false);
      expect(canTransition("completed", "missed")).toBe(false);
      expect(canTransition("completed", "cancelled")).toBe(false);
    });

    it("blocks missed -> anything", () => {
      expect(canTransition("missed", "preparing")).toBe(false);
      expect(canTransition("missed", "ready")).toBe(false);
      expect(canTransition("missed", "in_progress")).toBe(false);
    });

    it("blocks cancelled -> anything", () => {
      expect(canTransition("cancelled", "preparing")).toBe(false);
      expect(canTransition("cancelled", "ready")).toBe(false);
      expect(canTransition("cancelled", "in_progress")).toBe(false);
    });

    it("blocks in_progress -> preparing (no backward transitions)", () => {
      expect(canTransition("in_progress", "preparing")).toBe(false);
    });

    it("blocks reflecting -> in_progress (no backward transitions)", () => {
      expect(canTransition("reflecting", "in_progress")).toBe(false);
    });
  });
});

describe("getNextStatus", () => {
  const baseCheckIn = {
    status: "preparing" as const,
    scheduledAt: new Date("2026-04-20T10:00:00Z"),
    employeePrepare: { completedAt: null },
    managerPrepare: { completedAt: null },
    participate: { completedAt: null },
  };

  it('returns "ready" when both prepare phases complete', () => {
    const checkIn = {
      ...baseCheckIn,
      status: "preparing" as const,
      employeePrepare: { completedAt: new Date("2026-04-19T10:00:00Z") },
      managerPrepare: { completedAt: new Date("2026-04-19T11:00:00Z") },
    };

    expect(getNextStatus(checkIn)).toBe("ready");
  });

  it('returns "ready" when scheduledAt is reached even without prepare', () => {
    const pastSchedule = {
      ...baseCheckIn,
      status: "preparing" as const,
      scheduledAt: new Date("2026-04-10T10:00:00Z"), // in the past
    };

    expect(getNextStatus(pastSchedule)).toBe("ready");
  });

  it("returns null when preparing and neither condition met", () => {
    const futureSchedule = {
      ...baseCheckIn,
      status: "preparing" as const,
      scheduledAt: new Date("2099-04-20T10:00:00Z"), // far future
    };

    expect(getNextStatus(futureSchedule)).toBeNull();
  });

  it("returns null when only employee prepare is done (schedule not reached)", () => {
    const partialPrepare = {
      ...baseCheckIn,
      status: "preparing" as const,
      scheduledAt: new Date("2099-04-20T10:00:00Z"),
      employeePrepare: { completedAt: new Date("2026-04-19T10:00:00Z") },
    };

    expect(getNextStatus(partialPrepare)).toBeNull();
  });

  it("returns null when only manager prepare is done (schedule not reached)", () => {
    const partialPrepare = {
      ...baseCheckIn,
      status: "preparing" as const,
      scheduledAt: new Date("2099-04-20T10:00:00Z"),
      managerPrepare: { completedAt: new Date("2026-04-19T10:00:00Z") },
    };

    expect(getNextStatus(partialPrepare)).toBeNull();
  });

  it('returns "reflecting" when participate is completed', () => {
    const inProgress = {
      ...baseCheckIn,
      status: "in_progress" as const,
      participate: { completedAt: new Date("2026-04-20T10:30:00Z") },
    };

    expect(getNextStatus(inProgress)).toBe("reflecting");
  });

  it("returns null when in_progress but participate not completed", () => {
    const inProgress = {
      ...baseCheckIn,
      status: "in_progress" as const,
    };

    expect(getNextStatus(inProgress)).toBeNull();
  });

  it("returns null for ready status (no auto-transition)", () => {
    const ready = {
      ...baseCheckIn,
      status: "ready" as const,
    };

    expect(getNextStatus(ready)).toBeNull();
  });

  it("returns null for completed status", () => {
    const completed = {
      ...baseCheckIn,
      status: "completed" as const,
    };

    expect(getNextStatus(completed)).toBeNull();
  });

  it("returns null for reflecting status (handled by getStaleTransitions)", () => {
    const reflecting = {
      ...baseCheckIn,
      status: "reflecting" as const,
    };

    expect(getNextStatus(reflecting)).toBeNull();
  });
});

describe("getStaleTransitions", () => {
  const baseCheckIn = {
    status: "ready" as const,
    scheduledAt: new Date("2026-04-20T10:00:00Z"),
    employeePrepare: { completedAt: null },
    managerPrepare: { completedAt: null },
    participate: { completedAt: null },
    employeeReflect: { completedAt: null },
    managerReflect: { completedAt: null },
  };

  it('returns "missed" when ready and 24h past scheduledAt', () => {
    const staleReady = {
      ...baseCheckIn,
      status: "ready" as const,
      scheduledAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
    };

    expect(getStaleTransitions(staleReady)).toBe("missed");
  });

  it("returns null when ready but within 24h of scheduledAt", () => {
    const recentReady = {
      ...baseCheckIn,
      status: "ready" as const,
      scheduledAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    };

    expect(getStaleTransitions(recentReady)).toBeNull();
  });

  it('returns "missed" when in_progress and 48h past scheduledAt', () => {
    const staleInProgress = {
      ...baseCheckIn,
      status: "in_progress" as const,
      scheduledAt: new Date(Date.now() - 49 * 60 * 60 * 1000), // 49 hours ago
    };

    expect(getStaleTransitions(staleInProgress)).toBe("missed");
  });

  it("returns null when in_progress but within 48h of scheduledAt", () => {
    const recentInProgress = {
      ...baseCheckIn,
      status: "in_progress" as const,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    };

    expect(getStaleTransitions(recentInProgress)).toBeNull();
  });

  it('returns "completed" when reflecting and both reflections done', () => {
    const bothReflected = {
      ...baseCheckIn,
      status: "reflecting" as const,
      participate: { completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      employeeReflect: {
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      managerReflect: {
        completedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    };

    expect(getStaleTransitions(bothReflected)).toBe("completed");
  });

  it('returns "completed" when reflecting and 24h past participate completion (auto-close)', () => {
    const staleReflecting = {
      ...baseCheckIn,
      status: "reflecting" as const,
      participate: {
        completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      }, // 25 hours ago
      // neither reflected yet - but deadline passed
    };

    expect(getStaleTransitions(staleReflecting)).toBe("completed");
  });

  it("returns null when reflecting but within 24h and not both reflected", () => {
    const recentReflecting = {
      ...baseCheckIn,
      status: "reflecting" as const,
      participate: {
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      }, // 12 hours ago
      employeeReflect: {
        completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      // manager hasn't reflected yet
    };

    expect(getStaleTransitions(recentReflecting)).toBeNull();
  });

  it("returns null when reflecting but participate not yet completed", () => {
    const noParticipate = {
      ...baseCheckIn,
      status: "reflecting" as const,
      participate: { completedAt: null },
    };

    expect(getStaleTransitions(noParticipate)).toBeNull();
  });

  it("returns null for preparing status", () => {
    const preparing = {
      ...baseCheckIn,
      status: "preparing" as const,
    };

    expect(getStaleTransitions(preparing)).toBeNull();
  });

  it("returns null for completed status", () => {
    const completed = {
      ...baseCheckIn,
      status: "completed" as const,
    };

    expect(getStaleTransitions(completed)).toBeNull();
  });

  it("returns null for cancelled status", () => {
    const cancelled = {
      ...baseCheckIn,
      status: "cancelled" as const,
    };

    expect(getStaleTransitions(cancelled)).toBeNull();
  });
});

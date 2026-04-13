import { describe, it, expect } from "vitest";
import { filterCheckInForRole } from "@/lib/check-in/privacy";

const fullCheckIn = {
  _id: "checkin-1",
  employee: "emp-1",
  manager: "mgr-1",
  goals: ["goal-1", "goal-2"],
  scheduledAt: new Date("2026-04-15T10:00:00Z"),
  status: "preparing" as const,
  cadenceSource: "manual" as const,
  completedAt: null,
  previousCheckInId: null,
  createdAt: new Date("2026-04-10T10:00:00Z"),
  updatedAt: new Date("2026-04-10T10:00:00Z"),
  employeePrepare: {
    progressReflection: "Made good progress on Q2 goals",
    stuckPointReflection: "Blocked on API integration",
    conversationIntent: "Discuss career growth",
    completedAt: new Date("2026-04-14T10:00:00Z"),
    distilledPreview: "Employee is progressing well but blocked on API work",
  },
  managerPrepare: {
    contextBriefingViewed: true,
    gapRecoveryViewed: false,
    openingMove: "Start with recognition",
    recognitionNote: "Great job on the release",
    developmentalFocus: "API design skills",
    completedAt: new Date("2026-04-14T11:00:00Z"),
  },
  participate: {
    employeeOpening: "Feeling good about the quarter",
    employeeKeyTakeaways: "Need to focus on API skills",
    stuckPointDiscussion: "Will pair with senior dev",
    recognition: "Manager recognized release work",
    development: "Agreed on API training",
    performance: "On track for Q2",
    employeeCommitment: "Complete API module by end of month",
    managerCommitment: "Set up pairing sessions",
    employeeApprovedManagerCommitment: true,
    managerApprovedEmployeeCommitment: true,
    completedAt: new Date("2026-04-15T10:30:00Z"),
  },
  employeeReflect: {
    heard: 4,
    clarity: 5,
    recognition: 4,
    development: 3,
    safety: 5,
    completedAt: new Date("2026-04-15T11:00:00Z"),
  },
  managerReflect: {
    clarity: 4,
    recognition: 5,
    development: 4,
    safety: 5,
    forwardAction: "Schedule API training session",
    completedAt: new Date("2026-04-15T11:15:00Z"),
  },
  gapSignals: {
    clarity: -1,
    recognition: 1,
    development: 1,
    safety: 0,
    generatedAt: new Date("2026-04-15T11:20:00Z"),
  },
};

describe("filterCheckInForRole", () => {
  describe("employee role", () => {
    it("includes own prepare fields but not distilledPreview", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");

      expect(result.employeePrepare).toBeDefined();
      expect(result.employeePrepare!.progressReflection).toBe(
        "Made good progress on Q2 goals",
      );
      expect(result.employeePrepare!.stuckPointReflection).toBe(
        "Blocked on API integration",
      );
      expect(result.employeePrepare!.conversationIntent).toBe(
        "Discuss career growth",
      );
      expect(result.employeePrepare!.completedAt).toEqual(
        new Date("2026-04-14T10:00:00Z"),
      );
      expect(result.employeePrepare).not.toHaveProperty("distilledPreview");
    });

    it("includes participate fields visible to employee", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");

      expect(result.participate).toBeDefined();
      expect(result.participate!.employeeOpening).toBe(
        "Feeling good about the quarter",
      );
      expect(result.participate!.employeeKeyTakeaways).toBe(
        "Need to focus on API skills",
      );
      expect(result.participate!.employeeCommitment).toBe(
        "Complete API module by end of month",
      );
      expect(result.participate!.managerCommitment).toBe(
        "Set up pairing sessions",
      );
      expect(result.participate!.employeeApprovedManagerCommitment).toBe(true);
      expect(result.participate!.managerApprovedEmployeeCommitment).toBe(true);
      expect(result.participate!.completedAt).toEqual(
        new Date("2026-04-15T10:30:00Z"),
      );
    });

    it("includes own reflect scores when completed", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");

      expect(result.employeeReflect).toBeDefined();
      expect(result.employeeReflect!.heard).toBe(4);
      expect(result.employeeReflect!.clarity).toBe(5);
      expect(result.employeeReflect!.recognition).toBe(4);
      expect(result.employeeReflect!.development).toBe(3);
      expect(result.employeeReflect!.safety).toBe(5);
    });

    it("excludes employeeReflect when not completed", () => {
      const incompleteCheckIn = {
        ...fullCheckIn,
        employeeReflect: {
          heard: null,
          clarity: null,
          recognition: null,
          development: null,
          safety: null,
          completedAt: null,
        },
      };
      const result = filterCheckInForRole(
        incompleteCheckIn,
        "employee",
        "emp-1",
      );
      expect(result.employeeReflect).toBeUndefined();
    });

    it("never includes managerPrepare", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");
      expect(result).not.toHaveProperty("managerPrepare");
    });

    it("never includes managerReflect", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");
      expect(result).not.toHaveProperty("managerReflect");
    });

    it("never includes gapSignals", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");
      expect(result).not.toHaveProperty("gapSignals");
    });

    it("includes base fields", () => {
      const result = filterCheckInForRole(fullCheckIn, "employee", "emp-1");
      expect(result._id).toBe("checkin-1");
      expect(result.employee).toBe("emp-1");
      expect(result.manager).toBe("mgr-1");
      expect(result.goals).toEqual(["goal-1", "goal-2"]);
      expect(result.scheduledAt).toEqual(
        new Date("2026-04-15T10:00:00Z"),
      );
      expect(result.status).toBe("preparing");
      expect(result.cadenceSource).toBe("manual");
    });
  });

  describe("manager role", () => {
    it("includes distilledPreview but not raw employee reflections", () => {
      const result = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");

      expect(result.employeePrepare).toBeDefined();
      expect(result.employeePrepare!.distilledPreview).toBe(
        "Employee is progressing well but blocked on API work",
      );
      expect(result.employeePrepare!.completedAt).toEqual(
        new Date("2026-04-14T10:00:00Z"),
      );
      expect(result.employeePrepare).not.toHaveProperty("progressReflection");
      expect(result.employeePrepare).not.toHaveProperty(
        "stuckPointReflection",
      );
      expect(result.employeePrepare).not.toHaveProperty("conversationIntent");
    });

    it("includes own managerPrepare", () => {
      const result = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");

      expect(result.managerPrepare).toBeDefined();
      expect(result.managerPrepare!.openingMove).toBe(
        "Start with recognition",
      );
      expect(result.managerPrepare!.recognitionNote).toBe(
        "Great job on the release",
      );
      expect(result.managerPrepare!.developmentalFocus).toBe(
        "API design skills",
      );
    });

    it("includes full participate data", () => {
      const result = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");

      expect(result.participate).toBeDefined();
      expect(result.participate!.employeeOpening).toBe(
        "Feeling good about the quarter",
      );
      expect(result.participate!.managerCommitment).toBe(
        "Set up pairing sessions",
      );
    });

    it("includes own managerReflect when completed", () => {
      const result = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");

      expect(result.managerReflect).toBeDefined();
      expect(result.managerReflect!.clarity).toBe(4);
      expect(result.managerReflect!.recognition).toBe(5);
      expect(result.managerReflect!.forwardAction).toBe(
        "Schedule API training session",
      );
    });

    it("excludes managerReflect when not completed", () => {
      const incompleteCheckIn = {
        ...fullCheckIn,
        managerReflect: {
          clarity: null,
          recognition: null,
          development: null,
          safety: null,
          forwardAction: null,
          completedAt: null,
        },
      };
      const result = filterCheckInForRole(
        incompleteCheckIn,
        "manager",
        "mgr-1",
      );
      expect(result.managerReflect).toBeUndefined();
    });

    it("includes gapSignals when generated", () => {
      const result = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");

      expect(result.gapSignals).toBeDefined();
      expect(result.gapSignals!.clarity).toBe(-1);
      expect(result.gapSignals!.recognition).toBe(1);
    });

    it("excludes gapSignals when not generated", () => {
      const noGapsCheckIn = {
        ...fullCheckIn,
        gapSignals: {
          clarity: null,
          recognition: null,
          development: null,
          safety: null,
          generatedAt: null,
        },
      };
      const result = filterCheckInForRole(noGapsCheckIn, "manager", "mgr-1");
      expect(result.gapSignals).toBeUndefined();
    });

    it("never includes employeeReflect", () => {
      const result = filterCheckInForRole(fullCheckIn, "manager", "mgr-1");
      expect(result).not.toHaveProperty("employeeReflect");
    });
  });

  describe("hr role", () => {
    it("includes gapSignals when generated", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");

      expect(result.gapSignals).toBeDefined();
      expect(result.gapSignals!.clarity).toBe(-1);
      expect(result.gapSignals!.recognition).toBe(1);
      expect(result.gapSignals!.development).toBe(1);
      expect(result.gapSignals!.safety).toBe(0);
    });

    it("excludes gapSignals when not generated", () => {
      const noGapsCheckIn = {
        ...fullCheckIn,
        gapSignals: {
          clarity: null,
          recognition: null,
          development: null,
          safety: null,
          generatedAt: null,
        },
      };
      const result = filterCheckInForRole(noGapsCheckIn, "hr", "hr-1");
      expect(result.gapSignals).toBeUndefined();
    });

    it("includes base fields only", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");

      expect(result._id).toBe("checkin-1");
      expect(result.employee).toBe("emp-1");
      expect(result.manager).toBe("mgr-1");
      expect(result.status).toBe("preparing");
    });

    it("never includes employeePrepare", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");
      expect(result).not.toHaveProperty("employeePrepare");
    });

    it("never includes managerPrepare", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");
      expect(result).not.toHaveProperty("managerPrepare");
    });

    it("never includes participate", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");
      expect(result).not.toHaveProperty("participate");
    });

    it("never includes employeeReflect", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");
      expect(result).not.toHaveProperty("employeeReflect");
    });

    it("never includes managerReflect", () => {
      const result = filterCheckInForRole(fullCheckIn, "hr", "hr-1");
      expect(result).not.toHaveProperty("managerReflect");
    });
  });

  describe("unknown role", () => {
    it("returns only base fields", () => {
      const result = filterCheckInForRole(
        fullCheckIn,
        "unknown" as any,
        "user-1",
      );
      expect(result._id).toBe("checkin-1");
      expect(result.employee).toBe("emp-1");
      expect(result).not.toHaveProperty("employeePrepare");
      expect(result).not.toHaveProperty("managerPrepare");
      expect(result).not.toHaveProperty("participate");
      expect(result).not.toHaveProperty("employeeReflect");
      expect(result).not.toHaveProperty("managerReflect");
      expect(result).not.toHaveProperty("gapSignals");
    });
  });
});

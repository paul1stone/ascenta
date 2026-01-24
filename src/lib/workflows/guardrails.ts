/**
 * Guardrails Engine
 * Rule-based evaluation engine for workflow guardrails
 * IMPORTANT: Guardrails are evaluated as CODE, not AI prompts
 */

import type {
  GuardrailDefinition,
  GuardrailCondition,
  GuardrailOperator,
  GuardrailResult,
  GuardrailEvaluationResult,
  WorkflowInputs,
} from "./types";

// ============================================================================
// CONDITION EVALUATION
// ============================================================================

/**
 * Get a nested value from an object using dot notation
 * e.g., "employee.department" -> obj.employee.department
 */
function getNestedValue(obj: WorkflowInputs, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Evaluate a single operator condition
 */
function evaluateOperator(
  fieldValue: unknown,
  operator: GuardrailOperator,
  conditionValue?: unknown
): boolean {
  switch (operator) {
    case "equals":
      return fieldValue === conditionValue;

    case "not_equals":
      return fieldValue !== conditionValue;

    case "contains":
      if (typeof fieldValue === "string" && typeof conditionValue === "string") {
        return fieldValue.toLowerCase().includes(conditionValue.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;

    case "not_contains":
      if (typeof fieldValue === "string" && typeof conditionValue === "string") {
        return !fieldValue.toLowerCase().includes(conditionValue.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(conditionValue);
      }
      return true;

    case "in":
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(fieldValue);
      }
      return false;

    case "not_in":
      if (Array.isArray(conditionValue)) {
        return !conditionValue.includes(fieldValue);
      }
      return true;

    case "greater_than":
      return (
        typeof fieldValue === "number" &&
        typeof conditionValue === "number" &&
        fieldValue > conditionValue
      );

    case "less_than":
      return (
        typeof fieldValue === "number" &&
        typeof conditionValue === "number" &&
        fieldValue < conditionValue
      );

    case "greater_or_equal":
      return (
        typeof fieldValue === "number" &&
        typeof conditionValue === "number" &&
        fieldValue >= conditionValue
      );

    case "less_or_equal":
      return (
        typeof fieldValue === "number" &&
        typeof conditionValue === "number" &&
        fieldValue <= conditionValue
      );

    case "is_empty":
      if (fieldValue === null || fieldValue === undefined) return true;
      if (typeof fieldValue === "string") return fieldValue.trim() === "";
      if (Array.isArray(fieldValue)) return fieldValue.length === 0;
      if (typeof fieldValue === "object") return Object.keys(fieldValue).length === 0;
      return false;

    case "is_not_empty":
      if (fieldValue === null || fieldValue === undefined) return false;
      if (typeof fieldValue === "string") return fieldValue.trim() !== "";
      if (Array.isArray(fieldValue)) return fieldValue.length > 0;
      if (typeof fieldValue === "object") return Object.keys(fieldValue).length > 0;
      return true;

    case "is_true":
      return fieldValue === true || fieldValue === "true" || fieldValue === 1;

    case "is_false":
      return fieldValue === false || fieldValue === "false" || fieldValue === 0;

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Recursively evaluate a guardrail condition
 */
function evaluateCondition(
  condition: GuardrailCondition,
  inputs: WorkflowInputs
): boolean {
  // Evaluate the base condition
  const fieldValue = getNestedValue(inputs, condition.field);
  const baseResult = evaluateOperator(fieldValue, condition.operator, condition.value);

  // Handle AND conditions
  if (condition.and && condition.and.length > 0) {
    const andResult = condition.and.every((c) => evaluateCondition(c, inputs));
    if (!andResult) return false;
  }

  // Handle OR conditions
  if (condition.or && condition.or.length > 0) {
    const orResult = condition.or.some((c) => evaluateCondition(c, inputs));
    // If we have OR conditions, the base must be true AND at least one OR must be true
    // OR: base result OR any of the or conditions
    return baseResult || orResult;
  }

  return baseResult;
}

// ============================================================================
// GUARDRAIL EVALUATION
// ============================================================================

/**
 * Evaluate a single guardrail against the provided inputs
 */
export function evaluateGuardrail(
  guardrail: GuardrailDefinition,
  inputs: WorkflowInputs,
  providedRationales?: Record<string, string>
): GuardrailResult {
  // Skip inactive guardrails
  if (!guardrail.isActive) {
    return {
      guardrailId: guardrail.id,
      name: guardrail.name,
      passed: true,
      severity: guardrail.severity,
      message: guardrail.message,
    };
  }

  // Evaluate the trigger condition
  // If condition is TRUE, the guardrail is TRIGGERED (meaning there's a problem)
  const triggered = evaluateCondition(guardrail.triggerCondition, inputs);

  // Check if rationale was provided for this guardrail
  const rationaleProvided = providedRationales?.[guardrail.id];

  // Determine if the guardrail passes
  // A guardrail passes if:
  // 1. It was not triggered, OR
  // 2. It was triggered but required action is rationale and rationale was provided
  const passed =
    !triggered ||
    (triggered &&
      guardrail.requiredAction === "rationale" &&
      !!rationaleProvided);

  return {
    guardrailId: guardrail.id,
    name: guardrail.name,
    passed,
    severity: guardrail.severity,
    message: guardrail.message,
    requiredAction: triggered ? guardrail.requiredAction : undefined,
    rationaleProvided: triggered ? rationaleProvided : undefined,
    escalateTo: triggered ? guardrail.escalateTo : undefined,
    triggeredAt: triggered ? new Date() : undefined,
  };
}

/**
 * Evaluate all guardrails for a workflow against the provided inputs
 */
export function evaluateGuardrails(
  guardrails: GuardrailDefinition[],
  inputs: WorkflowInputs,
  providedRationales?: Record<string, string>
): GuardrailEvaluationResult {
  // Sort guardrails by sortOrder
  const sortedGuardrails = [...guardrails].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  // Evaluate each guardrail
  const results: GuardrailResult[] = sortedGuardrails.map((g) =>
    evaluateGuardrail(g, inputs, providedRationales)
  );

  // Analyze results
  const failedResults = results.filter((r) => !r.passed);
  const hasHardStop = failedResults.some((r) => r.severity === "hard_stop");
  const hasWarnings = failedResults.some((r) => r.severity === "warning");
  const hasEscalations = failedResults.some((r) => r.severity === "escalation");

  // Find guardrails that need rationale
  const rationalesRequired = failedResults
    .filter(
      (r) =>
        r.requiredAction === "rationale" && !r.rationaleProvided
    )
    .map((r) => r.guardrailId);

  return {
    allPassed: failedResults.length === 0,
    hasHardStop,
    hasWarnings,
    hasEscalations,
    results,
    rationalesRequired,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if workflow can proceed to the next step based on guardrail results
 */
export function canProceed(result: GuardrailEvaluationResult): boolean {
  // Cannot proceed if there's a hard stop
  if (result.hasHardStop) {
    return false;
  }

  // Cannot proceed if there are rationales required that haven't been provided
  if (result.rationalesRequired.length > 0) {
    return false;
  }

  // Can proceed with warnings (they're just informational)
  return true;
}

/**
 * Get a summary of triggered guardrails for display
 */
export function getGuardrailSummary(
  result: GuardrailEvaluationResult
): {
  hardStops: GuardrailResult[];
  warnings: GuardrailResult[];
  escalations: GuardrailResult[];
  passed: GuardrailResult[];
} {
  const triggered = result.results.filter((r) => !r.passed);
  const passed = result.results.filter((r) => r.passed);

  return {
    hardStops: triggered.filter((r) => r.severity === "hard_stop"),
    warnings: triggered.filter((r) => r.severity === "warning"),
    escalations: triggered.filter((r) => r.severity === "escalation"),
    passed,
  };
}

/**
 * Format guardrail results for audit logging
 */
export function formatGuardrailsForAudit(
  result: GuardrailEvaluationResult
): Record<string, unknown> {
  return {
    evaluated: result.results.length,
    passed: result.results.filter((r) => r.passed).length,
    failed: result.results.filter((r) => !r.passed).length,
    hasHardStop: result.hasHardStop,
    hasWarnings: result.hasWarnings,
    hasEscalations: result.hasEscalations,
    rationalesRequired: result.rationalesRequired,
    triggeredGuardrails: result.results
      .filter((r) => !r.passed)
      .map((r) => ({
        id: r.guardrailId,
        name: r.name,
        severity: r.severity,
        message: r.message,
        rationaleProvided: !!r.rationaleProvided,
      })),
  };
}

// ============================================================================
// CONDITION BUILDERS (for programmatic guardrail creation)
// ============================================================================

/**
 * Helper to create a simple equals condition
 */
export function equals(field: string, value: unknown): GuardrailCondition {
  return { field, operator: "equals", value };
}

/**
 * Helper to create a "field is in list" condition
 */
export function isIn(field: string, values: unknown[]): GuardrailCondition {
  return { field, operator: "in", value: values };
}

/**
 * Helper to create an "is empty" condition
 */
export function isEmpty(field: string): GuardrailCondition {
  return { field, operator: "is_empty" };
}

/**
 * Helper to create an "is not empty" condition
 */
export function isNotEmpty(field: string): GuardrailCondition {
  return { field, operator: "is_not_empty" };
}

/**
 * Helper to create an "is true" condition
 */
export function isTrue(field: string): GuardrailCondition {
  return { field, operator: "is_true" };
}

/**
 * Helper to combine conditions with AND
 */
export function and(
  base: GuardrailCondition,
  ...conditions: GuardrailCondition[]
): GuardrailCondition {
  return { ...base, and: conditions };
}

/**
 * Helper to combine conditions with OR
 */
export function or(
  base: GuardrailCondition,
  ...conditions: GuardrailCondition[]
): GuardrailCondition {
  return { ...base, or: conditions };
}

type ManagerReflectScores = {
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
};

type EmployeeReflectScores = {
  heard: number | null;
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
};

type GapSignals = {
  clarity: number | null;
  recognition: number | null;
  development: number | null;
  safety: number | null;
};

export function computeGapSignals(
  manager: ManagerReflectScores,
  employee: EmployeeReflectScores,
): GapSignals {
  const delta = (m: number | null, e: number | null): number | null => {
    if (m === null || e === null) return null;
    return m - e;
  };

  return {
    clarity: delta(manager.clarity, employee.clarity),
    recognition: delta(manager.recognition, employee.recognition),
    development: delta(manager.development, employee.development),
    safety: delta(manager.safety, employee.safety),
  };
}

export type GapLevel = "aligned" | "watch" | "gap";

export function getGapLevel(delta: number | null): GapLevel | null {
  if (delta === null) return null;
  const abs = Math.abs(delta);
  if (abs === 0) return "aligned";
  if (abs === 1) return "watch";
  return "gap";
}

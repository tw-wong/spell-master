export type Status = "correct" | "wrong" | null;

export function scoreWeek(statuses: Status[]) {
  const total = statuses.length;
  const correct = statuses.filter((s) => s === "correct").length;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, pct, passed: pct >= 80 };
}

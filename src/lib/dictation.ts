export type DictationStatus = "correct" | "wrong" | null;
export type GradedWord = { target: string; typed: string; ok: boolean };
export type Grade = {
  exact: boolean; caseOnly: boolean; words: GradedWord[]; correctCount: number; total: number;
};
export type DictationDetail = {
  answer: string; exact: boolean; caseOnly: boolean; correctCount: number; total: number;
};

export function tokens(text: string): string[] {
  return text.match(/[^\s]+/g) ?? [];
}

const strip = (s: string) => s.trim().toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");

export function gradeSentence(target: string, answer: string): Grade {
  const tw = tokens(target.trim());
  const aw = tokens(answer.trim());
  const words: GradedWord[] = tw.map((w, i) => ({ target: w, typed: aw[i] ?? "", ok: (aw[i] ?? "") === w }));
  const exact = answer.trim().replace(/\s+/g, " ") === target.trim();
  const caseOnly = !exact && strip(answer) === strip(target);
  return { exact, caseOnly, words, correctCount: words.filter((w) => w.ok).length, total: tw.length };
}

export function scoreDictation(statuses: DictationStatus[]) {
  const total = statuses.length;
  const correct = statuses.filter((s) => s === "correct").length;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, pct, passed: pct >= 80 };
}

export function capMissCount(details: (DictationDetail | null)[]): number {
  return details.filter((d) => d && !d.exact && d.caseOnly).length;
}

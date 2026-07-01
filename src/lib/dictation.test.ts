import { tokens, gradeSentence, scoreDictation, capMissCount } from "./dictation";

test("tokens splits on whitespace, keeping punctuation attached", () => {
  expect(tokens("On Thursday, I go swimming.")).toEqual(["On", "Thursday,", "I", "go", "swimming."]);
});

test("exact match grades as correct", () => {
  const g = gradeSentence("On Thursday, I go swimming.", "On Thursday, I go swimming.");
  expect(g.exact).toBe(true);
  expect(g.caseOnly).toBe(false);
  expect(g.correctCount).toBe(5);
  expect(g.total).toBe(5);
});

test("only wrong capitals/punctuation -> caseOnly", () => {
  const g = gradeSentence("On Thursday, I go swimming.", "on thursday i go swimming");
  expect(g.exact).toBe(false);
  expect(g.caseOnly).toBe(true);
});

test("wrong words are counted and it is not caseOnly", () => {
  const g = gradeSentence("On Thursday, I go swimming.", "On thursday, I go swiming.");
  expect(g.exact).toBe(false);
  expect(g.caseOnly).toBe(false);
  expect(g.correctCount).toBe(3);
  expect(g.total).toBe(5);
  expect(g.words[1].ok).toBe(false);
  expect(g.words[4].ok).toBe(false);
});

test("missing trailing words -> empty typed, not ok", () => {
  const g = gradeSentence("My friend has a new bike.", "My friend has");
  expect(g.words[3].typed).toBe("");
  expect(g.words[3].ok).toBe(false);
  expect(g.correctCount).toBe(3);
  expect(g.total).toBe(6);
});

test("scoreDictation thresholds at 80%", () => {
  expect(scoreDictation(["correct", "correct", "wrong"]).passed).toBe(false);
  const r = scoreDictation(["correct", "correct", "correct", "correct", "wrong"]);
  expect(r.pct).toBe(80);
  expect(r.passed).toBe(true);
  expect(scoreDictation([])).toEqual({ correct: 0, total: 0, pct: 0, passed: false });
});

test("capMissCount counts caseOnly misses only", () => {
  const details = [
    { answer: "", exact: true, caseOnly: false, correctCount: 5, total: 5 },
    { answer: "", exact: false, caseOnly: true, correctCount: 5, total: 5 },
    { answer: "", exact: false, caseOnly: false, correctCount: 3, total: 5 },
    null,
  ];
  expect(capMissCount(details)).toBe(1);
});

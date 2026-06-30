import { scoreWeek } from "./score";

test("counts correct answers and computes percentage", () => {
  expect(scoreWeek(["correct", "correct", "wrong", null])).toEqual({
    correct: 2, total: 4, pct: 50, passed: false,
  });
});

test("passes at exactly 80%", () => {
  const r = scoreWeek(["correct", "correct", "correct", "correct", "wrong"]);
  expect(r.pct).toBe(80);
  expect(r.passed).toBe(true);
});

test("79% does not pass", () => {
  const statuses = Array(100).fill("wrong");
  for (let i = 0; i < 79; i++) statuses[i] = "correct";
  expect(scoreWeek(statuses).passed).toBe(false);
});

test("empty list is zero, not NaN", () => {
  expect(scoreWeek([])).toEqual({ correct: 0, total: 0, pct: 0, passed: false });
});

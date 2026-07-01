import { getDictation, hasDictation, dictationCount } from "./words";

test("week 12 has 3 dictation sentences with focus notes", () => {
  expect(dictationCount(12)).toBe(3);
  expect(getDictation(12)[0].text).toBe("On Thursday, I go swimming.");
  expect(getDictation(12)[0].focus).toMatch(/capital/i);
});

test("hasDictation is true for weeks 11 & 12, false for 10 & 13", () => {
  expect(hasDictation(12)).toBe(true);
  expect(hasDictation(11)).toBe(true);
  expect(hasDictation(10)).toBe(false);
  expect(hasDictation(13)).toBe(false);
});

test("getDictation falls back to week 12 for an unknown week", () => {
  expect(getDictation(99)).toEqual(getDictation(12));
});

import { getWeek, getCurrentWeek, currentWeekNumber, weeks } from "./words";

test("there are 4 bundled weeks", () => {
  expect(weeks.map((w) => w.week)).toEqual([10, 11, 12, 13]);
});

test("getWeek returns the matching week", () => {
  expect(getWeek(11).theme).toBe("Silent letters");
});

test("getWeek falls back to the current week for an unknown number", () => {
  expect(getWeek(999)).toEqual(getCurrentWeek());
});

test("current week is week 12", () => {
  expect(currentWeekNumber).toBe(12);
  expect(getCurrentWeek().theme).toBe("Everyday words");
});

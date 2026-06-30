import { buildTileBank, shuffle } from "./tiles";

test("bank contains every letter of the word", () => {
  const bank = buildTileBank("friend");
  for (const ch of "friend") {
    const i = bank.indexOf(ch);
    expect(i).toBeGreaterThanOrEqual(0);
    bank.splice(i, 1);
  }
});

test("bank length is word length + 3 fillers", () => {
  expect(buildTileBank("school")).toHaveLength("school".length + 3);
});

test("fillers are not letters already in the word", () => {
  const word = "thumb";
  const bank = buildTileBank(word);
  const extras = [...bank];
  for (const ch of word) extras.splice(extras.indexOf(ch), 1);
  for (const f of extras) expect(word.includes(f)).toBe(false);
});

test("shuffle preserves the multiset of elements", () => {
  const input = ["a", "b", "b", "c"];
  const out = shuffle(input);
  expect([...out].sort()).toEqual([...input].sort());
});

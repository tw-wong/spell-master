import { theme } from "./tokens";

test("semantic colours map to the kit's brand ramp", () => {
  expect(theme.color.brand).toBe("#7B61FF");
  expect(theme.color.brandLedge).toBe("#4E32B8");
  expect(theme.color.success).toBe("#16B978");
  expect(theme.color.tryAgain).toBe("#FF5E5E");
  expect(theme.color.bg).toBe("#FFFBF3");
});

test("shadow() returns an iOS+Android elevation object", () => {
  const s = theme.shadow("md");
  expect(s.shadowColor).toBe("#241B47");
  expect(typeof s.elevation).toBe("number");
});

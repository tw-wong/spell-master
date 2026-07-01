# WeekPicker Redesign — Implementation Design

**Date:** 2026-07-02
**Owner:** TW
**Branch:** `feature/weekpicker-redesign`
**Source of truth:** Claude Design project "Spell Master Design System"
(`6f0ec147-1d4f-4147-880e-234659be806a`) — `ui_kits/spell-master-app/WeekPicker.jsx`
(latest) + the provided screenshot.

---

## 1. Goal

Redesign the WeekPicker week cards so each row shows a compact **chips row**
summarising the week's content, with **uniform card heights**. Purely
presentational — no data, state, or navigation changes.

## 2. Changes (three files)

### 2.1 Icon — `src/components/Icon.tsx`
Add one glyph: `star: Star` (from `lucide-react-native`). The "pen" chip uses the
existing `pencil`; `ear` already exists. `IconName` stays derived from the MAP.

### 2.2 Color tokens — `src/theme/tokens.ts`
Add three semantic entries to `theme.color` (values from the design system's ramp,
already present in `palette`):
- `info: palette.sky500` (#16AEF0)
- `infoTint: palette.sky100` (#D6F1FF)
- `accentTintStrong: palette.gold100` (#FFEFC2)

No existing tokens change.

### 2.3 WeekPicker screen — `src/screens/WeekPicker.tsx`
Rewrite the card body. Unchanged: `Screen`, header (close `x` + "Spelling weeks"),
subtitle, `ScrollView`, `select(w)` = `setWeekNumber(w)` then `router.replace("/home")`,
and the selection model (`isSelected = w.week === weekNumber`,
`isCurrent = w.week === currentWeekNumber`).

Per week card:
- **Card** gets a fixed **`height: 84`** (RN box model is border-box, so the 2px
  border is included) → uniform rows. Keep `tone={isSelected ? "tint" : "paper"}`,
  `elevation={isSelected ? "none" : "sm"}`, `pad="md"`, brand vs border `borderColor`,
  `flexDirection: "row"`, `alignItems: "center"`, `gap: 14`.
- **Number tile** unchanged: 48×48, `radius.md`, bg `brand` (selected) / `brandTint`
  (else), number `#fff` / `brand`.
- **Right column** (`flex: 1`, `minWidth: 0`):
  - Theme title: `font.display.semibold` 18, `textStrong`, **`numberOfLines={1}`**
    (ellipsis), lineHeight ~20.
  - **Chips row** (`flexDirection: "row"`, `gap: 6`, `alignItems: "center"`,
    `marginTop: 7`), rendered by a small local `Chip` helper
    (`{ bg, fg, icon, label? }` → pill: row, `gap: 4`, `radius.pill`,
    `paddingVertical: 3`, `paddingHorizontal: 8`, `font.body.black` ~11.5):
    1. **Pencil chip** (always): bg `theme.color.tint`, text `theme.color.brandLedge`,
       `pencil` icon color `theme.color.brand`, label `w.words.length`.
    2. **Ear chip** (only if `hasDictation(w.week)`): bg `theme.color.infoTint`,
       text + `ear` icon `theme.color.info`, label `dictationCount(w.week)`.
    3. **Star chip** (only if `isCurrent`): bg `theme.color.accentTintStrong`,
       `star` icon `theme.color.accentLedge`, **no label** (icon-only, tighter
       horizontal padding ~6), `accessibilityLabel="This week"`.
- **Remove** the `Badge` "This week" and the selected-`check` `Icon` (and the now
  unused `Badge` import). Selection is shown by border/tint + solid number tile only.

Imports needed in the screen: add `hasDictation`, `dictationCount` from `@/data/words`
(alongside `weeks`, `currentWeekNumber`).

## 3. Testing

Presentational change, no new logic → no unit tests. Verify by running the web
target and opening `/weeks`:
- Four cards, all the same height.
- Week 10: pencil 5 only. Week 11: pencil 5 + blue ear 2, shown selected
  (purple border/tint + solid number tile, no check icon). Week 12: pencil 6 +
  ear 3 + gold star. Week 13: pencil 4 only.
- Tapping a card selects that week and returns to Home (existing behaviour).
- `tsc --noEmit` clean; existing `jest` suite unaffected (25/25).

## 4. Out of scope

- Refactoring the dictation screens' hardcoded hex colors (`#FFEFC2` / `#C2F1DD`)
  to tokens — deliberately deferred (per decision).
- No changes to data, `SessionContext`, routes, or any other screen.

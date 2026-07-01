# WeekPicker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give WeekPicker week cards a uniform-height layout with a chips row (pencil + word count, ear + dictation count, star for the current week).

**Architecture:** One screen rewrite (`src/screens/WeekPicker.tsx`) plus two small shared additions it depends on — a `star` icon and three color tokens. Presentational only; no data/state/route changes.

**Tech Stack:** React Native + Expo SDK 54, TypeScript, expo-router, lucide-react-native. Styling via `@/theme/tokens` + StyleSheet.

## Global Constraints

- **Node:** prefix every command with `source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && `.
- **Git identity** is already `tw-wong` in repo config — plain `git commit` (no `-c user.*`/`--author`). Branch `feature/weekpicker-redesign`.
- Styling via `@/theme/tokens` + StyleSheet; `@/` path alias. British spelling; no emoji.
- Chip values come from existing data helpers: `w.words.length`, `hasDictation(w.week)`, `dictationCount(w.week)`, `currentWeekNumber` — no data changes.
- Fixed card height **84** (RN box model is border-box, so it includes the 2px border + `pad="md"` 16px padding).
- Source of truth: `ui_kits/spell-master-app/WeekPicker.jsx` (latest) + the provided screenshot.

---

## Task 1: Add `star` icon + `info`/`infoTint`/`accentTintStrong` color tokens

**Files:**
- Modify: `src/components/Icon.tsx`
- Modify: `src/theme/tokens.ts`

**Interfaces:**
- Produces: `IconName` gains `"star"`; `theme.color` gains `info` (#16AEF0), `infoTint` (#D6F1FF), `accentTintStrong` (#FFEFC2).

- [ ] **Step 1: Confirm the lucide `Star` glyph exists**

```bash
grep -rho "\bStar\b" /Users/tengwai.wong/Repo/repo_tw/spell-master/node_modules/lucide-react-native/dist/lucide-react-native.d.ts | head -1
```
Expected: prints `Star`.

- [ ] **Step 2: Add `Star` to `src/components/Icon.tsx`**

Change the import line to append `Star`:
```tsx
import {
  Volume2, RotateCcw, Play, ChevronLeft, ChevronRight, ChevronDown,
  Pencil, Lightbulb, PartyPopper, Delete, Check, X, ArrowRight,
  CalendarDays, Sparkles, ThumbsUp, Ear, Snail, Type, Star,
} from "lucide-react-native";
```
Add to the `MAP` object (after `type: Type,`):
```tsx
  star: Star,
```

- [ ] **Step 3: Add the three color tokens to `src/theme/tokens.ts`**

In the `color` object, immediately after the `accentTint: palette.gold50,` line, add:
```tsx
    accentTintStrong: palette.gold100,
    info: palette.sky500,
    infoTint: palette.sky100,
```
(These palette entries already exist: `gold100` #FFEFC2, `sky500` #16AEF0, `sky100` #D6F1FF.)

- [ ] **Step 4: Typecheck**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/Icon.tsx src/theme/tokens.ts
git commit -m "feat: add star icon + info/infoTint/accentTintStrong tokens"
```

---

## Task 2: Rewrite WeekPicker cards with the chips row

**Files:**
- Modify (replace whole file): `src/screens/WeekPicker.tsx`

**Interfaces:**
- Consumes: `star` icon + `theme.color.info`/`infoTint`/`accentTintStrong` (Task 1); `hasDictation`, `dictationCount`, `weeks`, `currentWeekNumber` from `@/data/words`; `useSession`, `Screen`, `Card`, `Icon`.

- [ ] **Step 1: Replace `src/screens/WeekPicker.tsx` with:**

```tsx
import { ReactNode } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { weeks, currentWeekNumber, hasDictation, dictationCount } from "@/data/words";
import { theme } from "@/theme/tokens";

function Chip({ bg, fg, icon, label }: { bg: string; fg: string; icon: ReactNode; label?: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg, paddingHorizontal: label === undefined ? 6 : 8 }]}>
      {icon}
      {label !== undefined ? <Text style={[styles.chipText, { color: fg }]}>{label}</Text> : null}
    </View>
  );
}

export function WeekPicker() {
  const router = useRouter();
  const { weekNumber, setWeekNumber } = useSession();
  const select = (w: number) => { setWeekNumber(w); router.replace("/home"); };

  return (
    <Screen style={{ paddingHorizontal: 22, paddingBottom: 24, paddingTop: 8 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/home")} accessibilityLabel="Close" style={styles.close}>
          <Icon name="x" size={24} color={theme.color.brand} />
        </Pressable>
        <Text style={styles.title}>Spelling weeks</Text>
      </View>
      <Text style={styles.subtitle}>Catch up on a missed week or look ahead.</Text>

      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        {weeks.map((w) => {
          const isCurrent = w.week === currentWeekNumber;
          const isSelected = w.week === weekNumber;
          return (
            <Pressable key={w.week} onPress={() => select(w.week)}>
              <Card tone={isSelected ? "tint" : "paper"} elevation={isSelected ? "none" : "sm"} pad="md"
                style={[styles.card, { borderColor: isSelected ? theme.color.brand : theme.color.border }]}>
                <View style={[styles.num, { backgroundColor: isSelected ? theme.color.brand : theme.color.brandTint }]}>
                  <Text style={[styles.numText, { color: isSelected ? "#fff" : theme.color.brand }]}>{w.week}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.weekTheme} numberOfLines={1}>{w.theme}</Text>
                  <View style={styles.chipRow}>
                    <Chip bg={theme.color.tint} fg={theme.color.brandLedge}
                      icon={<Icon name="pencil" size={14} color={theme.color.brand} />} label={String(w.words.length)} />
                    {hasDictation(w.week) && (
                      <Chip bg={theme.color.infoTint} fg={theme.color.info}
                        icon={<Icon name="ear" size={14} color={theme.color.info} />} label={String(dictationCount(w.week))} />
                    )}
                    {isCurrent && (
                      <Chip bg={theme.color.accentTintStrong} fg={theme.color.accentLedge}
                        icon={<Icon name="star" size={14} color={theme.color.accentLedge} />} />
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  close: { width: 44, height: 44, borderRadius: 999, borderWidth: 2, borderColor: theme.color.border, backgroundColor: theme.color.card, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: theme.font.display.bold, fontSize: 24, color: theme.color.textStrong },
  subtitle: { fontFamily: theme.font.body.semibold, fontSize: 14, color: theme.color.textMuted, marginBottom: 14 },
  card: { height: 84, flexDirection: "row", alignItems: "center", gap: 14 },
  num: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  numText: { fontFamily: theme.font.display.bold, fontSize: 18 },
  weekTheme: { fontFamily: theme.font.display.semibold, fontSize: 18, color: theme.color.textStrong, lineHeight: 20 },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: theme.radius.pill, paddingVertical: 3 },
  chipText: { fontFamily: theme.font.body.black, fontSize: 11.5 },
});
```

> Notes: the `Badge` import and the selected-`check`/"This week"-badge are removed (no longer used). `numberOfLines={1}` gives the single-line ellipsis on the theme title. The star Chip is icon-only (`label` omitted → tighter padding, no text).

- [ ] **Step 2: Typecheck**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
```
Expected: exit 0 (no unused-import or type errors).

- [ ] **Step 3: Commit**

```bash
git add src/screens/WeekPicker.tsx
git commit -m "feat: WeekPicker chips row + uniform card height"
```

---

## Task 3: Verification

**Files:** none.

- [ ] **Step 1: Full test suite + typecheck**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit && npx jest 2>&1 | tail -5
```
Expected: tsc exit 0; jest 25/25 (existing suites unaffected).

- [ ] **Step 2: Metro bundle check**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && rm -rf /tmp/sm-wp && npx expo export --platform ios --output-dir /tmp/sm-wp 2>&1 | tail -3
```
Expected: `Exported: /tmp/sm-wp` (exit 0).

- [ ] **Step 3: Web run-through** (start `npx expo start --web -c`, open `/weeks`)

Verify:
1. All four cards are the **same height**.
2. Week 10 "Tricky 'ough' words" — pencil chip `5` only.
3. Week 11 "Silent letters" — pencil `5` + blue ear `2`; shown **selected** (purple border/tint + solid number tile, **no check icon**).
4. Week 12 "Everyday words" — pencil `6` + ear `3` + gold **star** chip.
5. Week 13 "Adding -ed" — pencil `4` only.
6. Tapping a card selects that week and returns to Home; the Home card + Practice/Test then reflect that week.
7. No "This week" text badge anywhere.

---

## Self-Review (completed by plan author)

**Spec coverage:** star icon (§2.1) → Task 1. info/infoTint/accentTintStrong (§2.2) → Task 1. WeekPicker rewrite — fixed 84 height, number tile, single-line title, three chips with exact colors/conditions, removal of Badge + check (§2.3) → Task 2. Testing (§3) → Task 3. Out-of-scope (§4) → nothing touches dictation hexes or other files. ✓ No gaps.

**Placeholder scan:** No TBD/TODO; complete code in every code step; commands have expected output. ✓

**Type consistency:** `theme.color.info`/`infoTint`/`accentTintStrong` and icon `star` defined in Task 1, consumed in Task 2. `Chip` prop shape (`bg`/`fg`/`icon`/`label?`) is self-consistent within Task 2. `hasDictation`/`dictationCount`/`weeks`/`currentWeekNumber` are existing exports. `Card`/`Screen`/`Icon`/`useSession` APIs unchanged. ✓

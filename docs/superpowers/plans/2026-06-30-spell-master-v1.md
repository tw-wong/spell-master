# Spell Master v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Spell Master v1 Expo app (listen → practise → test) from the existing "Spell Master Design System" kit, runnable in Expo Go.

**Architecture:** A typed theme module + StyleSheet drives a set of presentational components that mirror the design kit's React API. Pure logic (week data, tile bank, scoring) is TDD-tested. expo-router file routes are thin wrappers over screen components; a single `SessionContext` holds the selected week and per-word test statuses.

**Tech Stack:** React Native + Expo SDK 54, TypeScript, expo-router, expo-speech, lucide-react-native + react-native-svg, @expo-google-fonts/fredoka + @expo-google-fonts/nunito, jest-expo.

## Global Constraints

- **Node:** run every Expo/npm command under Node 20.19.6 — prefix shells with `source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null`. (Default 18.17 is too old for SDK 54.)
- **Styling:** typed theme + `StyleSheet` only. No NativeWind.
- **Copy:** British spelling ("practise" verb, "favourite", "colour"); encouraging voice ("Great spelling!", "Almost — try again!"); sentence case; **no emoji** in UI.
- **Touch targets:** nothing tappable < 56px; primary actions 72px; letter tiles 52px.
- **Body text** never < 16px. Spelling word hero = 56px, letterSpacing 0.06em.
- **Icons:** lucide-react-native at stroke-width 2.4.
- **TTS:** en-GB, rate 0.85, pitch 1.05; cancel any in-flight utterance before speaking.
- **Source of truth for every screen/component's layout, colours, and copy:** the design kit files already read into the spec (`ui_kits/spell-master-app/*.jsx`, `tokens/*.css`). The kit's pass threshold is **≥ 80%**.

---

## Task 1: Scaffold project, dependencies, and test runner

**Files:**
- Create: whole Expo project in repo root (alongside `prd.md`, `docs/`).
- Modify: `package.json` (scripts, jest preset), `tsconfig.json`, `app.json`.
- Create: `jest.config.js` (or jest field), `.gitignore`.

**Interfaces:**
- Produces: a booting Expo Router app + working `npm test`.

- [ ] **Step 1: Scaffold into a temp dir, then move files into the repo root** (create-expo-app refuses a non-empty dir)

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null
cd /Users/tengwai.wong/Repo/repo_tw
npx create-expo-app@latest spell-master-tmp --template default
# move generated app into the existing repo (which already has prd.md + docs/)
cp -R spell-master-tmp/. spell-master/
rm -rf spell-master-tmp
cd spell-master
```

- [ ] **Step 2: Reset the starter template to a blank app folder**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null
# The default template ships an example under app/(tabs); remove it for a clean slate.
rm -rf app/\(tabs\) app/+not-found.tsx components hooks constants scripts app-example 2>/dev/null || true
```

- [ ] **Step 3: Install runtime dependencies (pinned by Expo's installer to SDK-54-compatible versions)**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null
npx expo install expo-speech expo-font expo-splash-screen react-native-svg
npm install lucide-react-native @expo-google-fonts/fredoka @expo-google-fonts/nunito
```

- [ ] **Step 4: Install the test runner**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null
npm install -D jest-expo jest @types/jest
```

- [ ] **Step 5: Add jest preset + scripts to `package.json`**

Ensure these fields exist (merge into the generated `package.json`):

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native))"
    ]
  }
}
```

- [ ] **Step 6: Create a smoke test so the runner has something to prove green**

Create `src/lib/smoke.test.ts`:

```ts
test("test runner works", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 7: Run the test, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/lib/smoke.test.ts
```
Expected: 1 passing test.

- [ ] **Step 8: Create a minimal root layout + index so the app boots**

Create `app/_layout.tsx`:

```tsx
import { Stack } from "expo-router";
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Create `app/index.tsx`:

```tsx
import { Text, View } from "react-native";
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Spell Master — scaffolding OK</Text>
    </View>
  );
}
```

- [ ] **Step 9: Verify it boots in Expo Go**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx expo start
```
Expected: QR loads in Expo Go showing "Spell Master — scaffolding OK". Stop the server after confirming.

- [ ] **Step 10: Initialise git and make the first commit**

```bash
cd /Users/tengwai.wong/Repo/repo_tw/spell-master
git init && git add -A && git commit -m "chore: scaffold Expo SDK 54 app + jest-expo"
```
> If the repo is already git-initialised, skip `git init`.

---

## Task 2: Theme tokens

**Files:**
- Create: `src/theme/tokens.ts`
- Test: `src/theme/tokens.test.ts`

**Interfaces:**
- Produces: `theme` with `color`, `space`, `radius`, `font`, `text` (sizes), `shadow(elev)`, `tracking`. Consumed by every component.

- [ ] **Step 1: Write the failing test**

`src/theme/tokens.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it, expect FAIL** (`Cannot find module './tokens'`)

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/theme/tokens.test.ts
```

- [ ] **Step 3: Implement `src/theme/tokens.ts`** (values copied verbatim from `tokens/*.css`)

```ts
export const palette = {
  purple50: "#F3EFFF", purple100: "#E7DEFF", purple200: "#CDBCFF", purple300: "#AC93FF",
  purple400: "#8F6FFF", purple500: "#7B61FF", purple600: "#6444E6", purple700: "#4E32B8",
  gold50: "#FFF8E6", gold100: "#FFEFC2", gold300: "#FFD873", gold400: "#FFC53D",
  gold500: "#F5A623", gold600: "#D5871A",
  green50: "#E2F8EF", green100: "#C2F1DD", green300: "#6FE0B0", green400: "#2FD18A",
  green500: "#16B978", green600: "#0E9460",
  coral50: "#FFECEC", coral100: "#FFD6D6", coral300: "#FF9F9F", coral400: "#FF7A7A",
  coral500: "#FF5E5E", coral600: "#E23F3F",
  sky100: "#D6F1FF", sky400: "#44C2FA", sky500: "#16AEF0",
  pink100: "#FFE2F1", pink400: "#FF8CC6", pink500: "#FB6CB2",
  ink900: "#241B47", ink700: "#463C70", ink500: "#756E9C", ink400: "#9890B8",
  ink300: "#C3BDDB", ink200: "#E5E0F2", ink100: "#F1EEF9",
  paper: "#FFFFFF", cream: "#FFFBF3", creamDeep: "#FFF4E2",
} as const;

const SHADOWS = {
  sm: { radius: 6, opacity: 0.08, offsetY: 2, elevation: 2 },
  md: { radius: 20, opacity: 0.1, offsetY: 8, elevation: 6 },
  lg: { radius: 40, opacity: 0.14, offsetY: 16, elevation: 12 },
} as const;

export const theme = {
  color: {
    bg: palette.cream,
    card: palette.paper,
    sunken: palette.ink100,
    tint: palette.purple50,
    textStrong: palette.ink900,
    textBody: palette.ink700,
    textMuted: palette.ink500,
    textDisabled: palette.ink300,
    onBrand: "#FFFFFF",
    border: palette.ink200,
    borderStrong: palette.ink300,
    brand: palette.purple500,
    brandStrong: palette.purple600,
    brandLedge: palette.purple700,
    brandTint: palette.purple50,
    accent: palette.gold400,
    accentStrong: palette.gold500,
    accentLedge: palette.gold600,
    success: palette.green500,
    successStrong: palette.green600,
    successLedge: palette.green600,
    successTint: palette.green50,
    tryAgain: palette.coral500,
    tryAgainStrong: palette.coral600,
    tryAgainTint: palette.coral50,
    gold300: palette.gold300,
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 },
  screenPad: 24,
  contentMax: 420,
  tap: { min: 56, large: 72, tile: 52 },
  radius: { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 },
  text: { "2xs": 12, xs: 14, sm: 16, md: 18, lg: 22, xl: 28, "2xl": 36, "3xl": 48, "4xl": 64, word: 56 },
  tracking: { word: 0.06 * 56 }, // RN letterSpacing is absolute px; ~3.36 at word size
  font: {
    display: { regular: "Fredoka_400Regular", medium: "Fredoka_500Medium", semibold: "Fredoka_600SemiBold", bold: "Fredoka_700Bold" },
    body: { regular: "Nunito_400Regular", medium: "Nunito_500Medium", semibold: "Nunito_600SemiBold", bold: "Nunito_700Bold", black: "Nunito_800ExtraBold" },
  },
  shadow(elev: "sm" | "md" | "lg") {
    const s = SHADOWS[elev];
    return {
      shadowColor: palette.ink900,
      shadowOpacity: s.opacity,
      shadowRadius: s.radius,
      shadowOffset: { width: 0, height: s.offsetY },
      elevation: s.elevation,
    };
  },
} as const;

export type Theme = typeof theme;
```

- [ ] **Step 4: Run the test, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/theme/tokens.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/theme && git commit -m "feat: theme tokens ported from design kit"
```

---

## Task 3: Fonts module

**Files:**
- Create: `src/theme/fonts.ts`

**Interfaces:**
- Produces: `fontMap` (object passed to `useFonts`) and re-exports the weight constants. Consumed by `app/_layout.tsx`.

- [ ] **Step 1: Implement `src/theme/fonts.ts`** (no test — it's a static re-export map; verified when the app loads in Task 16)

```ts
import {
  Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";
import {
  Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

export const fontMap = {
  Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold,
  Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/fonts.ts && git commit -m "feat: font map for Fredoka + Nunito"
```

---

## Task 4: Word-list data (TDD)

**Files:**
- Create: `src/data/words.ts`
- Test: `src/data/words.test.ts`

**Interfaces:**
- Produces: `type Word = { word: string; sentence: string; difficulty: "easy"|"medium"|"hard" }`; `type Week = { week: number; theme: string; words: Word[] }`; `weeks: Week[]`; `getCurrentWeek(): Week`; `getWeek(n: number): Week`; `currentWeekNumber: number`. Consumed by SessionContext + screens.

- [ ] **Step 1: Write the failing test**

`src/data/words.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it, expect FAIL**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/data/words.test.ts
```

- [ ] **Step 3: Implement `src/data/words.ts`** (data verbatim from the kit's `data.js`)

```ts
export type Difficulty = "easy" | "medium" | "hard";
export type Word = { word: string; sentence: string; difficulty: Difficulty };
export type Week = { week: number; theme: string; words: Word[] };

export const weeks: Week[] = [
  { week: 10, theme: "Tricky 'ough' words", words: [
    { word: "through", sentence: "We walked through the forest.", difficulty: "hard" },
    { word: "thought", sentence: "I thought about my answer.", difficulty: "hard" },
    { word: "enough", sentence: "We have enough apples.", difficulty: "medium" },
    { word: "bought", sentence: "Dad bought some milk.", difficulty: "medium" },
    { word: "rough", sentence: "The bark felt rough.", difficulty: "medium" },
  ] },
  { week: 11, theme: "Silent letters", words: [
    { word: "knight", sentence: "The knight rode a horse.", difficulty: "hard" },
    { word: "wrong", sentence: "That answer is wrong.", difficulty: "easy" },
    { word: "thumb", sentence: "She hurt her thumb.", difficulty: "medium" },
    { word: "climb", sentence: "Let's climb the hill.", difficulty: "medium" },
    { word: "listen", sentence: "Please listen carefully.", difficulty: "easy" },
  ] },
  { week: 12, theme: "Everyday words", words: [
    { word: "because", sentence: "I smiled because I was happy.", difficulty: "medium" },
    { word: "friend", sentence: "My friend is kind.", difficulty: "medium" },
    { word: "people", sentence: "Lots of people came.", difficulty: "medium" },
    { word: "school", sentence: "We learn at school.", difficulty: "easy" },
    { word: "beautiful", sentence: "What a beautiful day!", difficulty: "hard" },
    { word: "favourite", sentence: "Blue is my favourite colour.", difficulty: "hard" },
  ] },
  { week: 13, theme: "Adding -ed", words: [
    { word: "jumped", sentence: "The frog jumped away.", difficulty: "easy" },
    { word: "stopped", sentence: "The bus stopped here.", difficulty: "medium" },
    { word: "smiled", sentence: "She smiled at me.", difficulty: "easy" },
    { word: "carried", sentence: "He carried the bag.", difficulty: "medium" },
  ] },
];

const CURRENT_INDEX = 2; // Week 12. Date-derivation is a later enhancement (PRD open Q).

export const currentWeekNumber = weeks[CURRENT_INDEX].week;
export const getCurrentWeek = (): Week => weeks[CURRENT_INDEX];
export const getWeek = (n: number): Week => weeks.find((w) => w.week === n) ?? weeks[CURRENT_INDEX];
```

- [ ] **Step 4: Run the test, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/data/words.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/data && git commit -m "feat: typed bundled word-list data + lookups"
```

---

## Task 5: Letter-tile bank (TDD)

**Files:**
- Create: `src/lib/tiles.ts`
- Test: `src/lib/tiles.test.ts`

**Interfaces:**
- Produces: `shuffle<T>(arr: T[]): T[]`; `buildTileBank(word: string, fillers?: number): string[]`. Consumed by TestScreen.

- [ ] **Step 1: Write the failing test**

`src/lib/tiles.test.ts`:

```ts
import { buildTileBank, shuffle } from "./tiles";

test("bank contains every letter of the word", () => {
  const bank = buildTileBank("friend");
  for (const ch of "friend") {
    // remove one occurrence per matched letter
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
```

- [ ] **Step 2: Run it, expect FAIL**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/lib/tiles.test.ts
```

- [ ] **Step 3: Implement `src/lib/tiles.ts`**

```ts
const EXTRA = "aeiloprstn".split("");

export function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map((x) => x[1]);
}

export function buildTileBank(word: string, fillers = 3): string[] {
  const base = word.split("");
  const pool = shuffle(EXTRA.filter((c) => !base.includes(c))).slice(0, fillers);
  return shuffle([...base, ...pool]);
}
```

- [ ] **Step 4: Run the test, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/lib/tiles.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/tiles.ts src/lib/tiles.test.ts && git commit -m "feat: letter-tile bank builder"
```

---

## Task 6: Scoring (TDD)

**Files:**
- Create: `src/lib/score.ts`
- Test: `src/lib/score.test.ts`

**Interfaces:**
- Produces: `type Status = "correct" | "wrong" | null`; `scoreWeek(statuses: Status[]): { correct: number; total: number; pct: number; passed: boolean }`. Consumed by ResultsScreen + HomeScreen progress.

- [ ] **Step 1: Write the failing test**

`src/lib/score.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it, expect FAIL**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/lib/score.test.ts
```

- [ ] **Step 3: Implement `src/lib/score.ts`**

```ts
export type Status = "correct" | "wrong" | null;

export function scoreWeek(statuses: Status[]) {
  const total = statuses.length;
  const correct = statuses.filter((s) => s === "correct").length;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, pct, passed: pct >= 80 };
}
```

- [ ] **Step 4: Run the test, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test -- src/lib/score.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/score.ts src/lib/score.test.ts && git commit -m "feat: week scoring + pass threshold"
```

---

## Task 7: Speech wrapper

**Files:**
- Create: `src/lib/speech.ts`

**Interfaces:**
- Produces: `speak(text: string): void`. Consumed by Practice + Test screens.

- [ ] **Step 1: Implement `src/lib/speech.ts`** (no unit test — wraps native TTS; verified in Expo Go during screen tasks)

```ts
import * as Speech from "expo-speech";

export function speak(text: string): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: "en-GB", rate: 0.85, pitch: 1.05 });
  } catch {
    // TTS is best-effort; never throw into the UI.
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/speech.ts && git commit -m "feat: expo-speech wrapper (en-GB, gentle rate)"
```

---

## Task 8: Session context

**Files:**
- Create: `src/state/SessionContext.tsx`

**Interfaces:**
- Consumes: `getWeek`, `currentWeekNumber` (Task 4), `Status` (Task 6).
- Produces: `SessionProvider` + `useSession()` → `{ weekNumber, week, setWeekNumber, statuses, setStatuses, index, setIndex, resetWeek }`. `setWeekNumber` resets statuses+index. Consumed by every route/screen.

- [ ] **Step 1: Implement `src/state/SessionContext.tsx`**

```tsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { currentWeekNumber, getWeek, Week } from "../data/words";
import { Status } from "../lib/score";

type Session = {
  weekNumber: number;
  week: Week;
  setWeekNumber: (n: number) => void;
  statuses: Status[];
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [weekNumber, setWeekNumberRaw] = useState(currentWeekNumber);
  const week = useMemo(() => getWeek(weekNumber), [weekNumber]);
  const [statuses, setStatuses] = useState<Status[]>(() => week.words.map(() => null));
  const [index, setIndex] = useState(0);

  const setWeekNumber = useCallback((n: number) => {
    setWeekNumberRaw(n);
    setStatuses(getWeek(n).words.map(() => null));
    setIndex(0);
  }, []);

  const value = useMemo(
    () => ({ weekNumber, week, setWeekNumber, statuses, setStatuses, index, setIndex }),
    [weekNumber, week, statuses, index, setWeekNumber],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within SessionProvider");
  return v;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/state && git commit -m "feat: session context (week + test statuses)"
```

---

## Task 9: Icon component

**Files:**
- Create: `src/components/Icon.tsx`

**Interfaces:**
- Produces: `Icon` with props `{ name: IconName; size?: number; color?: string; strokeWidth?: number }`. `IconName` is the union of names used across screens. Consumed by every component/screen.

- [ ] **Step 1: Implement `src/components/Icon.tsx`** (maps kit's Lucide names to lucide-react-native components)

```tsx
import {
  Volume2, RotateCcw, Play, ChevronLeft, ChevronRight, ChevronDown,
  Pencil, Lightbulb, PartyPopper, Delete, Check, X, ArrowRight,
  CalendarDays, Sparkles, ThumbsUp,
} from "lucide-react-native";

const MAP = {
  "volume-2": Volume2, "rotate-ccw": RotateCcw, play: Play,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-down": ChevronDown,
  pencil: Pencil, lightbulb: Lightbulb, "party-popper": PartyPopper, delete: Delete,
  check: Check, x: X, "arrow-right": ArrowRight, "calendar-days": CalendarDays,
  sparkles: Sparkles, "thumbs-up": ThumbsUp,
} as const;

export type IconName = keyof typeof MAP;

export function Icon({ name, size = 24, color = "#241B47", strokeWidth = 2.4 }:
  { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const Cmp = MAP[name];
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Icon.tsx && git commit -m "feat: Lucide icon wrapper"
```

---

## Task 10: Button (candy button)

**Files:**
- Create: `src/components/Button.tsx`

**Interfaces:**
- Consumes: `theme` (Task 2).
- Produces: `Button` props `{ variant: "primary"|"success"|"secondary"|"ghost"; size?: "lg"|"md"; fullWidth?: boolean; onPress?: () => void; disabled?: boolean; icon?: ReactNode; iconRight?: ReactNode; children: ReactNode }`. Consumed by Welcome/Home/Test/Results screens.

- [ ] **Step 1: Implement `src/components/Button.tsx`** (layered ledge + Pressable dip per spec §6)

```tsx
import { ReactNode } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { theme } from "../theme/tokens";

type Variant = "primary" | "success" | "secondary" | "ghost";
const RAISED: Record<"primary" | "success", { face: string; ledge: string }> = {
  primary: { face: theme.color.brand, ledge: theme.color.brandLedge },
  success: { face: theme.color.success, ledge: theme.color.successLedge },
};

export function Button({
  variant, size = "md", fullWidth, onPress, disabled, icon, iconRight, children,
}: {
  variant: Variant; size?: "lg" | "md"; fullWidth?: boolean; onPress?: () => void;
  disabled?: boolean; icon?: ReactNode; iconRight?: ReactNode; children: ReactNode;
}) {
  const h = size === "lg" ? theme.tap.large : theme.tap.min;
  const raised = variant === "primary" || variant === "success";
  const textColor =
    variant === "secondary" ? theme.color.brand : variant === "ghost" ? theme.color.textMuted : "#fff";
  const fontSize = size === "lg" ? 20 : 18;

  const label = (
    <View style={styles.row}>
      {icon ? <View style={styles.slot}>{icon}</View> : null}
      <Text style={[styles.text, { color: textColor, fontSize }]}>{children}</Text>
      {iconRight ? <View style={styles.slot}>{iconRight}</View> : null}
    </View>
  );

  if (!raised) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.flat,
          { height: h, alignSelf: fullWidth ? "stretch" : "auto" },
          variant === "secondary" && styles.secondary,
          variant === "ghost" && styles.ghost,
          pressed && { opacity: 0.85 },
          disabled && { opacity: 0.5 },
        ]}
      >
        {label}
      </Pressable>
    );
  }

  const v = RAISED[variant];
  return (
    <View style={[styles.shell, { height: h + 6, alignSelf: fullWidth ? "stretch" : "auto" }]}>
      <View style={[styles.ledge, { height: h, backgroundColor: v.ledge }]} />
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.face,
          { height: h, backgroundColor: v.face, top: pressed ? 4 : 0 },
          disabled && { opacity: 0.5 },
        ]}
      >
        {label}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: "relative", borderRadius: theme.radius.pill },
  ledge: { position: "absolute", left: 0, right: 0, top: 6, borderRadius: theme.radius.pill },
  face: {
    position: "absolute", left: 0, right: 0, borderRadius: theme.radius.pill,
    alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space[6],
  },
  flat: {
    borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    paddingHorizontal: theme.space[6], flexDirection: "row",
  },
  secondary: { backgroundColor: theme.color.brandTint, borderWidth: 2, borderColor: theme.color.border },
  ghost: { backgroundColor: "transparent" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  slot: { alignItems: "center", justifyContent: "center" },
  text: { fontFamily: theme.font.display.semibold },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Button.tsx && git commit -m "feat: candy Button (layered ledge + press dip)"
```

---

## Task 11: IconButton

**Files:**
- Create: `src/components/IconButton.tsx`

**Interfaces:**
- Produces: `IconButton` props `{ tone: "brand"|"soft"; size?: "lg"|"md"; onPress?: () => void; disabled?: boolean; label: string; children: ReactNode; style?: ViewStyle }`. `label` → `accessibilityLabel`. Consumed by Practice/Test screens.

- [ ] **Step 1: Implement `src/components/IconButton.tsx`**

```tsx
import { ReactNode } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../theme/tokens";

export function IconButton({
  tone, size = "md", onPress, disabled, label, children, style,
}: {
  tone: "brand" | "soft"; size?: "lg" | "md"; onPress?: () => void; disabled?: boolean;
  label: string; children: ReactNode; style?: ViewStyle;
}) {
  const d = size === "lg" ? 64 : 56;
  const brand = tone === "brand";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { width: d, height: d, borderRadius: theme.radius.pill },
        brand
          ? { backgroundColor: theme.color.brand }
          : { backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border },
        pressed && { transform: [{ translateY: 2 }] },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
```

> Note: in `soft` tone the screens pass a chevron `Icon` coloured `theme.color.brand`; in `brand` tone they pass white icons. The IconButton does not recolour children.

- [ ] **Step 2: Commit**

```bash
git add src/components/IconButton.tsx && git commit -m "feat: IconButton (brand/soft tones)"
```

---

## Task 12: Card

**Files:**
- Create: `src/components/Card.tsx`

**Interfaces:**
- Produces: `Card` props `{ tone?: "paper"|"brand"|"tint"; elevation?: "none"|"sm"|"lg"; pad?: "md"|"lg"; style?: ViewStyle; children: ReactNode }`. Consumed by Home/Practice/Results/WeekPicker.

- [ ] **Step 1: Implement `src/components/Card.tsx`**

```tsx
import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../theme/tokens";

export function Card({
  tone = "paper", elevation = "sm", pad = "lg", style, children,
}: {
  tone?: "paper" | "brand" | "tint"; elevation?: "none" | "sm" | "lg";
  pad?: "md" | "lg"; style?: ViewStyle; children: ReactNode;
}) {
  const bg =
    tone === "brand" ? theme.color.brand : tone === "tint" ? theme.color.tint : theme.color.card;
  const border = tone === "brand" ? "transparent" : theme.color.border;
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: border, padding: pad === "lg" ? theme.space[5] : theme.space[4] },
        elevation !== "none" && theme.shadow(elevation === "lg" ? "lg" : "sm"),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: theme.radius.lg, borderWidth: 2 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Card.tsx && git commit -m "feat: Card (paper/brand/tint, soft shadow)"
```

---

## Task 13: Badge

**Files:**
- Create: `src/components/Badge.tsx`

**Interfaces:**
- Produces: `Badge` props `{ tone?: "brand"|"success"|"solid"; color?: string; bg?: string; children: ReactNode }`. Consumed by Home/Practice/WeekPicker.

- [ ] **Step 1: Implement `src/components/Badge.tsx`**

```tsx
import { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { theme } from "../theme/tokens";

export function Badge({
  tone = "brand", color, bg, children,
}: { tone?: "brand" | "success" | "solid"; color?: string; bg?: string; children: ReactNode }) {
  const presets = {
    brand: { bg: theme.color.brandTint, fg: theme.color.brand },
    success: { bg: theme.color.successTint, fg: theme.color.successStrong },
    solid: { bg: "rgba(255,255,255,0.22)", fg: "#fff" },
  }[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg ?? presets.bg }]}>
      <Text style={[styles.text, { color: color ?? presets.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: "flex-start", borderRadius: theme.radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  text: { fontFamily: theme.font.body.black, fontSize: 13 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Badge.tsx && git commit -m "feat: Badge"
```

---

## Task 14: ProgressBar

**Files:**
- Create: `src/components/ProgressBar.tsx`

**Interfaces:**
- Produces: `ProgressBar` props `{ value: number; max: number; tone?: "gold"|"brand"; height?: number }`. Consumed by Home/Results.

- [ ] **Step 1: Implement `src/components/ProgressBar.tsx`**

```tsx
import { View, StyleSheet } from "react-native";
import { theme } from "../theme/tokens";

export function ProgressBar({
  value, max, tone = "gold", height = 10,
}: { value: number; max: number; tone?: "gold" | "brand"; height?: number }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const fill = tone === "gold" ? theme.color.accent : theme.color.brand;
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View style={{ width: `${pct * 100}%`, backgroundColor: fill, height, borderRadius: height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: "rgba(255,255,255,0.28)", overflow: "hidden", width: "100%" },
});
```

> On the white-on-brand Home card the track sits on purple, so the translucent-white track reads correctly. On the cream Results screen pass `tone="brand"` over a `theme.color.sunken` track — Results uses its own layout, so this default track colour is only used on the brand card.

- [ ] **Step 2: Commit**

```bash
git add src/components/ProgressBar.tsx && git commit -m "feat: ProgressBar"
```

---

## Task 15: ProgressDots

**Files:**
- Create: `src/components/ProgressDots.tsx`

**Interfaces:**
- Produces: `ProgressDots` props `{ statuses: ("current"|"correct"|"wrong"|"upcoming")[] }`. Consumed by TestScreen.

- [ ] **Step 1: Implement `src/components/ProgressDots.tsx`**

```tsx
import { View } from "react-native";
import { theme } from "../theme/tokens";

const COLORS = {
  current: theme.color.brand,
  correct: theme.color.success,
  wrong: theme.color.tryAgain,
  upcoming: theme.color.border,
} as const;

export function ProgressDots({ statuses }: { statuses: (keyof typeof COLORS)[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" }}>
      {statuses.map((s, i) => {
        const big = s === "current";
        const d = big ? 12 : 9;
        return <View key={i} style={{ width: d, height: d, borderRadius: 999, backgroundColor: COLORS[s] }} />;
      })}
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProgressDots.tsx && git commit -m "feat: ProgressDots"
```

---

## Task 16: FeedbackBanner

**Files:**
- Create: `src/components/FeedbackBanner.tsx`

**Interfaces:**
- Produces: `FeedbackBanner` props `{ status: "correct"|"try-again"|"hint"; title?: string; message?: string; icon: ReactNode }`. Default copy when `message` omitted: correct → "Great spelling!". Consumed by TestScreen.

- [ ] **Step 1: Implement `src/components/FeedbackBanner.tsx`** (pop-in via Animated scale 0.94→1, bouncy)

```tsx
import { ReactNode, useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet, Easing } from "react-native";
import { theme } from "../theme/tokens";

const TONES = {
  correct: { bg: theme.color.successTint, fg: theme.color.successStrong, defaultTitle: "Great spelling!" },
  "try-again": { bg: theme.color.tryAgainTint, fg: theme.color.tryAgainStrong, defaultTitle: "Almost — try again!" },
  hint: { bg: "#FFF8E6", fg: "#D5871A", defaultTitle: "Hint" },
} as const;

export function FeedbackBanner({
  status, title, message, icon,
}: { status: keyof typeof TONES; title?: string; message?: string; icon: ReactNode }) {
  const t = TONES[status];
  const scale = useRef(new Animated.Value(0.94)).current;
  useEffect(() => {
    scale.setValue(0.94);
    Animated.timing(scale, {
      toValue: 1, duration: 220, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: true,
    }).start();
  }, [status, message]);

  return (
    <Animated.View style={[styles.base, { backgroundColor: t.bg, transform: [{ scale }] }]}>
      <View style={styles.icon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: t.fg }]}>{title ?? t.defaultTitle}</Text>
        {message ? <Text style={[styles.msg, { color: theme.color.textBody }]}>{message}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%", flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: theme.radius.lg, padding: theme.space[4],
  },
  icon: { width: 32, alignItems: "center" },
  title: { fontFamily: theme.font.display.semibold, fontSize: 18 },
  msg: { fontFamily: theme.font.body.semibold, fontSize: 14, marginTop: 2 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FeedbackBanner.tsx && git commit -m "feat: FeedbackBanner (pop-in)"
```

---

## Task 17: SegmentedControl

**Files:**
- Create: `src/components/SegmentedControl.tsx`

**Interfaces:**
- Produces: `SegmentedControl` props `{ options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }`. Consumed by Practice/Test TopBar.

- [ ] **Step 1: Implement `src/components/SegmentedControl.tsx`**

```tsx
import { Pressable, Text, View, StyleSheet } from "react-native";
import { theme } from "../theme/tokens";

export function SegmentedControl({
  options, value, onChange,
}: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.seg, active && styles.segActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, { color: active ? "#fff" : theme.color.textMuted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row", backgroundColor: theme.color.sunken,
    borderRadius: theme.radius.pill, padding: 4,
  },
  seg: { flex: 1, height: 44, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center" },
  segActive: { backgroundColor: theme.color.brand, ...theme.shadow("sm") },
  label: { fontFamily: theme.font.display.semibold, fontSize: 16 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SegmentedControl.tsx && git commit -m "feat: SegmentedControl"
```

---

## Task 18: LetterSlots

**Files:**
- Create: `src/components/LetterSlots.tsx`

**Interfaces:**
- Produces: `LetterSlots` props `{ value: string; length: number; state: "active"|"correct"|"wrong" }`. Renders `length` slots; fills the first `value.length` with letters. Consumed by TestScreen.

- [ ] **Step 1: Implement `src/components/LetterSlots.tsx`**

```tsx
import { Text, View, StyleSheet } from "react-native";
import { theme } from "../theme/tokens";

const BORDER = {
  active: theme.color.brand,
  correct: theme.color.success,
  wrong: theme.color.tryAgain,
} as const;

export function LetterSlots({
  value, length, state,
}: { value: string; length: number; state: keyof typeof BORDER }) {
  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] ?? "";
        const filled = i < value.length;
        return (
          <View
            key={i}
            style={[
              styles.slot,
              { borderColor: filled ? BORDER[state] : theme.color.border,
                backgroundColor: filled ? theme.color.card : theme.color.sunken },
            ]}
          >
            <Text style={styles.ch}>{ch}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  slot: {
    width: 38, height: 48, borderRadius: theme.radius.md, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  ch: { fontFamily: theme.font.display.semibold, fontSize: 26, color: theme.color.textStrong },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LetterSlots.tsx && git commit -m "feat: LetterSlots"
```

---

## Task 19: LetterTile

**Files:**
- Create: `src/components/LetterTile.tsx`

**Interfaces:**
- Produces: `LetterTile` props `{ letter: string; used?: boolean; onPress?: () => void }`. 52px tile; greyed + non-interactive when `used`. Consumed by TestScreen.

- [ ] **Step 1: Implement `src/components/LetterTile.tsx`**

```tsx
import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../theme/tokens";

export function LetterTile({ letter, used, onPress }: { letter: string; used?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={used}
      style={({ pressed }) => [
        styles.tile,
        used ? styles.used : styles.live,
        pressed && !used && { transform: [{ translateY: 2 }] },
      ]}
    >
      <Text style={[styles.ch, { color: used ? theme.color.textDisabled : theme.color.brand }]}>{letter}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: theme.tap.tile, height: theme.tap.tile, borderRadius: theme.radius.pill,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  live: { backgroundColor: theme.color.card, borderColor: theme.color.border, ...theme.shadow("sm") },
  used: { backgroundColor: theme.color.sunken, borderColor: theme.color.sunken },
  ch: { fontFamily: theme.font.display.bold, fontSize: 24 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LetterTile.tsx && git commit -m "feat: LetterTile"
```

---

## Task 20: Logo mark + Screen frame helper

**Files:**
- Create: `src/components/Logo.tsx`
- Create: `src/components/Screen.tsx`

**Interfaces:**
- Produces: `Logo` props `{ size?: number }` (purple squircle + gold sparkle, via react-native-svg). `Screen` props `{ children; style? }` — a `SafeAreaView`-padded cream container capping content at 420px centered. Consumed by all screens.

- [ ] **Step 1: Implement `src/components/Logo.tsx`** (re-draw of `assets/logo-mark.svg`: purple rounded square + gold 4-point sparkle)

```tsx
import Svg, { Rect, Path } from "react-native-svg";
import { theme } from "../theme/tokens";

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="6" y="6" width="88" height="88" rx="28" fill={theme.color.brand} />
      <Path
        d="M50 24 C53 40 60 47 76 50 C60 53 53 60 50 76 C47 60 40 53 24 50 C40 47 47 40 50 24 Z"
        fill={theme.color.accent}
      />
    </Svg>
  );
}
```

- [ ] **Step 2: Implement `src/components/Screen.tsx`**

```tsx
import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme/tokens";

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.bg },
  inner: { flex: 1, width: "100%", maxWidth: theme.contentMax, alignSelf: "center" },
});
```

> `react-native-safe-area-context` ships with the Expo Router template. If `npm test`/typecheck reports it missing, run `npx expo install react-native-safe-area-context`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Logo.tsx src/components/Screen.tsx && git commit -m "feat: Logo mark + Screen frame"
```

---

## Task 21: WelcomeScreen + route

**Files:**
- Create: `src/screens/WelcomeScreen.tsx`
- Create: `app/index.tsx` (replace the placeholder)

**Interfaces:**
- Consumes: `useSession`, `Button`, `Icon`, `Logo`, `Screen`, `useRouter` (expo-router).
- Mirrors kit `WelcomeScreen.jsx`: logo + sparkles, title, tagline, week chip, "Let's practise!" (→ practice), "Choose a different week" (→ weeks), grown-up footnote.

- [ ] **Step 1: Implement `src/screens/WelcomeScreen.tsx`**

```tsx
import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { useSession } from "../state/SessionContext";
import { theme } from "../theme/tokens";

export function WelcomeScreen() {
  const router = useRouter();
  const { week } = useSession();
  return (
    <Screen style={{ paddingHorizontal: 28, paddingBottom: 30 }}>
      <View style={styles.hero}>
        <Logo size={116} />
        <Text style={styles.title}>Spell Master</Text>
        <Text style={styles.tag}>Hear it, practise it, spell it. Let's learn this week's words!</Text>
        <View style={styles.chip}>
          <Icon name="calendar-days" size={18} color={theme.color.brand} />
          <Text style={styles.chipText}>Week {week.week} · {week.theme}</Text>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <Button variant="primary" size="lg" fullWidth onPress={() => router.push("/practice")}
          iconRight={<Icon name="arrow-right" size={24} color="#fff" />}>
          Let's practise!
        </Button>
        <Button variant="ghost" size="md" fullWidth onPress={() => router.push("/weeks")}>
          Choose a different week
        </Button>
      </View>
      <Text style={styles.foot}>For grown-ups: works offline · no account needed</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontFamily: theme.font.display.bold, fontSize: 44, color: theme.color.textStrong, marginTop: 18 },
  tag: { fontFamily: theme.font.body.bold, fontSize: 17, color: theme.color.textMuted, textAlign: "center", maxWidth: 260 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6,
    backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16,
  },
  chipText: { fontFamily: theme.font.body.black, fontSize: 14, color: theme.color.textStrong },
  foot: { textAlign: "center", marginTop: 14, fontFamily: theme.font.body.semibold, fontSize: 12, color: theme.color.textMuted },
});
```

- [ ] **Step 2: Wire `app/index.tsx`**

```tsx
import { WelcomeScreen } from "../src/screens/WelcomeScreen";
export default function Index() {
  return <WelcomeScreen />;
}
```

- [ ] **Step 3: Verify in Expo Go** — Welcome renders with logo, week chip shows "Week 12 · Everyday words", buttons navigate (Practice route exists after Task 23; for now confirm layout + that "Choose a different week" is tappable). Commit.

```bash
git add src/screens/WelcomeScreen.tsx app/index.tsx && git commit -m "feat: WelcomeScreen + index route"
```

---

## Task 22: HomeScreen + route

**Files:**
- Create: `src/screens/HomeScreen.tsx`
- Create: `app/home.tsx`

**Interfaces:**
- Consumes: `useSession`, `Card`, `Button`, `Badge`, `ProgressBar`, `Icon`, `Logo`, `Screen`, `scoreWeek`.
- Mirrors kit `HomeScreen.jsx`: header, "Ready to practise?", brand week card (week switch chip → weeks, "{done}/{total} learned" + gold ProgressBar), Practise (→ practice) + Take the test (→ test).

- [ ] **Step 1: Implement `src/screens/HomeScreen.tsx`**

```tsx
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Logo } from "../components/Logo";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { Icon } from "../components/Icon";
import { useSession } from "../state/SessionContext";
import { scoreWeek } from "../lib/score";
import { theme } from "../theme/tokens";

export function HomeScreen() {
  const router = useRouter();
  const { week, statuses } = useSession();
  const { correct, total } = scoreWeek(statuses);

  return (
    <Screen style={{ paddingHorizontal: 24, paddingBottom: 28, paddingTop: 8 }}>
      <View style={styles.header}>
        <Logo size={44} />
        <Text style={styles.brand}>Spell Master</Text>
      </View>
      <Text style={styles.hello}>Hello! Ready to practise?</Text>

      <Card tone="brand" elevation="lg" style={{ marginTop: 16 }}>
        <View style={styles.cardTop}>
          <Badge tone="solid">This week</Badge>
          <Pressable onPress={() => router.push("/weeks")} style={styles.weekChip}>
            <Text style={styles.weekChipText}>Week {week.week}</Text>
            <Icon name="chevron-down" size={16} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.theme}>{week.theme}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.learned}>{correct}/{total} learned</Text>
          <View style={{ flex: 1 }}>
            <ProgressBar value={correct} max={total} tone="gold" height={10} />
          </View>
        </View>
      </Card>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 14 }}>
        <Button variant="primary" size="lg" fullWidth onPress={() => router.push("/practice")}
          icon={<Icon name="volume-2" size={26} color="#fff" />}>
          Practise words
        </Button>
        <Button variant="success" size="lg" fullWidth onPress={() => router.push("/test")}
          icon={<Icon name="pencil" size={24} color="#fff" />}>
          Take the test
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  brand: { fontFamily: theme.font.display.bold, fontSize: 24, color: theme.color.textStrong },
  hello: { fontFamily: theme.font.body.bold, fontSize: 16, color: theme.color.textMuted },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  weekChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12,
  },
  weekChipText: { fontFamily: theme.font.body.black, fontSize: 13, color: "#fff" },
  theme: { fontFamily: theme.font.display.bold, fontSize: 30, color: "#fff", lineHeight: 32 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  learned: { fontFamily: theme.font.body.black, fontSize: 13, color: theme.color.gold300 },
});
```

- [ ] **Step 2: Wire `app/home.tsx`**

```tsx
import { HomeScreen } from "../src/screens/HomeScreen";
export default function Home() {
  return <HomeScreen />;
}
```

- [ ] **Step 3: Verify in Expo Go** (navigate to `/home` — temporarily point Welcome's primary button to `/home` if needed, then restore) and commit.

```bash
git add src/screens/HomeScreen.tsx app/home.tsx && git commit -m "feat: HomeScreen + route"
```

---

## Task 23: PracticeScreen + TopBar + route

**Files:**
- Create: `src/screens/TopBar.tsx`
- Create: `src/screens/PracticeScreen.tsx`
- Create: `app/practice.tsx`

**Interfaces:**
- Consumes: `useSession`, `IconButton`, `Card`, `Badge`, `Icon`, `SegmentedControl`, `Screen`, `speak`, `useRouter`.
- `TopBar` props `{ mode: "practice"|"test"; onMode: (m: string) => void; onBack: () => void }`.
- Mirrors kit `PracticeScreen.jsx`: TopBar (home + Practise/Test segmented), "Word N of M" badge, "Tap to hear it", 120px hero Listen IconButton, the word at 52px tracked, example-sentence tint card with play, prev/dots/next nav. Speaks the word on index change.

- [ ] **Step 1: Implement `src/screens/TopBar.tsx`**

```tsx
import { View, StyleSheet } from "react-native";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";
import { SegmentedControl } from "../components/SegmentedControl";

export function TopBar({
  mode, onMode, onBack,
}: { mode: "practice" | "test"; onMode: (m: string) => void; onBack: () => void }) {
  return (
    <View style={styles.bar}>
      <IconButton tone="soft" label="Home" onPress={onBack} style={{ width: 44, height: 44 }}>
        <Icon name="chevron-left" size={24} color="#7B61FF" />
      </IconButton>
      <View style={{ flex: 1 }}>
        <SegmentedControl
          options={[{ value: "practice", label: "Practise" }, { value: "test", label: "Test" }]}
          value={mode}
          onChange={onMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
});
```

- [ ] **Step 2: Implement `src/screens/PracticeScreen.tsx`**

```tsx
import { useEffect } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { TopBar } from "./TopBar";
import { useSession } from "../state/SessionContext";
import { speak } from "../lib/speech";
import { theme } from "../theme/tokens";

export function PracticeScreen() {
  const router = useRouter();
  const { week, index, setIndex } = useSession();
  const item = week.words[index];
  const last = week.words.length - 1;

  useEffect(() => { speak(item.word); }, [index, item.word]);

  return (
    <Screen>
      <TopBar mode="practice" onMode={(m) => { setIndex(0); router.replace(m === "test" ? "/test" : "/practice"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <Badge tone="brand">Word {index + 1} of {week.words.length}</Badge>
        <Text style={styles.hint}>Tap to hear it</Text>
        <IconButton tone="brand" size="lg" label={`Listen to ${item.word}`} onPress={() => speak(item.word)}
          style={{ width: 120, height: 120, marginVertical: 8 }}>
          <Icon name="volume-2" size={52} color="#fff" />
        </IconButton>
        <Text style={styles.word}>{item.word}</Text>
        <Card tone="tint" pad="md" elevation="none" style={styles.sentence}>
          <Pressable onPress={() => speak(item.sentence)} accessibilityLabel="Hear the sentence" style={styles.playBtn}>
            <Icon name="play" size={20} color={theme.color.brand} />
          </Pressable>
          <Text style={styles.sentenceText}>{item.sentence}</Text>
        </Card>
      </View>

      <View style={styles.nav}>
        <IconButton tone="soft" label="Previous word" disabled={index === 0} onPress={() => setIndex(Math.max(0, index - 1))}>
          <Icon name="chevron-left" size={26} color="#7B61FF" />
        </IconButton>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {week.words.map((_, i) => (
            <View key={i} style={{ width: i === index ? 12 : 9, height: i === index ? 12 : 9, borderRadius: 999,
              backgroundColor: i === index ? theme.color.brand : theme.color.border }} />
          ))}
        </View>
        <IconButton tone="soft" label="Next word" disabled={index === last} onPress={() => setIndex(Math.min(last, index + 1))}>
          <Icon name="chevron-right" size={26} color="#7B61FF" />
        </IconButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  hint: { fontFamily: theme.font.body.bold, fontSize: 15, color: theme.color.textMuted, marginTop: 6 },
  word: { fontFamily: theme.font.display.bold, fontSize: theme.text.word, color: theme.color.textStrong, letterSpacing: theme.tracking.word, textAlign: "center" },
  sentence: { marginTop: 14, width: "100%", flexDirection: "row", alignItems: "center", gap: 12 },
  playBtn: { width: 40, height: 40, borderRadius: 999, backgroundColor: "#E7DEFF", alignItems: "center", justifyContent: "center" },
  sentenceText: { flex: 1, fontFamily: theme.font.body.semibold, fontSize: 15, color: theme.color.textBody },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 30 },
});
```

- [ ] **Step 3: Wire `app/practice.tsx`**

```tsx
import { PracticeScreen } from "../src/screens/PracticeScreen";
export default function Practice() {
  return <PracticeScreen />;
}
```

- [ ] **Step 4: Verify in Expo Go** — word speaks on open + on Listen tap, sentence plays, prev/next + dots track, segmented switches to Test (route lands after Task 24). Commit.

```bash
git add src/screens/TopBar.tsx src/screens/PracticeScreen.tsx app/practice.tsx && git commit -m "feat: PracticeScreen + TopBar + route"
```

---

## Task 24: TestScreen + route

**Files:**
- Create: `src/screens/TestScreen.tsx`
- Create: `app/test.tsx`

**Interfaces:**
- Consumes: `useSession`, `IconButton`, `Button`, `Icon`, `ProgressDots`, `LetterSlots`, `LetterTile`, `FeedbackBanner`, `TopBar`, `Screen`, `speak`, `buildTileBank`, `useRouter`.
- Mirrors kit `TestScreen.jsx`: progress dots, listen + "Play again", "Spell the word you hear", LetterSlots, feedback/hint (hint after 2 misses = first letter + length), tile bank, backspace + "Check it"/"Next word"/"All done!". Writes statuses; on finish → `/results`. Speaks word on index change.

- [ ] **Step 1: Implement `src/screens/TestScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { ProgressDots } from "../components/ProgressDots";
import { LetterSlots } from "../components/LetterSlots";
import { LetterTile } from "../components/LetterTile";
import { FeedbackBanner } from "../components/FeedbackBanner";
import { TopBar } from "./TopBar";
import { useSession } from "../state/SessionContext";
import { speak } from "../lib/speech";
import { buildTileBank } from "../lib/tiles";
import { theme } from "../theme/tokens";

export function TestScreen() {
  const router = useRouter();
  const { week, index, setIndex, statuses, setStatuses } = useSession();
  const target = week.words[index].word;
  const last = week.words.length - 1;

  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [tiles, setTiles] = useState<string[]>([]);
  const [usedIdx, setUsedIdx] = useState<number[]>([]);

  useEffect(() => {
    setTiles(buildTileBank(target));
    setAnswer(""); setAttempts(0); setResult(null); setUsedIdx([]);
    speak(target);
  }, [index, target]);

  const showHint = attempts >= 2 && result !== "correct";

  const tapTile = (ch: string, i: number) => {
    if (result === "correct" || answer.length >= target.length) return;
    setAnswer((a) => a + ch);
    setUsedIdx((u) => [...u, i]);
    setResult(null);
  };
  const backspace = () => {
    if (!answer) return;
    setAnswer((a) => a.slice(0, -1));
    setUsedIdx((u) => u.slice(0, -1));
    setResult(null);
  };
  const check = () => {
    if (answer.toLowerCase() === target.toLowerCase()) {
      setResult("correct");
      setStatuses((s) => { const n = [...s]; n[index] = "correct"; return n; });
    } else {
      setResult("wrong");
      setAttempts((a) => a + 1);
      setStatuses((s) => { const n = [...s]; if (n[index] !== "correct") n[index] = "wrong"; return n; });
    }
  };
  const advance = () => {
    if (index < last) setIndex(index + 1);
    else router.replace("/results");
  };

  const slotState = result === "correct" ? "correct" : result === "wrong" ? "wrong" : "active";
  const dotStatuses = statuses.map((s, i) => (i === index ? "current" : s ?? "upcoming")) as
    ("current" | "correct" | "wrong" | "upcoming")[];

  return (
    <Screen>
      <TopBar mode="test" onMode={(m) => { setIndex(0); router.replace(m === "practice" ? "/practice" : "/test"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <ProgressDots statuses={dotStatuses} />

        <View style={styles.listenRow}>
          <IconButton tone="brand" size="md" label="Hear the word" onPress={() => speak(target)}>
            <Icon name="volume-2" size={28} color="#fff" />
          </IconButton>
          <Pressable onPress={() => speak(target)} style={styles.playAgain}>
            <Icon name="rotate-ccw" size={16} color={theme.color.textMuted} />
            <Text style={styles.playAgainText}>Play again</Text>
          </Pressable>
        </View>
        <Text style={styles.prompt}>Spell the word you hear</Text>

        <LetterSlots value={answer} length={target.length} state={slotState} />

        {result === "correct" && (
          <FeedbackBanner status="correct" icon={<Icon name="party-popper" size={26} color={theme.color.successStrong} />} />
        )}
        {result === "wrong" && !showHint && (
          <FeedbackBanner status="try-again" message="Not quite — listen again and retry."
            icon={<Icon name="rotate-ccw" size={24} color={theme.color.tryAgainStrong} />} />
        )}
        {showHint && result !== "correct" && (
          <FeedbackBanner status="hint" title={`Starts with “${target[0]}”`}
            message={`${target.length} letters:  ${target[0]}${" _".repeat(target.length - 1)}`}
            icon={<Icon name="lightbulb" size={24} color="#D5871A" />} />
        )}

        <View style={{ flex: 1 }} />

        <View style={styles.bank}>
          {tiles.map((ch, i) => (
            <LetterTile key={i} letter={ch} used={usedIdx.includes(i)} onPress={() => tapTile(ch, i)} />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <IconButton tone="soft" label="Delete a letter" onPress={backspace} disabled={!answer || result === "correct"}>
          <Icon name="delete" size={24} color="#7B61FF" />
        </IconButton>
        {result === "correct" ? (
          <Button variant="primary" size="md" fullWidth onPress={advance}
            iconRight={<Icon name="arrow-right" size={22} color="#fff" />}>
            {index < last ? "Next word" : "All done!"}
          </Button>
        ) : (
          <Button variant="success" size="md" fullWidth onPress={check} disabled={answer.length === 0}>
            Check it
          </Button>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", paddingHorizontal: 22, gap: 12, paddingTop: 4 },
  listenRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  playAgain: { flexDirection: "row", alignItems: "center", gap: 5 },
  playAgainText: { fontFamily: theme.font.body.black, fontSize: 15, color: theme.color.textMuted },
  prompt: { fontFamily: theme.font.body.bold, fontSize: 14, color: theme.color.textMuted },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 320 },
  actions: { flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
});
```

- [ ] **Step 2: Wire `app/test.tsx`**

```tsx
import { TestScreen } from "../src/screens/TestScreen";
export default function Test() {
  return <TestScreen />;
}
```

- [ ] **Step 3: Verify in Expo Go** — full test loop: word speaks, tap letters fill slots, "Check it" → green banner + advance; wrong → coral; after 2 wrong → hint banner; last word "All done!" → Results. Commit.

```bash
git add src/screens/TestScreen.tsx app/test.tsx && git commit -m "feat: TestScreen + route"
```

---

## Task 25: ResultsScreen + route

**Files:**
- Create: `src/screens/ResultsScreen.tsx`
- Create: `app/results.tsx`

**Interfaces:**
- Consumes: `useSession`, `Button`, `Icon`, `Screen`, `scoreWeek`, `useRouter`.
- Mirrors kit `ResultsScreen.jsx`: purple radial header (party-popper/thumbs-up by pass), headline (pass ≥ 80% → "Brilliant work!", ≥50% → "Good effort!", else "Keep going!"), `{correct}/{total}` big, per-word breakdown (check/rotate-ccw), "Practise again" (→ practice, reset index) + "Back home".

- [ ] **Step 1: Implement `src/screens/ResultsScreen.tsx`**

```tsx
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { useSession } from "../state/SessionContext";
import { scoreWeek } from "../lib/score";
import { theme } from "../theme/tokens";

export function ResultsScreen() {
  const router = useRouter();
  const { week, statuses, setIndex } = useSession();
  const { correct, total, passed } = scoreWeek(statuses);
  const headline = passed ? "Brilliant work!" : correct >= total / 2 ? "Good effort!" : "Keep going!";
  const sub = passed
    ? "You've mastered this week's words."
    : "Practise the tricky ones and try again — you're getting there.";

  return (
    <Screen style={{ maxWidth: theme.contentMax }}>
      <View style={styles.header}>
        <Icon name={passed ? "party-popper" : "thumbs-up"} size={40} color={theme.color.gold300} />
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sub}>{sub}</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{correct}</Text>
          <Text style={styles.scoreMax}> / {total}</Text>
        </View>
        <Text style={styles.scoreCaption}>words spelled correctly</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>THIS WEEK'S WORDS</Text>
        <View style={{ gap: 8 }}>
          {week.words.map((w, i) => {
            const ok = statuses[i] === "correct";
            return (
              <View key={i} style={styles.wordRow}>
                <View style={[styles.wordIcon, { backgroundColor: ok ? theme.color.successTint : theme.color.tryAgainTint }]}>
                  <Icon name={ok ? "check" : "rotate-ccw"} size={18} color={ok ? theme.color.successStrong : theme.color.tryAgainStrong} />
                </View>
                <Text style={styles.wordText}>{w.word}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" fullWidth onPress={() => { setIndex(0); router.replace("/practice"); }}
          icon={<Icon name="rotate-ccw" size={22} color="#fff" />}>
          Practise again
        </Button>
        <Button variant="secondary" size="md" fullWidth onPress={() => router.replace("/home")}>
          Back home
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24, paddingTop: 18, paddingBottom: 26, alignItems: "center",
    backgroundColor: theme.color.brand, borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headline: { fontFamily: theme.font.display.bold, fontSize: 32, color: "#fff", marginTop: 6 },
  sub: { fontFamily: theme.font.body.bold, fontSize: 15, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 280, marginTop: 6 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginTop: 18 },
  score: { fontFamily: theme.font.display.bold, fontSize: 56, color: "#fff" },
  scoreMax: { fontFamily: theme.font.display.semibold, fontSize: 26, color: theme.color.gold300 },
  scoreCaption: { fontFamily: theme.font.body.black, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  eyebrow: { fontFamily: theme.font.body.black, fontSize: 12, letterSpacing: 1, color: theme.color.textMuted, marginBottom: 10 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  wordIcon: { width: 30, height: 30, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  wordText: { fontFamily: theme.font.display.semibold, fontSize: 19, color: theme.color.textStrong, letterSpacing: 0.4 },
  actions: { gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 },
});
```

> The purple header should extend under the status bar. `Screen` already wraps in SafeAreaView; that's acceptable for v1. (A full-bleed header is a later polish.)

- [ ] **Step 2: Wire `app/results.tsx`**

```tsx
import { ResultsScreen } from "../src/screens/ResultsScreen";
export default function Results() {
  return <ResultsScreen />;
}
```

- [ ] **Step 3: Verify in Expo Go** — after finishing a test, headline + score + per-word ticks match outcomes; "Practise again"/"Back home" navigate. Commit.

```bash
git add src/screens/ResultsScreen.tsx app/results.tsx && git commit -m "feat: ResultsScreen + route"
```

---

## Task 26: WeekPicker + route

**Files:**
- Create: `src/screens/WeekPicker.tsx`
- Create: `app/weeks.tsx`

**Interfaces:**
- Consumes: `useSession`, `Card`, `Badge`, `Icon`, `Screen`, `weeks`, `currentWeekNumber`, `useRouter`.
- Mirrors kit `WeekPicker.jsx`: close (X → home), "Spelling weeks" title, subtitle, list of week cards (number chip, theme, "{n} words", "This week" badge on current, check on selected). Selecting a week calls `setWeekNumber(w)` (resets statuses) then → home.

- [ ] **Step 1: Implement `src/screens/WeekPicker.tsx`**

```tsx
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Icon } from "../components/Icon";
import { useSession } from "../state/SessionContext";
import { weeks, currentWeekNumber } from "../data/words";
import { theme } from "../theme/tokens";

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
                style={{ borderColor: isSelected ? theme.color.brand : theme.color.border, flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={[styles.num, { backgroundColor: isSelected ? theme.color.brand : theme.color.brandTint }]}>
                  <Text style={[styles.numText, { color: isSelected ? "#fff" : theme.color.brand }]}>{w.week}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.weekTheme}>{w.theme}</Text>
                  <Text style={styles.weekCount}>{w.words.length} words</Text>
                </View>
                {isCurrent && <Badge tone="success">This week</Badge>}
                {isSelected && !isCurrent && <Icon name="check" size={22} color={theme.color.brand} />}
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
  num: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  numText: { fontFamily: theme.font.display.bold, fontSize: 18 },
  weekTheme: { fontFamily: theme.font.display.semibold, fontSize: 18, color: theme.color.textStrong },
  weekCount: { fontFamily: theme.font.body.bold, fontSize: 13, color: theme.color.textMuted, marginTop: 2 },
});
```

- [ ] **Step 2: Wire `app/weeks.tsx`**

```tsx
import { WeekPicker } from "../src/screens/WeekPicker";
export default function Weeks() {
  return <WeekPicker />;
}
```

- [ ] **Step 3: Verify in Expo Go** — selecting a different week returns home and the Home card + Practice/Test now use that week (statuses reset). Commit.

```bash
git add src/screens/WeekPicker.tsx app/weeks.tsx && git commit -m "feat: WeekPicker + route"
```

---

## Task 27: Root layout — fonts, provider, splash, status bar

**Files:**
- Modify: `app/_layout.tsx`

**Interfaces:**
- Consumes: `fontMap` (Task 3), `SessionProvider` (Task 8).
- Produces: the wired app — fonts loaded, splash held until ready, SessionProvider mounted, Stack with cream background. This is the integration task.

- [ ] **Step 1: Implement `app/_layout.tsx`**

```tsx
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { fontMap } from "../src/theme/fonts";
import { SessionProvider } from "../src/state/SessionContext";
import { theme } from "../src/theme/tokens";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontMap);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.color.bg },
            animation: "fade",
          }}
        />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Ensure `expo-status-bar` is available** (ships with the template; install only if missing)

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null
node -e "require.resolve('expo-status-bar')" 2>/dev/null || npx expo install expo-status-bar
```

- [ ] **Step 3: Full run-through in Expo Go**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx expo start -c
```
Expected end-to-end: Welcome (Fredoka/Nunito fonts visible, candy buttons dip on press) → Let's practise → hear words, nav → segmented to Test → spell with tiles, gentle feedback, hint after 2 misses → All done → Results score + breakdown → Back home → Home card reflects results → week chip → WeekPicker → pick another week → Home/Practice now show that week.

- [ ] **Step 4: Run the full test suite once more**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npm test
```
Expected: all suites (tokens, words, tiles, score, smoke) pass.

- [ ] **Step 5: Commit**

```bash
git add app/_layout.tsx && git commit -m "feat: wire fonts, session provider, splash, status bar"
```

---

## Task 28: README + final tidy

**Files:**
- Create: `README.md` (project run instructions)
- Modify: `.gitignore` (ensure `node_modules`, `.expo` ignored — usually present from template)

- [ ] **Step 1: Write `README.md`**

```markdown
# Spell Master (v1)

A warm, offline spelling app for primary-school children — listen, practise, test.
React Native + Expo (SDK 54), runs in **Expo Go**.

## Run

```bash
nvm use 20.19.6        # SDK 54 needs Node 20+
npm install
npx expo start         # scan the QR with Expo Go
```

## Test

```bash
npm test               # pure logic: words, tiles, scoring, tokens
```

## Structure

- `app/` — expo-router routes (thin wrappers)
- `src/screens/` — screen UIs
- `src/components/` — design-system components (theme + StyleSheet)
- `src/theme/` — tokens + fonts
- `src/data/` — bundled word lists
- `src/lib/` — speech, tile bank, scoring
- `src/state/` — session context (week + test results)

See `docs/superpowers/specs/` and `prd.md` for scope.
```

- [ ] **Step 2: Commit**

```bash
git add README.md .gitignore && git commit -m "docs: project README"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Listen/practise (spec §5.3) → Task 23. Test loop incl. hint-after-2 (§5.4) → Task 24. Results/pass≥80% (§5.5) → Tasks 6, 25. Weekly switching (§5, PRD §4.3) → Tasks 4, 8, 26. Tokens (§3) → Task 2. Candy button (§6) → Task 10. TDD logic (§7) → Tasks 4–6. Fonts → Tasks 3, 27. Icons (Lucide) → Task 9. TTS (§2) → Task 7. Microcopy/a11y (§8) → embedded in component/screen tasks (accessibilityLabel, British copy, ≥56px targets). Out-of-scope (§9) → nothing added. ✓ No gaps.
- All six screens (Welcome, Home, Practice, Test, Results, WeekPicker) present (Tasks 21–26). ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✓

**Type consistency:** `Status` defined in Task 6, reused in Tasks 8/24/25. `IconName` from Task 9 used by all `Icon` consumers. `useSession()` shape (Task 8) matches all screen reads. `scoreWeek` return shape consistent across Tasks 6/22/25. `buildTileBank`/`shuffle` (Task 5) used in Task 24. Button/IconButton/Card/Badge prop names consistent between definition and screen usage. ✓

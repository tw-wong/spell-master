# Dictation Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sentence-level Dictation activity (listen → write the whole sentence → word-by-word grading with capitals/punctuation counting), reachable from a Home card, without touching the word-spelling flow.

**Architecture:** New pure grading module (`src/lib/dictation.ts`, TDD) + dictation data in `src/data/words.ts`; three new expo-router screens under `src/app/dictation/` that reuse existing design-system components; dictation session state added to `SessionContext`.

**Tech Stack:** React Native + Expo SDK 54, TypeScript, expo-router, expo-speech, lucide-react-native, jest-expo. Styling via `@/theme/tokens` + StyleSheet.

## Global Constraints

- **Node:** run every command under Node 20.19.6 — prefix shells with `source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null`.
- **Git identity is already set** to `tw-wong <13553048+tw-wong@users.noreply.github.com>` (repo config) — plain `git commit` attributes correctly. Work on branch `feature/dictation`.
- **British spelling**, encouraging voice, sentence case, no emoji. Copy is verbatim from the design kit.
- **Capitals & punctuation are part of the answer** — the test input uses `autoCapitalize="none"` + `autoCorrect={false}`.
- **No auto-speak on entering a screen** (matches current word screens); speech only on tap.
- **TTS:** `speak(text, rate?)` — en-GB, pitch 1.05; normal rate 0.85, Slower 0.55.
- **Pass threshold** for results = **≥ 80%**.
- **Source of truth** for layout/copy: `ui_kits/spell-master-app/DictationPractice.jsx`, `DictationTest.jsx`, `DictationResults.jsx`, `data.js` (already read into the spec).

---

## Task 1: Shared changes — speak rate, Badge (neutral + icon), Icon (ear/snail/type)

**Files:**
- Modify: `src/lib/speech.ts`
- Modify: `src/components/Badge.tsx`
- Modify: `src/components/Icon.tsx`

**Interfaces:**
- Produces: `speak(text: string, rate?: number)`; `Badge` prop `tone` gains `"neutral"` and new optional `icon?: ReactNode`; `IconName` gains `"ear" | "snail" | "type"`.

- [ ] **Step 1: Confirm the three lucide icons exist**

```bash
cd /Users/tengwai.wong/Repo/repo_tw/spell-master/node_modules/lucide-react-native
for n in Ear Snail Type; do grep -rho "\b$n\b" dist/lucide-react-native.d.ts | head -1; done
```
Expected: prints `Ear`, `Snail`, `Type`. (If any is missing, substitute: `snail`→`Turtle`, `type`→`CaseSensitive`, `ear`→`Headphones`, and adjust Step 4 accordingly.)

- [ ] **Step 2: Add optional rate to `src/lib/speech.ts`**

```ts
import * as Speech from "expo-speech";

export function speak(text: string, rate = 0.85): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: "en-GB", rate, pitch: 1.05 });
  } catch {
    // TTS is best-effort; never throw into the UI.
  }
}
```

- [ ] **Step 3: Extend `src/components/Badge.tsx`** (add `neutral` tone + `icon`; make the base a row)

```tsx
import { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

export function Badge({
  tone = "brand", color, bg, icon, children,
}: {
  tone?: "brand" | "success" | "solid" | "neutral";
  color?: string; bg?: string; icon?: ReactNode; children: ReactNode;
}) {
  const presets = {
    brand: { bg: theme.color.brandTint, fg: theme.color.brand },
    success: { bg: theme.color.successTint, fg: theme.color.successStrong },
    solid: { bg: "rgba(255,255,255,0.22)", fg: "#fff" },
    neutral: { bg: theme.color.sunken, fg: theme.color.textBody },
  }[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg ?? presets.bg }]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, { color: color ?? presets.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
    borderRadius: theme.radius.pill, paddingVertical: 6, paddingHorizontal: 12,
  },
  icon: { alignItems: "center", justifyContent: "center" },
  text: { fontFamily: theme.font.body.black, fontSize: 13 },
});
```

- [ ] **Step 4: Extend `src/components/Icon.tsx`** (add three glyphs to imports + MAP)

Change the import line to add `Ear, Snail, Type`:
```tsx
import {
  Volume2, RotateCcw, Play, ChevronLeft, ChevronRight, ChevronDown,
  Pencil, Lightbulb, PartyPopper, Delete, Check, X, ArrowRight,
  CalendarDays, Sparkles, ThumbsUp, Ear, Snail, Type,
} from "lucide-react-native";
```
Add to the `MAP` object (after `"thumbs-up": ThumbsUp,`):
```tsx
  ear: Ear, snail: Snail, type: Type,
```

- [ ] **Step 5: Typecheck**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
```
Expected: no output (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/lib/speech.ts src/components/Badge.tsx src/components/Icon.tsx
git commit -m "feat: speak rate arg, Badge neutral+icon, ear/snail/type icons"
```

---

## Task 2: Dictation data (TDD)

**Files:**
- Modify: `src/data/words.ts`
- Test: `src/data/dictation-data.test.ts`

**Interfaces:**
- Produces: `type DictationSentence = { text: string; focus: string }`; `getDictation(n: number): DictationSentence[]`; `hasDictation(n: number): boolean`; `dictationCount(n: number): number`.

- [ ] **Step 1: Write the failing test** `src/data/dictation-data.test.ts`

```ts
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
```

- [ ] **Step 2: Run it, expect FAIL** (`getDictation` not exported)

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx jest src/data/dictation-data.test.ts
```

- [ ] **Step 3: Append to `src/data/words.ts`** (after the existing `getWeek` export)

```ts
export type DictationSentence = { text: string; focus: string };

const DICTATION: Record<number, DictationSentence[]> = {
  12: [
    { text: "On Thursday, I go swimming.", focus: "Day names start with a capital letter." },
    { text: "We saw a beautiful rainbow.", focus: "Don't forget the full stop." },
    { text: "My friend has a new bike.", focus: "Start the sentence with a capital." },
  ],
  11: [
    { text: "The knight climbed the hill.", focus: "Silent letters: kn, mb." },
    { text: "Please listen to your teacher.", focus: "End with a full stop." },
  ],
};

export const getDictation = (n: number): DictationSentence[] => DICTATION[n] ?? DICTATION[12];
export const hasDictation = (n: number): boolean => !!DICTATION[n];
export const dictationCount = (n: number): number => DICTATION[n]?.length ?? 0;
```

- [ ] **Step 4: Run it, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx jest src/data/dictation-data.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/data/words.ts src/data/dictation-data.test.ts
git commit -m "feat: bundled dictation sentences + accessors"
```

---

## Task 3: Grading logic (TDD)

**Files:**
- Create: `src/lib/dictation.ts`
- Test: `src/lib/dictation.test.ts`

**Interfaces:**
- Produces: `type DictationStatus = "correct" | "wrong" | null`; `type GradedWord = { target: string; typed: string; ok: boolean }`; `type Grade = { exact: boolean; caseOnly: boolean; words: GradedWord[]; correctCount: number; total: number }`; `type DictationDetail = { answer: string; exact: boolean; caseOnly: boolean; correctCount: number; total: number }`; `tokens(text)`, `gradeSentence(target, answer): Grade`, `scoreDictation(statuses): { correct; total; pct; passed }`, `capMissCount(details): number`.

- [ ] **Step 1: Write the failing test** `src/lib/dictation.test.ts`

```ts
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
```

- [ ] **Step 2: Run it, expect FAIL** (`Cannot find module './dictation'`)

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx jest src/lib/dictation.test.ts
```

- [ ] **Step 3: Implement `src/lib/dictation.ts`**

```ts
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
```

- [ ] **Step 4: Run it, expect PASS**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx jest src/lib/dictation.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/dictation.ts src/lib/dictation.test.ts
git commit -m "feat: dictation grading (word-by-word, caseOnly, scoring)"
```

---

## Task 4: Dictation session state in SessionContext

**Files:**
- Modify: `src/state/SessionContext.tsx`

**Interfaces:**
- Consumes: `getDictation` (Task 2), `DictationStatus`, `DictationDetail` (Task 3).
- Produces: `useSession()` additionally returns `dictationIndex`, `setDictationIndex`, `dictationStatuses`, `setDictationStatuses`, `dictationDetails`, `setDictationDetails`, `resetDictation()`. `setWeekNumber` resets dictation state too.

- [ ] **Step 1: Replace `src/state/SessionContext.tsx` with the extended version**

```tsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { currentWeekNumber, getWeek, getDictation, Week } from "@/data/words";
import { Status } from "@/lib/score";
import { DictationStatus, DictationDetail } from "@/lib/dictation";

type Session = {
  weekNumber: number;
  week: Week;
  setWeekNumber: (n: number) => void;
  statuses: Status[];
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  dictationIndex: number;
  setDictationIndex: React.Dispatch<React.SetStateAction<number>>;
  dictationStatuses: DictationStatus[];
  setDictationStatuses: React.Dispatch<React.SetStateAction<DictationStatus[]>>;
  dictationDetails: (DictationDetail | null)[];
  setDictationDetails: React.Dispatch<React.SetStateAction<(DictationDetail | null)[]>>;
  resetDictation: () => void;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [weekNumber, setWeekNumberRaw] = useState(currentWeekNumber);
  const week = useMemo(() => getWeek(weekNumber), [weekNumber]);

  const [statuses, setStatuses] = useState<Status[]>(() => week.words.map(() => null));
  const [index, setIndex] = useState(0);

  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationStatuses, setDictationStatuses] = useState<DictationStatus[]>(
    () => getDictation(weekNumber).map(() => null),
  );
  const [dictationDetails, setDictationDetails] = useState<(DictationDetail | null)[]>(
    () => getDictation(weekNumber).map(() => null),
  );

  const resetDictation = useCallback(() => {
    const d = getDictation(weekNumber);
    setDictationStatuses(d.map(() => null));
    setDictationDetails(d.map(() => null));
    setDictationIndex(0);
  }, [weekNumber]);

  const setWeekNumber = useCallback((n: number) => {
    setWeekNumberRaw(n);
    setStatuses(getWeek(n).words.map(() => null));
    setIndex(0);
    const d = getDictation(n);
    setDictationStatuses(d.map(() => null));
    setDictationDetails(d.map(() => null));
    setDictationIndex(0);
  }, []);

  const value = useMemo(
    () => ({
      weekNumber, week, setWeekNumber,
      statuses, setStatuses, index, setIndex,
      dictationIndex, setDictationIndex,
      dictationStatuses, setDictationStatuses,
      dictationDetails, setDictationDetails,
      resetDictation,
    }),
    [weekNumber, week, setWeekNumber, statuses, index, dictationIndex, dictationStatuses, dictationDetails, resetDictation],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within SessionProvider");
  return v;
}
```

- [ ] **Step 2: Typecheck**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/state/SessionContext.tsx
git commit -m "feat: dictation session state (index/statuses/details/reset)"
```

---

## Task 5: Home Dictation card

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

**Interfaces:**
- Consumes: `hasDictation`, `dictationCount` (Task 2); `useRouter`; existing `Card`, `Icon`.

- [ ] **Step 1: Add the data imports to `src/screens/HomeScreen.tsx`**

Change the words import to include the dictation helpers:
```tsx
import { hasDictation, dictationCount } from "@/data/words";
```
(Add this line alongside the other `@/data`/`@/lib` imports near the top.)

- [ ] **Step 2: Render the card directly below the week `Card`**

Immediately AFTER the closing `</Card>` of the brand week card and BEFORE the `<View style={{ flex: 1 }} />` spacer, insert:
```tsx
      {hasDictation(week.week) && (
        <Pressable onPress={() => router.push("/dictation")}>
          <Card tone="paper" elevation="sm" style={styles.dictCard}>
            <View style={styles.dictIcon}>
              <Icon name="ear" size={22} color={theme.color.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dictTitle}>Dictation</Text>
              <Text style={styles.dictSub}>{dictationCount(week.week)} sentence{dictationCount(week.week) === 1 ? "" : "s"}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={theme.color.textMuted} />
          </Card>
        </Pressable>
      )}
```

- [ ] **Step 3: Add the styles** (append these keys to the existing `StyleSheet.create({...})` in HomeScreen)

```tsx
  dictCard: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 14 },
  dictIcon: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.color.brandTint, alignItems: "center", justifyContent: "center" },
  dictTitle: { fontFamily: theme.font.display.semibold, fontSize: 18, color: theme.color.textStrong },
  dictSub: { fontFamily: theme.font.body.bold, fontSize: 13, color: theme.color.textMuted, marginTop: 2 },
```

- [ ] **Step 4: Ensure `Pressable` is imported** in HomeScreen (it already imports `Pressable, Text, View, StyleSheet` from react-native — verify the line reads `import { Pressable, Text, View, StyleSheet } from "react-native";`).

- [ ] **Step 5: Typecheck**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
```
Expected: exit 0. (Typed routes for `/dictation` resolve after the route file exists in Task 6; if tsc flags the href now, proceed — it clears once Task 6 adds `app/dictation/index.tsx`. To keep this task self-contained you may run Task 6 Step 3 first, or temporarily cast `router.push("/dictation" as any)` and remove the cast after Task 6.)

- [ ] **Step 6: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: Home dictation card (shown when the week has dictation)"
```

---

## Task 6: DictationPractice screen + route

**Files:**
- Create: `src/screens/DictationPractice.tsx`
- Create: `src/app/dictation/index.tsx`

**Interfaces:**
- Consumes: `useSession` (dictationIndex/setDictationIndex), `getDictation`, `speak`, `tokens`, `TopBar`, `Screen`, `Card`, `Badge`, `Icon`, `IconButton`.
- Mirrors `DictationPractice.jsx`. No auto-speak on entry.

- [ ] **Step 1: Implement `src/screens/DictationPractice.tsx`**

```tsx
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { TopBar } from "./TopBar";
import { useSession } from "@/state/SessionContext";
import { getDictation } from "@/data/words";
import { tokens } from "@/lib/dictation";
import { speak } from "@/lib/speech";
import { theme } from "@/theme/tokens";

export function DictationPractice() {
  const router = useRouter();
  const { weekNumber, dictationIndex, setDictationIndex } = useSession();
  const sentences = getDictation(weekNumber);
  const item = sentences[dictationIndex];
  const last = sentences.length - 1;

  return (
    <Screen>
      <TopBar mode="practice"
        onMode={(m) => { setDictationIndex(0); router.replace(m === "test" ? "/dictation/test" : "/dictation"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Badge tone="brand" icon={<Icon name="ear" size={14} color={theme.color.brand} />}>Dictation</Badge>
          <Badge tone="neutral">Sentence {dictationIndex + 1} of {sentences.length}</Badge>
        </View>

        <Text style={styles.lead}>Listen, then tap any word to hear it</Text>

        <IconButton tone="brand" size="lg" label="Listen to the sentence" onPress={() => speak(item.text)}
          style={{ width: 104, height: 104, marginVertical: 4 }}>
          <Icon name="volume-2" size={46} color="#fff" />
        </IconButton>

        <Card tone="paper" elevation="sm" style={{ width: "100%" }}>
          <View style={styles.sentence}>
            {tokens(item.text).map((w, i) => (
              <Pressable key={i} onPress={() => speak(w.replace(/[^A-Za-z']/g, ""))}
                style={({ pressed }) => [styles.wordChip, pressed && { backgroundColor: theme.color.tint }]}>
                <Text style={styles.word}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={() => speak(item.text)} style={styles.pill}>
            <Icon name="rotate-ccw" size={17} color={theme.color.brand} />
            <Text style={styles.pillText}>Play again</Text>
          </Pressable>
          <Pressable onPress={() => speak(item.text, 0.55)} style={styles.pill}>
            <Icon name="snail" size={18} color={theme.color.brand} />
            <Text style={styles.pillText}>Slower</Text>
          </Pressable>
        </View>

        <View style={styles.focus}>
          <Icon name="lightbulb" size={18} color={theme.color.accentLedge} />
          <Text style={styles.focusText}>{item.focus}</Text>
        </View>
      </View>

      <View style={styles.nav}>
        <IconButton tone="soft" label="Previous sentence" disabled={dictationIndex === 0} onPress={() => setDictationIndex(Math.max(0, dictationIndex - 1))}>
          <Icon name="chevron-left" size={26} color={theme.color.brand} />
        </IconButton>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {sentences.map((_, i) => (
            <View key={i} style={{ width: i === dictationIndex ? 12 : 9, height: i === dictationIndex ? 12 : 9, borderRadius: 999, backgroundColor: i === dictationIndex ? theme.color.brand : theme.color.border }} />
          ))}
        </View>
        <IconButton tone="soft" label="Next sentence" disabled={dictationIndex === last} onPress={() => setDictationIndex(Math.min(last, dictationIndex + 1))}>
          <Icon name="chevron-right" size={26} color={theme.color.brand} />
        </IconButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  lead: { fontFamily: theme.font.body.bold, fontSize: 15, color: theme.color.textMuted, marginTop: 4 },
  sentence: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center" },
  wordChip: { paddingVertical: 2, paddingHorizontal: 4, borderRadius: 8 },
  word: { fontFamily: theme.font.display.semibold, fontSize: 30, color: theme.color.textStrong },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, height: 44, paddingHorizontal: 16, borderWidth: 2, borderColor: theme.color.border, backgroundColor: theme.color.card, borderRadius: 999 },
  pillText: { fontFamily: theme.font.body.black, fontSize: 14, color: theme.color.textBody },
  focus: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: theme.color.accentTint, borderWidth: 2, borderColor: "#FFEFC2", borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14, marginTop: 2 },
  focusText: { flexShrink: 1, fontFamily: theme.font.body.bold, fontSize: 13.5, color: theme.color.textBody },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 30 },
});
```

> Note: `theme.color.accentTint` and `theme.color.accentLedge` already exist in tokens. `"#FFEFC2"` is the kit's `--gold-100`.

- [ ] **Step 2: Create the route `src/app/dictation/index.tsx`**

```tsx
import { DictationPractice } from "@/screens/DictationPractice";

export default function DictationPracticeRoute() {
  return <DictationPractice />;
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
git add src/screens/DictationPractice.tsx src/app/dictation/index.tsx
git commit -m "feat: DictationPractice screen + /dictation route"
```

---

## Task 7: DictationTest screen + route

**Files:**
- Create: `src/screens/DictationTest.tsx`
- Create: `src/app/dictation/test.tsx`

**Interfaces:**
- Consumes: `useSession` (dictationIndex, dictationStatuses, dictationDetails + setters), `getDictation`, `gradeSentence`, `speak`, `TopBar`, `Screen`, `Button`, `IconButton`, `Icon`, `ProgressDots`, `FeedbackBanner`.
- Mirrors `DictationTest.jsx`. On finish → `/dictation/results`.

- [ ] **Step 1: Implement `src/screens/DictationTest.tsx`**

```tsx
import { useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { ProgressDots } from "@/components/ProgressDots";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { TopBar } from "./TopBar";
import { useSession } from "@/state/SessionContext";
import { getDictation } from "@/data/words";
import { gradeSentence, tokens } from "@/lib/dictation";
import { speak } from "@/lib/speech";
import { theme } from "@/theme/tokens";

export function DictationTest() {
  const router = useRouter();
  const {
    weekNumber, dictationIndex, setDictationIndex,
    dictationStatuses, setDictationStatuses, setDictationDetails,
  } = useSession();
  const sentences = getDictation(weekNumber);
  const item = sentences[dictationIndex];
  const target = item.text;
  const last = sentences.length - 1;

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);

  const grade = gradeSentence(target, answer);
  const typedWords = tokens(answer.trim());

  const check = () => {
    const g = gradeSentence(target, answer);
    const r = g.exact ? "correct" : "wrong";
    setResult(r);
    setDictationStatuses((s) => {
      const n = [...s];
      if (r === "correct") n[dictationIndex] = "correct";
      else if (n[dictationIndex] !== "correct") n[dictationIndex] = "wrong";
      return n;
    });
    setDictationDetails((d) => {
      const n = [...d];
      n[dictationIndex] = { answer, exact: g.exact, caseOnly: g.caseOnly, correctCount: g.correctCount, total: g.total };
      return n;
    });
  };
  const tryAgain = () => { setResult(null); setAnswer(""); };
  const advance = () => {
    if (dictationIndex < last) { setDictationIndex(dictationIndex + 1); setAnswer(""); setResult(null); }
    else router.replace("/dictation/results");
  };

  return (
    <Screen>
      <TopBar mode="test"
        onMode={(m) => { setDictationIndex(0); router.replace(m === "practice" ? "/dictation" : "/dictation/test"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <ProgressDots statuses={dictationStatuses.map((s, i) => (i === dictationIndex ? "current" : s ?? "upcoming")) as ("current" | "correct" | "wrong" | "upcoming")[]} />

        <View style={styles.listenRow}>
          <IconButton tone="brand" size="md" label="Hear the sentence" onPress={() => speak(target)}>
            <Icon name="volume-2" size={28} color="#fff" />
          </IconButton>
          <Text style={styles.linkBtn} onPress={() => speak(target)}>
            <Icon name="rotate-ccw" size={15} color={theme.color.textMuted} /> Again
          </Text>
          <Text style={styles.linkBtn} onPress={() => speak(target, 0.55)}>
            <Icon name="snail" size={17} color={theme.color.textMuted} /> Slower
          </Text>
        </View>

        <View style={styles.promptRow}>
          <Icon name="pencil" size={15} color={theme.color.textMuted} />
          <Text style={styles.prompt}>Write the sentence you hear</Text>
        </View>

        {result ? (
          <View style={{ width: "100%" }}>
            <Text style={styles.eyebrowMuted}>YOU WROTE</Text>
            <View style={styles.wroteBox}>
              {grade.words.map((w, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: w.ok ? theme.color.successTint : theme.color.tryAgainTint }]}>
                  <Text style={[styles.chipText, { color: w.ok ? theme.color.successStrong : theme.color.tryAgainStrong, textDecorationLine: w.ok ? "none" : "underline", textDecorationColor: theme.color.tryAgain }]}>
                    {w.typed || "—"}
                  </Text>
                </View>
              ))}
            </View>
            {result === "wrong" && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.eyebrowGreen}>THE SENTENCE IS</Text>
                <View style={styles.answerBox}>
                  {grade.words.map((w, i) => (
                    <View key={i} style={[styles.answerChip, !w.ok && { backgroundColor: "rgba(22,185,120,0.16)" }]}>
                      <Text style={styles.answerText}>{w.target}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            multiline
            placeholder="Tap here and start writing…"
            placeholderTextColor={theme.color.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            style={styles.input}
          />
        )}

        {result === "correct" && (
          <FeedbackBanner status="correct" title="Perfect sentence!" message="Capital letter and full stop — all correct."
            icon={<Icon name="party-popper" size={26} color={theme.color.successStrong} />} />
        )}
        {result === "wrong" && grade.caseOnly && (
          <FeedbackBanner status="hint" title="So close!" message="Check your capital letters and punctuation."
            icon={<Icon name="type" size={24} color={theme.color.accentLedge} />} />
        )}
        {result === "wrong" && !grade.caseOnly && (
          <FeedbackBanner status="try-again" title={`${grade.correctCount} of ${grade.total} words right`} message="Listen again and fix the underlined words."
            icon={<Icon name="rotate-ccw" size={24} color={theme.color.tryAgainStrong} />} />
        )}

        {!result && (
          <Text style={styles.counter}>{typedWords.length} word{typedWords.length === 1 ? "" : "s"} written</Text>
        )}
      </View>

      <View style={styles.actions}>
        {result ? (
          <>
            {result === "wrong" && (
              <IconButton tone="soft" label="Try again" onPress={tryAgain}>
                <Icon name="rotate-ccw" size={22} color={theme.color.brand} />
              </IconButton>
            )}
            <View style={{ flex: 1 }}>
              <Button variant="primary" size="lg" fullWidth onPress={advance} iconRight={<Icon name="arrow-right" size={22} color="#fff" />}>
                {dictationIndex < last ? "Next sentence" : "Finish"}
              </Button>
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Button variant="success" size="lg" fullWidth onPress={check} disabled={answer.trim().length === 0}>
              Check it
            </Button>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", paddingHorizontal: 22, gap: 12, paddingTop: 4 },
  listenRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  linkBtn: { fontFamily: theme.font.body.black, fontSize: 14, color: theme.color.textMuted },
  promptRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  prompt: { fontFamily: theme.font.body.bold, fontSize: 14, color: theme.color.textMuted },
  input: {
    width: "100%", minHeight: 118, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.lg,
    paddingHorizontal: 18, paddingVertical: 14, textAlignVertical: "top",
    fontFamily: theme.font.body.bold, fontSize: 21, lineHeight: 32, color: theme.color.textStrong, backgroundColor: theme.color.card,
  },
  eyebrowMuted: { fontFamily: theme.font.body.black, fontSize: 11, letterSpacing: 1, color: theme.color.textMuted, marginBottom: 6 },
  eyebrowGreen: { fontFamily: theme.font.body.black, fontSize: 11, letterSpacing: 1, color: theme.color.successStrong, marginBottom: 6 },
  wroteBox: { flexDirection: "row", flexWrap: "wrap", gap: 8, backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.lg, padding: 14 },
  chip: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8 },
  chipText: { fontFamily: theme.font.body.black, fontSize: 20 },
  answerBox: { flexDirection: "row", flexWrap: "wrap", gap: 8, backgroundColor: theme.color.successTint, borderWidth: 2, borderColor: "#C2F1DD", borderRadius: theme.radius.lg, padding: 14 },
  answerChip: { borderRadius: 6, paddingVertical: 1, paddingHorizontal: 5 },
  answerText: { fontFamily: theme.font.display.semibold, fontSize: 20, color: theme.color.successStrong },
  counter: { fontFamily: theme.font.body.bold, fontSize: 13, color: theme.color.textMuted },
  actions: { flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
});
```

> Notes: `linkBtn` uses `Text` with `onPress` (RN allows a nested `Icon` inside `Text`; if the inline icon misaligns on a device, that's cosmetic and acceptable for v1). `"#C2F1DD"` is the kit's `--green-100`. The action buttons use the `flex:1` wrapper pattern established for the word Test screen so they fill the row.

- [ ] **Step 2: Create the route `src/app/dictation/test.tsx`**

```tsx
import { DictationTest } from "@/screens/DictationTest";

export default function DictationTestRoute() {
  return <DictationTest />;
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
git add src/screens/DictationTest.tsx src/app/dictation/test.tsx
git commit -m "feat: DictationTest screen + /dictation/test route"
```

---

## Task 8: DictationResults screen + route

**Files:**
- Create: `src/screens/DictationResults.tsx`
- Create: `src/app/dictation/results.tsx`

**Interfaces:**
- Consumes: `useSession` (dictationStatuses, dictationDetails, resetDictation), `getDictation`, `scoreDictation`, `capMissCount`, `Screen`, `Button`, `Icon`.
- Mirrors `DictationResults.jsx`.

- [ ] **Step 1: Implement `src/screens/DictationResults.tsx`**

```tsx
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { getDictation } from "@/data/words";
import { scoreDictation, capMissCount } from "@/lib/dictation";
import { theme } from "@/theme/tokens";

export function DictationResults() {
  const router = useRouter();
  const { weekNumber, dictationStatuses, dictationDetails, resetDictation } = useSession();
  const sentences = getDictation(weekNumber);
  const { correct, total, passed } = scoreDictation(dictationStatuses);
  const caps = capMissCount(dictationDetails);

  const headline = passed ? "Super writing!" : correct >= total / 2 ? "Good effort!" : "Keep going!";
  const sub = passed
    ? "You spelled the sentences correctly."
    : caps > 0
      ? "Watch your capital letters and full stops."
      : "Listen carefully and try the tricky sentences again.";

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
        <Text style={styles.scoreCaption}>sentences written correctly</Text>
      </View>

      {caps > 0 && (
        <View style={styles.capChip}>
          <View style={styles.capIcon}><Icon name="type" size={20} color={theme.color.accentLedge} /></View>
          <Text style={styles.capText}>{caps} sentence{caps === 1 ? "" : "s"} just needed a capital letter or full stop.</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 16 }}>
        <Text style={styles.eyebrow}>YOUR SENTENCES</Text>
        <View style={{ gap: 8 }}>
          {sentences.map((s, i) => {
            const ok = dictationStatuses[i] === "correct";
            const d = dictationDetails[i];
            const capOnly = !!d && !d.exact && d.caseOnly;
            const iconName = ok ? "check" : capOnly ? "type" : "rotate-ccw";
            const tint = ok ? theme.color.successTint : capOnly ? theme.color.accentTint : theme.color.tryAgainTint;
            const fg = ok ? theme.color.successStrong : capOnly ? theme.color.accentLedge : theme.color.tryAgainStrong;
            return (
              <View key={i} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: tint }]}>
                  <Icon name={iconName} size={17} color={fg} />
                </View>
                <Text style={styles.rowText}>{s.text}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" fullWidth onPress={() => { resetDictation(); router.replace("/dictation"); }}
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
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 26, alignItems: "center", backgroundColor: theme.color.brand, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headline: { fontFamily: theme.font.display.bold, fontSize: 32, color: "#fff", marginTop: 6 },
  sub: { fontFamily: theme.font.body.bold, fontSize: 15, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 290, marginTop: 6 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginTop: 18 },
  score: { fontFamily: theme.font.display.bold, fontSize: 56, color: "#fff" },
  scoreMax: { fontFamily: theme.font.display.semibold, fontSize: 26, color: theme.color.gold300 },
  scoreCaption: { fontFamily: theme.font.body.black, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  capChip: { marginHorizontal: 24, marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.color.accentTint, borderWidth: 2, borderColor: "#FFEFC2", borderRadius: theme.radius.md, paddingVertical: 12, paddingHorizontal: 16 },
  capIcon: { width: 36, height: 36, borderRadius: 999, backgroundColor: "#FFEFC2", alignItems: "center", justifyContent: "center" },
  capText: { flexShrink: 1, fontFamily: theme.font.body.bold, fontSize: 14, color: theme.color.textBody },
  eyebrow: { fontFamily: theme.font.body.black, fontSize: 12, letterSpacing: 1, color: theme.color.textMuted, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  rowIcon: { width: 30, height: 30, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, fontFamily: theme.font.body.bold, fontSize: 15, color: theme.color.textStrong, lineHeight: 20 },
  footer: { gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 },
});
```

- [ ] **Step 2: Create the route `src/app/dictation/results.tsx`**

```tsx
import { DictationResults } from "@/screens/DictationResults";

export default function DictationResultsRoute() {
  return <DictationResults />;
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx tsc --noEmit
git add src/screens/DictationResults.tsx src/app/dictation/results.tsx
git commit -m "feat: DictationResults screen + /dictation/results route"
```

---

## Task 9: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && npx jest
```
Expected: all suites pass (existing 15 + dictation-data + dictation grading tests).

- [ ] **Step 2: Metro bundle check**

```bash
source ~/.nvm/nvm.sh && nvm use 20.19.6 >/dev/null && rm -rf /tmp/sm-dict && npx expo export --platform ios --output-dir /tmp/sm-dict 2>&1 | tail -4
```
Expected: `Exported: /tmp/sm-dict` (exit 0).

- [ ] **Step 3: Web run-through** (start `npx expo start --web -c`, then drive with the browser)

Verify end-to-end:
1. `/home` — the **Dictation · 3 sentences** card shows below the week card (week 12 has dictation).
2. Tap it → `/dictation` — Dictation/Sentence badges, Listen speaks the sentence, tapping a word speaks just that word, Slower works, focus hint shows.
3. Segmented → Test → `/dictation/test` — type `on thursday i go swimming` → Check → "So close!" caps hint + YOU WROTE chips; Try again; type the exact sentence → "Perfect sentence!" → Next sentence.
4. Finish the 3 sentences → `/dictation/results` — score X/3, gold cap chip if any caps-only miss, per-sentence icons; Practise again resets to `/dictation`; Back home works.
5. No auto-speak on entering `/dictation` or `/dictation/test` (word only plays on tap).

- [ ] **Step 4: Final commit (if any cleanup)**

```bash
git add -A && git commit -m "chore: dictation feature verified" --allow-empty
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Entry point / Home card (§2) → Task 5. Routes (§3) → Tasks 6–8. Data (§4) → Task 2. Grading `gradeSentence`/`scoreDictation`/`capMissCount` (§5) → Task 3. Session state (§6) → Task 4. Three screens (§7) → Tasks 6–8. speak rate / Badge / Icon (§8) → Task 1. RN adaptations — autoCapitalize none, bordered input, underline fallback (§9) → Task 7. Testing (§10) → Tasks 2, 3, 9. Out of scope (§11) → nothing touches the word flow. ✓ No gaps.

**Placeholder scan:** No TBD/TODO; every code step is complete; commands have expected output. The only conditional is Task 1 Step 1 (icon-existence check with a named fallback) and Task 5 Step 5 (typed-route ordering note) — both give explicit instructions, not placeholders. ✓

**Type consistency:** `DictationStatus`/`DictationDetail`/`Grade` defined in Task 3, consumed unchanged in Tasks 4/7/8. `getDictation`/`hasDictation`/`dictationCount`/`DictationSentence` from Task 2 used in Tasks 4–8. `gradeSentence`/`tokens`/`scoreDictation`/`capMissCount` signatures match between Task 3 and callers. `useSession()` dictation fields defined in Task 4 match every screen's usage. `speak(text, rate?)`, `Badge` `neutral`/`icon`, and `Icon` `ear`/`snail`/`type` from Task 1 are used consistently. ✓

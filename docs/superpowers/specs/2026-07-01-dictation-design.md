# Dictation Feature — Implementation Design

**Date:** 2026-07-01
**Owner:** TW
**Branch:** `feature/dictation`
**Source of truth:** Claude Design project "Spell Master Design System"
(`6f0ec147-1d4f-4147-880e-234659be806a`) — `ui_kits/spell-master-app/Dictation*.jsx`
+ `data.js`.

---

## 1. Goal

Add a **Dictation** activity to Spell Master. Some weeks dictate a whole sentence
(not a single word): the child hears a sentence, writes it, and is graded
word-by-word with **capital letters and punctuation counting**. Purely additive —
the existing word-spelling flow is untouched.

## 2. Entry point

- **Home** gains a tappable **Dictation card** below the Practise/Test actions,
  rendered **only when `hasDictation(currentWeek)`**. Shows an ear icon +
  "Dictation · N sentences" and navigates to `/dictation`.
- No other entry points. Weeks without dictation show no card.

## 3. Routes (expo-router, `src/app/`)

- `dictation/index.tsx` → DictationPractice (`/dictation`)
- `dictation/test.tsx` → DictationTest (`/dictation/test`)
- `dictation/results.tsx` → DictationResults (`/dictation/results`)

The existing `src/screens/TopBar.tsx` (Practise/Test segmented) is reused; in the
dictation context its two segments route to `/dictation` and `/dictation/test`.
Back navigates to `/home`.

## 4. Data (`src/data/words.ts`)

Add typed dictation data + accessors (mirrors the kit's `data.js`):

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

Capital letters and punctuation are part of the answer text.

## 5. Grading logic (pure, TDD) — `src/lib/dictation.ts`

```ts
export type GradedWord = { target: string; typed: string; ok: boolean };
export type Grade = { exact: boolean; caseOnly: boolean; words: GradedWord[]; correctCount: number; total: number };
export type DictationDetail = { answer: string; exact: boolean; caseOnly: boolean; correctCount: number; total: number };

export function tokens(text: string): string[];              // text.match(/[^\s]+/g) ?? []
export function gradeSentence(target: string, answer: string): Grade;
export function scoreDictation(statuses: DictationStatus[]): { correct; total; pct; passed };  // passed >= 80%
export function capMissCount(details: (DictationDetail | null)[]): number; // !exact && caseOnly
```

`gradeSentence` semantics (verbatim from the kit):
- `words[i].ok` = typed token exactly equals target token (case + punctuation sensitive).
- `exact` = `answer.trim().replace(/\s+/g," ")` === `target.trim()`.
- `caseOnly` = **not** exact, but equal after `toLowerCase()` + removing `.,!?` +
  whitespace-normalizing → i.e. only capitals/punctuation are wrong.
- `correctCount` = count of ok words; `total` = target token count.

`DictationStatus = "correct" | "wrong" | null`.

## 6. State — extend `SessionContext`

Add a parallel dictation session alongside the word session:
- `dictationIndex`, `setDictationIndex`
- `dictationStatuses: DictationStatus[]` (sized to `getDictation(weekNumber).length`)
- `dictationDetails: (DictationDetail | null)[]`
- `setDictationStatuses`, `setDictationDetails`
- On `setWeekNumber(n)`: reset dictation state (statuses/details sized to new week,
  index 0) **and** the existing word state.
- A `resetDictation()` helper (used by "Practise again").

## 7. Screens (`src/screens/`)

Port the three kit files to RN + theme/StyleSheet, reusing existing components
(Screen, Card, Badge, Button, IconButton, Icon, ProgressDots, FeedbackBanner, TopBar).

- **DictationPractice** — "Dictation" badge (ear) + "Sentence x of N" badge; "Listen,
  then tap any word to hear it"; 104px Listen button (speaks full sentence); a Card
  rendering each word as a tappable chip (tap → `speak(word-without-punct)`); Play
  again / **Slower** pills; gold focus-hint chip (`item.focus`); prev/next + dots.
  No auto-speak on entry (consistent with the word screens' current behaviour).
- **DictationTest** — ProgressDots; listen row (Hear / Again / Slower); "Write the
  sentence you hear"; **multiline `TextInput`** (bordered, `autoCapitalize="none"`,
  `autoCorrect={false}`), "N words written". On **Check it**: replace input with
  "YOU WROTE" chips (green if ok / coral + underline if wrong); if wrong also show
  "THE SENTENCE IS" with the target words (wrong ones highlighted). Feedback banner:
  correct → "Perfect sentence!"; wrong + caseOnly → hint "So close! Check your
  capital letters and punctuation."; wrong otherwise → "X of Y words right". Action
  bar: Check it → (Try-again IconButton if wrong) + Next sentence / Finish. Writes
  `dictationStatuses[index]` and `dictationDetails[index]`.
- **DictationResults** — purple header, headline (passed ≥80% "Super writing!",
  ≥half "Good effort!", else "Keep going!"), sub-line varies with `capMissCount`;
  X/N; gold chip "N sentence(s) just needed a capital letter or full stop" when
  `capMissCount > 0`; per-sentence list (icon: check=correct, type=capOnly,
  rotate-ccw=wrong); Practise again (reset + → `/dictation`) / Back home.

## 8. Shared component changes

- **`src/lib/speech.ts`** — `speak(text: string, rate = 0.85)`; Slower passes `0.55`.
- **`src/components/Badge.tsx`** — add `neutral` tone (ink-100 bg / ink-700 text) and
  optional `icon?: ReactNode` rendered before the label.
- **`src/components/Icon.tsx`** — add `ear` (Ear), `snail` (Snail), `type` (Type).

## 9. Deliberate RN adaptations

- Notebook lined-paper gradient → a plain bordered multiline `TextInput` (legible,
  no decorative rules). Approved.
- `autoCapitalize="none"` + `autoCorrect={false}` on the input — capitalization is
  graded, so the keyboard must not auto-fix it. Approved.
- Word chips / "YOU WROTE" / "THE SENTENCE IS" rendered as wrapped `Text`/`View`
  chips (no `textDecorationStyle: wavy` on Android — use a solid underline / coral
  colour fallback).

## 10. Testing

- **Unit (TDD)** `src/lib/dictation.test.ts`: `gradeSentence` exact match; caseOnly
  (e.g. "on thursday, i go swimming" vs "On Thursday, I go swimming."); a wrong-word
  case with correctCount; word-count mismatch (missing/extra words); `scoreDictation`
  thresholds (79/80/100); `capMissCount`.
- **Manual/web**: run on the web target — Home shows the Dictation card, practice
  tap-to-hear, test grading (perfect / caps-only / partial), results breakdown.

## 11. Out of scope

Word-spelling flow unchanged. No new backend, accounts, or persistence. Dictation
availability is per-week static data (weeks 11 & 12 only, per the design sample).

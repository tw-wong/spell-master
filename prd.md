# Spell Master — Product Requirements Document

**Status:** Draft v2 (scope simplified)
**Owner:** TW
**Last updated:** 2026-06-30

---

## 1. Overview

Spell Master is a mobile app that helps primary-school children learn their weekly spelling list. The school issues a fixed set of words each week across the school year. **In this first version the app does one thing well: let a child listen to and practise the week's words, then test themselves on them.**

The app is installed on the **parent's** device — the target children do not yet have their own phones.

Motivation features (points, avatar, streaks, leaderboard, badges) and anything that needs a backend or accounts are **deliberately out of scope for v1** and described in §6 as future work. Keep v1 small, offline, and shippable.

## 2. Goals

- Help students learn their weekly spelling words accurately.
- Make practising a single word as low-friction as possible: open app → hear word → practise → test.

### Success metrics (v1)

- % of weekly word lists where the student reaches a passing test score.
- Number of words practised / tested per session.

### Non-goals (v1)

- Points, rewards, avatar, streaks, leaderboard, badges, collective goals — **all deferred** (see §6).
- Accounts, classes, join codes, backend, leaderboard — **none in v1**; the app runs fully on-device.
- Teaching reading, grammar, or vocabulary beyond spelling.
- Notifications / reminders.

## 3. Users

- **Student (primary user):** A primary-school child, practising on a parent's phone. May not read fluently, so audio and visual cues matter.
- **Parent (account owner / gatekeeper):** Installs and opens the app. In v1 there is no account to manage.

## 4. Features (v1)

### 4.1 Practice page

- Displays the current week's words one at a time.
- A prominent **Listen** button pronounces the word aloud (text-to-speech) so the student can hear and learn it.
- The word can be replayed any number of times — no scoring, no pressure.
- Navigate forward/back through the week's list.
- Optional example sentence read aloud for context.

### 4.2 Test page

- The app says a word aloud; the student types the spelling.
- A replay button repeats the word.
- Immediate, encouraging feedback (correct / try again) rather than hard pass-fail.
- A hint appears after two incorrect attempts (first letter + length).
- Progress through the list is shown via dots.
- For younger children, consider a letter-tile entry mode (tap letters) as an alternative to typing.

### 4.3 Word-list data & weekly switching

- The full school-year list (one set of words per week, ~40 weeks) is **bundled with the app** as static, typed data — works offline, no hosting cost.
- The current week is **derived automatically from the date** so the correct list appears without anyone selecting it.
- Past and future weeks remain accessible so a child can **see and switch between each week's different spelling list** (e.g. catch up on a missed week or look ahead).
- Optional per-word fields: example sentence, definition, difficulty.
- Data access goes through helper functions (`getCurrentWeek()`, `getWeek(n)`) so the source can later be swapped from a static array to a fetched JSON file without changing screens.

## 5. Technical considerations

- **Platform:** React Native + Expo, TypeScript, expo-router, NativeWind. (Consistent with existing `spell-master-app` work.)
- **Text-to-speech:** `expo-speech` for v1 — offline, free, no API key. Pre-recorded or cloud TTS is a future quality upgrade.
- **Local data:** Word lists bundled on-device; the app functions with no signal. No backend, no accounts in v1.

## 6. Future work (after v1)

These were scoped out to keep the first version simple. Build only after the core learn + test loop is solid.

- **Points & rewards** — earn points for correct answers, spend in an avatar shop.
- **Avatar & evolution** — avatar that evolves with consistent practice.
- **Streaks & reminders** — track consecutive practice days; parent-facing daily reminder notifications. (Note the open question of how to fairly reward a student who masters the week early — see §7.)
- **Class leaderboard** — weekly, resettable, effort-based ranking shared within a single class. Opt-in by the parent; nickname / first-name-and-initial only.
- **Collective class goal** — a shared weekly target the whole class contributes to.
- **Badges** — recognition for habits, not just results.
- **Accounts & class join flow** — lightweight auth + join code (e.g. Supabase) to place a child on the right leaderboard.

Any feature in this list that involves shared scores, accounts, or children's data triggers the privacy obligations below — to be designed when those features are built, not in v1.

## 7. Privacy & child safety

This app is used by young children, which carries legal and ethical obligations (COPPA and similar regulations).

- **v1 collects no personal data** — fully on-device, no accounts, no network. This keeps the first version simple and low-risk.
- When future features (leaderboard, accounts) arrive: parent owns the account and consents; leaderboard participation is opt-in and private by default; display nickname or first name + last initial only — never full names or photos; collect the minimum data necessary; no open social features, messaging, or friend requests.

## 8. Open questions

- Should taking the test require practising the words first (practice-gating)?
- Typing vs letter-tile entry for the youngest users — which performs better in real use?
- What is the exact "passing" test score for a week?
- What calibrates "week 1," and how is the current week handled during school holidays (~40 weeks ≠ 52)?
- (Future) How do we fairly reward a student who masters the week early without punishing efficiency once streaks/leaderboard exist?

## 9. Phasing

- **Phase 1 (this version):** Practice, Test, bundled word lists with automatic + manual weekly switching. Single-device, offline, no backend, no accounts, no motivation features.
- **Phase 2:** Points, avatar + evolution, streaks, parent reminders. (Streaks/reminders need notifications; points/avatar can stay local.)
- **Phase 3:** Accounts, class join code, class leaderboard, collective goals, badges, parent dashboard, richer TTS. Requires backend.

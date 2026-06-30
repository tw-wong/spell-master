# Spell Master v1 — Implementation Design

**Date:** 2026-06-30
**Owner:** TW
**Source of truth:** `prd.md` (v1 scope) + Claude Design project "Spell Master Design System"
(`6f0ec147-1d4f-4147-880e-234659be806a`).

---

## 1. Goal

Build the Spell Master v1 mobile app from the existing design kit: a warm, "candy-toy"
spelling app for primary-school children. v1 loop is **listen → practise → test**, fully
offline, on a parent's phone. No points, streaks, avatars, leaderboards, accounts, backend,
or notifications (Phase 2/3 — explicitly excluded).

Runs in **Expo Go**.

## 2. Stack & tooling

- **React Native + Expo** (SDK 54 / latest), **TypeScript**, **expo-router** (file-based).
- **Node 20.19.6** via nvm (latest Expo SDK requires Node 20+; the machine's default 18.17
  is too old — select Node 20.19.6 for all Expo commands).
- **Styling:** typed theme module (`src/theme/tokens.ts`) + `StyleSheet`. No NativeWind.
  The PRD names NativeWind, but the design is CSS-variable-driven and ports more faithfully
  and with less config to a typed theme. (Documented divergence from PRD §5.)
- **Dependencies:**
  - `expo-speech` — text-to-speech (replaces web `speechSynthesis`).
  - `expo-router` — navigation.
  - `lucide-react-native` + `react-native-svg` — icons (design uses Lucide).
  - `@expo-google-fonts/fredoka`, `@expo-google-fonts/nunito`, `expo-font` — brand fonts.
- Package APIs (expo-router file layout, expo-speech options, font hook names) to be
  confirmed against current docs via Context7 immediately before implementation.

## 3. Design tokens (ported verbatim from the kit)

From `tokens/*.css`. Encoded as a typed TS object; semantic aliases preferred.

- **Colour:** Magic Purple brand `#7B61FF` (strong `#6444E6`, ledge `#4E32B8`); Sparkle Gold
  accent `#FFC53D`; Spell Green success `#16B978`; Coral try-again `#FF5E5E`; indigo-tinted
  ink neutrals (`#241B47` … `#E5E0F2`); cream bg `#FFFBF3`, white paper, lavender tint
  `#F3EFFF`. Each feedback colour ships a pale tint for banners.
- **Type:** Fredoka (display/headings/word/buttons), Nunito (body/labels, weight 600–800).
  Scale 12→64px; spelling word hero = 56px with `letterSpacing 0.06em`. Body never < 16px.
- **Spacing:** 4px grid; `screenPad 24`; content column max 420; tap targets — min 56,
  primary 72, letter tile 52.
- **Effects:** radii sm10/md16/lg24/xl32/pill999; soft indigo-tinted shadows
  (`rgba(36,27,71,…)`); the **candy button** = solid colour ledge `0 6px 0 <dark>` that
  shrinks to 2px and the button translates down on press. Motion bouncy
  (`cubic-bezier(0.34,1.56,0.64,1)`), durations 140–360ms, respects reduced-motion.

## 4. Architecture

```
src/
  theme/
    tokens.ts          colors, space, radius, shadow, type scale, motion
    fonts.ts           font family map + load hook wiring
  data/
    words.ts           typed WEEKS + getCurrentWeek() / getWeek(n) / currentWeekNumber
    words.test.ts      week-lookup behaviour
  lib/
    speech.ts          speak(text) — expo-speech, en-GB, rate .85, pitch 1.05, cancel prior
    tiles.ts           buildTileBank(word) + shuffle (pure)
    tiles.test.ts      bank contains every answer letter + 3 fillers; length correct
    score.ts           scoreWeek(statuses) -> { correct, total, pct, passed (>=80%) }
    score.test.ts      boundary cases (0, partial, 80% exactly, 100%)
  state/
    SessionContext.tsx weekNumber + statuses[]; resets statuses/index on week change
  components/
    Icon.tsx           lucide-react-native wrapper (stroke 2.4, size, color)
    Button.tsx         candy button: layered ledge View + Pressable, variants
                       primary|success|secondary|ghost, sizes lg(72)|md, fullWidth
    IconButton.tsx     round icon button, tones brand|soft, sizes lg|md
    Card.tsx           tones paper|brand|tint, elevations none|sm|lg, 2px border + shadow
    Badge.tsx          tones brand|solid|success
    ProgressBar.tsx    value/max, tones gold; rounded track
    ProgressDots.tsx   statuses: current|correct|wrong|upcoming
    FeedbackBanner.tsx status correct|try-again|hint; pop-in animation
    SegmentedControl.tsx  Practise/Test thumb with bouncy slide
    LetterSlots.tsx    answer slots; state active|correct|wrong
    LetterTile.tsx     tappable letter; used (greyed) state; press dip
  screens/             (screen bodies; routes are thin wrappers)
    WelcomeScreen, HomeScreen, PracticeScreen, TestScreen, ResultsScreen, WeekPicker
app/                   (expo-router)
  _layout.tsx          load fonts, mount SessionProvider, Stack
  index.tsx            → WelcomeScreen
  home.tsx  practice.tsx  test.tsx  results.tsx  weeks.tsx
assets/
  fonts (if bundling)  + logo mark (port logo-mark.svg or RN-SVG equivalent)
```

### Component boundaries
Each component takes explicit props mirroring the kit's React API (e.g. `Button` =
`variant`, `size`, `fullWidth`, `icon`/`iconRight`, `onPress`, `disabled`, `children`).
Screens compose components and own no visual primitives. `SessionContext` is the only
shared mutable state; everything else is pure props.

## 5. Data flow

1. `SessionProvider` holds `weekNumber` (default `currentWeekNumber`) and
   `statuses: (null|'correct'|'wrong')[]` sized to the current week's words.
2. Changing the week (WeekPicker) resets `statuses` and word index.
3. **Practice** reads `getWeek(weekNumber)`, speaks the word on index change, free replay,
   prev/next, example sentence playback. No scoring.
4. **Test** speaks the word, child spells via letter tiles (tap/backspace), `Check it`
   compares case-insensitively; correct → green + advance; wrong → coral try-again, and
   after 2 misses a hint (first letter + length). Writes result into `statuses`.
5. **Results** computes `scoreWeek(statuses)` → headline (pass ≥ 80%), per-word breakdown.

## 6. The candy button (only non-trivial native port)

`box-shadow: 0 6px 0 <dark>` has no StyleSheet equivalent. Reproduce with a wrapper View:
a darker "ledge" layer offset 6px behind, and a foreground `Pressable`. On `pressIn` the
foreground translates down (`translateY` 4px) and the visible ledge reduces to ~2px; on
`pressOut` it springs back (bouncy easing). Ghost/secondary variants are flat (no dip).
Soft card shadows use `shadowColor` `#241B47` + `shadowOpacity/Radius/Offset` (iOS) and
`elevation` (Android).

## 7. Testing strategy (TDD where logic is real)

Unit-test the pure logic first, then build UI against it:
- `data/words.test.ts` — `getWeek` returns the right week, falls back to current for unknown.
- `lib/tiles.test.ts` — bank includes each answer letter, adds 3 distinct fillers not in the
  word, total length = wordLen + 3, shuffled output is a permutation of inputs.
- `lib/score.test.ts` — correct/total/pct, `passed` at 79/80/100%.

Visual components and TTS are validated by running in **Expo Go** (manual), not unit tests —
RN visual output isn't meaningfully unit-tested here.

## 8. Microcopy & a11y (from the kit, preserved)

- British spelling ("practise", "favourite"); encouraging voice ("Great spelling!",
  "Almost — try again!"); sentence case; no emoji.
- Big touch targets (≥56px), high-contrast focus, accessible labels on icon buttons,
  reduced-motion honoured.

## 9. Out of scope (v1)

Points, rewards, avatars, streaks, leaderboards, badges, accounts, notifications, backend,
parent dashboard, letter-tile-vs-typing toggle (kit ships letter-tiles only). These are
Phase 2/3 and absent from both the PRD v1 and the design kit.

## 10. Open implementation questions (resolve during build, non-blocking)

- Bundle the two `.woff2` fonts from the kit, or pull TTF via `@expo-google-fonts/*`?
  Default: google-fonts packages (TTF, Expo-friendly). Fall back to bundling if a weight
  is missing.
- Logo mark: port `assets/logo-mark.svg` directly via `react-native-svg`, or re-draw as a
  small component. Default: render the SVG via `react-native-svg`.
- "Current week from date" is fixed to Week 12 in the kit's `data.js`; v1 keeps a fixed
  `CURRENT_INDEX` (date-derivation is a later enhancement, per PRD open questions).

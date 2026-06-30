# Spell Master (v1)

A warm, offline spelling app for primary-school children — **listen, practise, test**.
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

- `src/app/` — expo-router routes (thin wrappers): `index` (welcome), `home`, `practice`, `test`, `results`, `weeks`
- `src/screens/` — screen UIs
- `src/components/` — design-system components (typed theme + StyleSheet)
- `src/theme/` — tokens + font map
- `src/data/` — bundled word lists (`getCurrentWeek` / `getWeek`)
- `src/lib/` — speech (expo-speech), tile bank, scoring
- `src/state/` — session context (selected week + test results)

## Design & scope

The visual language (Magic Purple brand, Fredoka/Nunito type, candy buttons, Lucide
icons) is ported from the "Spell Master Design System" Claude Design project. v1 is
deliberately limited to listen → practise → test with on-device weekly word lists; no
accounts, points, streaks, leaderboards, or backend. See `prd.md`,
`docs/superpowers/specs/`, and `docs/superpowers/plans/` for full scope and the
implementation plan.

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
    accentTint: palette.gold50,
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

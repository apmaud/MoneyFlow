import { createTheme } from "@mui/material/styles";


// Used Claude for Design, I have no design eye
// ---------------------------------------------------------------------------
// Design tokens
// Palette: 3 main colors — lavender (interactive), plum (ink/contrast),
// lilac mist (surfaces) — plus muted, harmonized semantic colors.
// Type: Fraunces (display, characterful serif) + Plus Jakarta Sans (UI/body)
// + IBM Plex Mono reserved specifically for currency figures, so balances
// line up on tabular numerals instead of being purely decorative.
// ---------------------------------------------------------------------------


const tokens = {
  lavender: "#7C6FBE",
  lavenderDark: "#5F51A6",
  lavenderLight: "#A79EDA",
  plum: "#2E2447",
  plumSoft: "#463A66",
  mist: "#F4F1FB",
  mistDeep: "#E9E4F7",
  white: "#FFFFFF",
  success: "#4C9A6B",
  successMist: "#E5F3EA",
  error: "#C24B5E",
  errorMist: "#FBE9EC",
  warning: "#C98A3E",
  warningMist: "#FBF1E3",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: tokens.lavender,
      dark: tokens.lavenderDark,
      light: tokens.lavenderLight,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: tokens.plum,
      light: tokens.plumSoft,
      contrastText: "#FFFFFF",
    },
    background: {
      default: tokens.mist,
      paper: tokens.white,
    },
    text: {
      primary: tokens.plum,
      secondary: "#6B6280",
    },
    success: { main: tokens.success },
    error: { main: tokens.error },
    warning: { main: tokens.warning },
    divider: tokens.mistDeep,
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    h1: { fontFamily: "'Fraunces', serif", fontWeight: 600, letterSpacing: "-0.01em" },
    h2: { fontFamily: "'Fraunces', serif", fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h4: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h5: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingLeft: 20, paddingRight: 20 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.mistDeep}`,
          boxShadow: "none",
        },
      },
    },
  },
});

// Reusable style hook for anywhere a currency figure is displayed, so every
// balance/amount in the app renders with the same tabular-numeral treatment.
export const moneyFontSx = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontVariantNumeric: "tabular-nums",
};

export const brandTokens = tokens;

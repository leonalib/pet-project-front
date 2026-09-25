import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#284b63', dark: '#1d384c' },
    secondary: { main: '#ab405c' },
    background: { default: '#f1f5f8', paper: '#ffffff' },
    text: { primary: '#203648', secondary: '#536575' },
    divider: '#dbe4eb',
    success: { main: '#37684e' },
  },
  typography: {
    fontFamily: '"Golos Text", sans-serif',
    h1: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400 },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.035em' },
    h3: { fontSize: '1.15rem', fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.65 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingInline: 20,
          '&.Mui-focusVisible': { outline: '3px solid #ab405c', outlineOffset: 3 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#fcfdff', borderRadius: 8 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #dbe4eb' } },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
        '*': { boxSizing: 'border-box' },
        '::selection': { backgroundColor: '#d5e2eb' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
  },
})

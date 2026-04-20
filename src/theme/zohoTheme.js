import { createTheme } from '@mui/material/styles'

/**
 * Zoho-inspired MUI theme.
 * Palette loosely follows Zoho CRM: cool-blue primary, neutral grays,
 * medium-density typography, subtle shadows, 6-8px corner radii.
 */
export const zohoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a6dd8',
      light: '#4b8fe8',
      dark: '#134f9b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2b3544',
      light: '#4a5568',
      dark: '#1a202c',
      contrastText: '#ffffff',
    },
    success: { main: '#0f9d58' },
    warning: { main: '#ef6c00' },
    error: { main: '#d93025' },
    info: { main: '#408dfb' },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2b3544',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontSize: 22, fontWeight: 600, letterSpacing: '-0.005em' },
    h3: { fontSize: 18, fontWeight: 600 },
    h4: { fontSize: 16, fontWeight: 600 },
    h5: { fontSize: 14, fontWeight: 600 },
    h6: { fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' },
    body1: { fontSize: 14, lineHeight: 1.55 },
    body2: { fontSize: 13, lineHeight: 1.5 },
    caption: { fontSize: 12, color: '#64748b' },
    button: { fontSize: 14, fontWeight: 500, textTransform: 'none', letterSpacing: 0 },
  },
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.06)',
    '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
    '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
    '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
    ...Array(20).fill('0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)'),
  ],
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, paddingInline: 14, paddingBlock: 7, fontWeight: 500 },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 1px 3px rgba(26, 109, 216, 0.3)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1a6dd8',
            borderWidth: 1,
          },
        },
        input: { padding: '9px 12px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 13, color: '#64748b' } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: { padding: 2 },
      },
    },
  },
})

import { createContext, PropsWithChildren, useContext } from 'react';
import { Platform } from 'react-native';

const shadow = {
  sm: Platform.OS === 'web'
    ? {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
      }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      },
  md: Platform.OS === 'web'
    ? {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03)',
      }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 4,
      },
  lg: Platform.OS === 'web'
    ? {
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03)',
      }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
        elevation: 8,
      },
  xl: Platform.OS === 'web'
    ? {
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.06), 0 10px 10px rgba(0, 0, 0, 0.04)',
      }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.06,
        shadowRadius: 32,
        elevation: 12,
      },
} as const;

export const theme = {
  colors: {
    brand: {
      grubRed: '#800020',
      red500: '#9a0030',
      red600: '#800020',
      red700: '#660019',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      500: '#9a0030',
      600: '#800020',
      700: '#660019',
    },
    orange: {
      100: '#ffedd5',
      200: '#fed7aa',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
    },
    green: {
      100: '#dcfce7',
      600: '#16a34a',
      800: '#166534',
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      400: '#60a5fa',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    yellow: {
      100: '#fef9c3',
      300: '#fde047',
      400: '#facc15',
      800: '#854d0e',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    text: {
      primary: '#213547',
      heading: '#111827',
      body: '#4b5563',
      muted: '#6b7280',
      inverse: '#ffffff',
      brand: '#800020',
    },
    background: {
      app: '#fff5f5',
      page: '#ffffff',
      subtle: '#f9fafb',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    border: {
      light: '#f3f4f6',
      default: '#e5e7eb',
      strong: '#d1d5db',
      brand: '#800020',
    },
    white: '#ffffff',
    black: '#000000',
  },
  spacing: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
  },
  radius: {
    none: 0,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },
  typography: {
    fontFamily: {
      system: 'System',
      webFallback: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 20,
      snug: 22,
      base: 24,
      relaxed: 28,
      heading: 36,
    },
  },
  shadow,
  layout: {
    mobileHeaderHeight: 56,
    desktopHeaderHeight: 64,
    bottomNavHeight: 72,
    maxContentWidth: 1280,
  },
} as const;

type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
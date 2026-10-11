import { Platform } from 'react-native';

export type ColorTheme = 'light' | 'dark';

export const ThemeColors = {
  light: {
    background: '#FBFBFA',
    surface: '#FFFFFF',
    surfaceSubtle: '#F4F4F2',
    surfaceHover: '#ECECE8',
    textPrimary: '#2C2C2A',
    textSecondary: '#70706C',
    textMuted: '#9B9B96',
    border: '#E5E5E0',
    borderSubtle: '#ECECE7',
    accent: '#1A1A18',
    accentText: '#FBFBFA',
    accentMuted: '#DCDCD6',
    cardShadow: 'rgba(0, 0, 0, 0.04)',
    
    statusReading: '#8B6D4C',
    statusReadingBg: '#F5EFEA',
    statusReadingBorder: '#E5D6C7',
    
    statusRead: '#5A735E',
    statusReadBg: '#EFF4F0',
    statusReadBorder: '#CAD9CD',
    
    statusWant: '#6D6875',
    statusWantBg: '#F3F0F4',
    statusWantBorder: '#D8D3DC',
    
    error: '#9E4738',
    errorBg: '#F9ECE9',
    errorBorder: '#E8C5BE',
    
    success: '#5A735E',
    successBg: '#EFF4F0',
    successBorder: '#CAD9CD',
    
    tagBg: '#F4F4F2',
    tagText: '#2C2C2A',
    
    tabBarBg: '#FBFBFA',
    tabBarBorder: '#E5E5E0',
    tabBarActive: '#1A1A18',
    tabBarInactive: '#9B9B96',
  },
  dark: {
    background: '#161615',
    surface: '#1E1E1C',
    surfaceSubtle: '#252522',
    surfaceHover: '#2E2E2A',
    textPrimary: '#F0F0EE',
    textSecondary: '#9E9E9A',
    textMuted: '#686864',
    border: '#2A2A28',
    borderSubtle: '#333330',
    accent: '#F0F0EE',
    accentText: '#161615',
    accentMuted: '#383834',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    statusReading: '#D0A87B',
    statusReadingBg: '#2C241B',
    statusReadingBorder: '#473A2B',
    
    statusRead: '#8FAFA0',
    statusReadBg: '#1B261E',
    statusReadBorder: '#2D3E32',
    
    statusWant: '#A89DB0',
    statusWantBg: '#252229',
    statusWantBorder: '#3C3742',
    
    error: '#CF7667',
    errorBg: '#2E1E1B',
    errorBorder: '#4A2E29',
    
    success: '#8FAFA0',
    successBg: '#1B261E',
    successBorder: '#2D3E32',
    
    tagBg: '#252522',
    tagText: '#F0F0EE',
    
    tabBarBg: '#161615',
    tabBarBorder: '#2A2A28',
    tabBarActive: '#F0F0EE',
    tabBarInactive: '#686864',
  },
} as const;

export type ThemePalette = {
  [K in keyof typeof ThemeColors.light]: string;
};

export const Typography = {
  h1: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  captionMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as const,
  },
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
};

export const Colors = {
  light: {
    text: ThemeColors.light.textPrimary,
    background: ThemeColors.light.background,
    backgroundElement: ThemeColors.light.surfaceSubtle,
    backgroundSelected: ThemeColors.light.surfaceHover,
    textSecondary: ThemeColors.light.textSecondary,
  },
  dark: {
    text: ThemeColors.dark.textPrimary,
    background: ThemeColors.dark.background,
    backgroundElement: ThemeColors.dark.surfaceSubtle,
    backgroundSelected: ThemeColors.dark.surfaceHover,
    textSecondary: ThemeColors.dark.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

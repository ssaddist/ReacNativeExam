import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { safeStorage } from '@/services/storage';
import { ThemeColors, ColorTheme, ThemePalette } from '@/constants/theme';

interface ThemeContextType {
  theme: ColorTheme;
  colors: ThemePalette;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ColorTheme) => void;
}

const THEME_STORAGE_KEY = '@bookshelf_theme_v1';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: ThemeColors.light,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ColorTheme>('light');

  useEffect(() => {
    safeStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'dark' || stored === 'light') {
          setThemeState(stored);
        } else if (systemScheme === 'dark') {
          setThemeState('dark');
        }
      })
      .catch(() => {});
  }, [systemScheme]);

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    safeStorage.setItem(THEME_STORAGE_KEY, newTheme).catch(() => {});
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const colors = ThemeColors[theme];
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

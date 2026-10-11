import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { safeStorage } from '@/services/storage';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { BookShelfProvider } from '@/context/BookShelfContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

const ONBOARDING_KEY = '@bookshelf_onboarded_v1';

function RootNavigation() {
  const { isDark } = useAppTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await safeStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
          setTimeout(() => {
            router.replace('/onboarding');
          }, 0);
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    checkOnboarding();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="book/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="book/[id]/add-note"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BookShelfProvider>
        <RootNavigation />
      </BookShelfProvider>
    </ThemeProvider>
  );
}

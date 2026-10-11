import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { safeStorage } from '@/services/storage';
import { useAppTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { ScaleButton } from '@/components/ScaleButton';

const ONBOARDING_KEY = '@bookshelf_onboarded_v1';

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'library-outline',
    title: 'Книжкова полиця',
    subtitle: 'Ваш особистий простір для читання',
    description:
      'Організуйте свої книги за полицями: «Читаю», «Хочу прочитати» та «Прочитано». Зручно, спокійно та без зайвого шуму.',
  },
  {
    icon: 'search-outline',
    title: 'Каталог Open Library',
    subtitle: 'Мільйони видань під рукою',
    description:
      'Знаходьте улюблені книги за назвою або автором, досліджуйте описи, обкладинки та додавайте їх до власної полиці в один дотик.',
  },
  {
    icon: 'create-outline',
    title: 'Прогрес та нотатки',
    subtitle: 'Зберігайте думки та цитати',
    description:
      'Фіксуйте прочитані сторінки, залишайте особисті спостереження до кожного розділу та відстежуйте свій читацький шлях.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await safeStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    router.replace('/(tabs)');
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          {!isLast && (
            <ScaleButton onPress={handleComplete} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                Пропустити
              </Text>
            </ScaleButton>
          )}
        </View>

        <View style={styles.content}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}>
            <Ionicons name={slide.icon} size={48} color={colors.textPrimary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {slide.title}
          </Text>

          <Text style={[styles.subtitle, { color: colors.statusReading }]}>
            {slide.subtitle}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {slide.description}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === currentSlide ? colors.accent : colors.border,
                    width: i === currentSlide ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <ScaleButton
            onPress={handleNext}
            style={[styles.nextButton, { backgroundColor: colors.accent }]}>
            <Text style={[styles.nextButtonText, { color: colors.accentText }]}>
              {isLast ? 'Почати читати' : 'Далі'}
            </Text>
            <Ionicons
              name={isLast ? 'checkmark-outline' : 'arrow-forward-outline'}
              size={18}
              color={colors.accentText}
              style={styles.btnIcon}
            />
          </ScaleButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    ...Typography.body,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  iconWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: Radii.xl,
  },
  nextButtonText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  btnIcon: {
    marginLeft: 8,
  },
});

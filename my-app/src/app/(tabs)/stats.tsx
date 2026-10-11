import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useBookShelf } from '@/context/BookShelfContext';
import { Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import { ProgressBar } from '@/components/ProgressBar';
import { ScaleButton } from '@/components/ScaleButton';

export default function StatsScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { stats, goals, updateGoals, books } = useBookShelf();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goalBooksInput, setGoalBooksInput] = useState(goals.targetBooks.toString());
  const [goalPagesInput, setGoalPagesInput] = useState(goals.targetPagesMonth.toString());
  const [goalError, setGoalError] = useState<string | null>(null);

  useEffect(() => {
    setGoalBooksInput(goals.targetBooks.toString());
    setGoalPagesInput(goals.targetPagesMonth.toString());
  }, [goals.targetBooks, goals.targetPagesMonth]);

  const booksGoalProgress =
    goals.targetBooks > 0 ? Math.min(stats.readCount / goals.targetBooks, 1) : 0;

  const handleSaveGoals = () => {
    const numBooks = parseInt(goalBooksInput.trim(), 10);
    const numPages = parseInt(goalPagesInput.trim(), 10);

    if (isNaN(numBooks) || numBooks <= 0) {
      setGoalError('Річна мета книг має бути додатним числом (наприклад, 12)');
      return;
    }

    if (isNaN(numPages) || numPages <= 0) {
      setGoalError('Місячна мета сторінок має бути додатним числом (наприклад, 300)');
      return;
    }

    setGoalError(null);
    updateGoals({ targetBooks: numBooks, targetPagesMonth: numPages });
    setIsEditingGoals(false);
  };

  const favoriteBooksCount = books.filter((b) => b.isFavorite).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Читацький щоденник
          </Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Статистика та цілі
          </Text>
        </View>

        <View style={styles.grid}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? Shadows.cardDark : Shadows.card,
            ]}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.statusReadBg,
                  borderColor: colors.statusReadBorder,
                },
              ]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.statusRead}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats.readCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Прочитано книг
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? Shadows.cardDark : Shadows.card,
            ]}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.statusReadingBg,
                  borderColor: colors.statusReadingBorder,
                },
              ]}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.statusReading}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats.readingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Зараз читаю
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? Shadows.cardDark : Shadows.card,
            ]}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                },
              ]}>
              <Ionicons
                name="book-outline"
                size={20}
                color={colors.textPrimary}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats.totalPagesRead}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Прочитано сторінок
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? Shadows.cardDark : Shadows.card,
            ]}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.statusWantBg,
                  borderColor: colors.statusWantBorder,
                },
              ]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.statusWant}
              />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {stats.totalNotesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Особистих нотаток
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isDark ? Shadows.cardDark : Shadows.card,
          ]}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={colors.statusReading}
                style={styles.sectionIcon}
              />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Річна мета читання
              </Text>
            </View>

            <ScaleButton
              onPress={() => {
                setIsEditingGoals(!isEditingGoals);
                setGoalError(null);
              }}
              style={styles.editBtn}>
              <Ionicons
                name={isEditingGoals ? 'close' : 'create-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </ScaleButton>
          </View>

          {isEditingGoals ? (
            <View style={styles.goalEditForm}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Скільки книг прочитати за рік:
              </Text>
              <TextInput
                value={goalBooksInput}
                onChangeText={setGoalBooksInput}
                keyboardType="number-pad"
                style={[
                  styles.goalInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.textSecondary, marginTop: Spacing.sm },
                ]}>
                Місячна ціль сторінок:
              </Text>
              <TextInput
                value={goalPagesInput}
                onChangeText={setGoalPagesInput}
                keyboardType="number-pad"
                style={[
                  styles.goalInput,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              {goalError && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {goalError}
                </Text>
              )}

              <ScaleButton
                onPress={handleSaveGoals}
                style={[
                  styles.saveGoalBtn,
                  { backgroundColor: colors.accent },
                ]}>
                <Text
                  style={[
                    styles.saveGoalBtnText,
                    { color: colors.accentText },
                  ]}>
                  Зберегти цілі
                </Text>
              </ScaleButton>
            </View>
          ) : (
            <View style={styles.goalDisplay}>
              <View style={styles.goalProgressInfo}>
                <Text style={[styles.goalRatio, { color: colors.textPrimary }]}>
                  {stats.readCount} з {goals.targetBooks} книг
                </Text>
                <Text
                  style={[
                    styles.goalPercent,
                    { color: colors.statusReading },
                  ]}>
                  {Math.round(booksGoalProgress * 100)}%
                </Text>
              </View>

              <ProgressBar
                progress={booksGoalProgress}
                height={8}
                color={colors.statusReading}
              />

              <Text
                style={[
                  styles.goalHint,
                  { color: colors.textSecondary },
                ]}>
                Залишилося прочитати {Math.max(goals.targetBooks - stats.readCount, 0)}{' '}
                книг для досягнення річної мети.
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isDark ? Shadows.cardDark : Shadows.card,
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Огляд бібліотеки
          </Text>

          <View style={styles.overviewRow}>
            <View style={styles.overviewLeft}>
              <Ionicons
                name="heart-outline"
                size={18}
                color={colors.error}
                style={styles.overviewIcon}
              />
              <Text
                style={[styles.overviewLabel, { color: colors.textPrimary }]}>
                Улюблені книги
              </Text>
            </View>
            <Text
              style={[styles.overviewValue, { color: colors.textSecondary }]}>
              {favoriteBooksCount}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.overviewRow}>
            <View style={styles.overviewLeft}>
              <Ionicons
                name="bookmark-outline"
                size={18}
                color={colors.statusWant}
                style={styles.overviewIcon}
              />
              <Text
                style={[styles.overviewLabel, { color: colors.textPrimary }]}>
                В списку бажаного
              </Text>
            </View>
            <Text
              style={[styles.overviewValue, { color: colors.textSecondary }]}>
              {stats.wantToReadCount}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.overviewRow}>
            <View style={styles.overviewLeft}>
              <Ionicons
                name="library-outline"
                size={18}
                color={colors.textPrimary}
                style={styles.overviewIcon}
              />
              <Text
                style={[styles.overviewLabel, { color: colors.textPrimary }]}>
                Загалом на всіх полицях
              </Text>
            </View>
            <Text
              style={[styles.overviewValue, { color: colors.textSecondary }]}>
              {stats.totalBooks}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isDark ? Shadows.cardDark : Shadows.card,
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Налаштування
          </Text>

          <ScaleButton onPress={toggleTheme}>
            <View style={styles.themeToggleRow}>
              <View style={styles.themeToggleLeft}>
                <Ionicons
                  name={isDark ? 'moon-outline' : 'sunny-outline'}
                  size={20}
                  color={colors.textPrimary}
                  style={styles.themeIcon}
                />
                <View>
                  <Text
                    style={[styles.themeLabel, { color: colors.textPrimary }]}>
                    Тема оформлення
                  </Text>
                  <Text
                    style={[styles.themeSub, { color: colors.textSecondary }]}>
                    {isDark ? 'Темна (Soft Charcoal)' : 'Світла (Warm Ivory)'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.themePill,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={14}
                  color={colors.textPrimary}
                />
                <Text
                  style={[styles.themePillText, { color: colors.textPrimary }]}>
                  {isDark ? 'Темна' : 'Світла'}
                </Text>
              </View>
            </View>
          </ScaleButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerSubtitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.h1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h2,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
  },
  sectionCard: {
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 17,
  },
  editBtn: {
    padding: 6,
  },
  goalDisplay: {
    gap: Spacing.xs,
  },
  goalProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalRatio: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  goalPercent: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  goalHint: {
    ...Typography.caption,
    marginTop: 6,
  },
  goalEditForm: {
    gap: Spacing.xs,
  },
  inputLabel: {
    ...Typography.caption,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Typography.body,
  },
  errorText: {
    ...Typography.caption,
    marginTop: 4,
  },
  saveGoalBtn: {
    paddingVertical: 10,
    borderRadius: Radii.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveGoalBtnText: {
    ...Typography.bodyMedium,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIcon: {
    marginRight: 10,
  },
  overviewLabel: {
    ...Typography.body,
  },
  overviewValue: {
    ...Typography.bodyMedium,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  themeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 12,
  },
  themeLabel: {
    ...Typography.bodyMedium,
  },
  themeSub: {
    ...Typography.caption,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 6,
  },
  themePillText: {
    ...Typography.caption,
    fontWeight: '500',
  },
});

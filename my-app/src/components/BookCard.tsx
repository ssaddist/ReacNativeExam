import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Book } from '@/types/book';
import { useAppTheme } from '@/context/ThemeContext';
import { useBookShelf } from '@/context/BookShelfContext';
import { Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import { ShelfBadge } from './ShelfBadge';
import { ProgressBar } from './ProgressBar';
import { ScaleButton } from './ScaleButton';

interface BookCardProps {
  book: Book;
  index?: number;
  onPress: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, index = 0, onPress }) => {
  const { colors, isDark } = useAppTheme();
  const { toggleFavorite } = useBookShelf();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = Math.min(index * 60, 360);
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const progress =
    book.totalPages > 0 ? (book.currentPage || 0) / book.totalPages : 0;
  const progressPercent = Math.round(progress * 100);

  const authorDisplay =
    Array.isArray(book.authors) && book.authors.length > 0
      ? book.authors.join(', ')
      : 'Невідомий автор';

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <ScaleButton onPress={onPress}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isDark ? Shadows.cardDark : Shadows.card,
          ]}>
          <View
            style={[
              styles.coverWrapper,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.borderSubtle,
              },
            ]}>
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                style={styles.coverImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.fallbackCover}>
                <Ionicons name="book-outline" size={30} color={colors.textMuted} />
              </View>
            )}
          </View>

          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.titleContainer}>
                <Text
                  style={[styles.title, { color: colors.textPrimary }]}
                  numberOfLines={2}>
                  {book.title}
                </Text>
                <Text
                  style={[styles.author, { color: colors.textSecondary }]}
                  numberOfLines={1}>
                  {authorDisplay}
                </Text>
              </View>

              <ScaleButton
                onPress={() => toggleFavorite(book.id)}
                style={styles.favoriteBtn}>
                <Ionicons
                  name={book.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={book.isFavorite ? colors.error : colors.textMuted}
                />
              </ScaleButton>
            </View>

            <View style={styles.bottomRow}>
              <ShelfBadge shelf={book.shelf} />

              {book.notes && book.notes.length > 0 && (
                <View style={styles.notesIndicator}>
                  <Ionicons
                    name="document-text-outline"
                    size={13}
                    color={colors.textSecondary}
                    style={styles.notesIcon}
                  />
                  <Text style={[styles.notesCount, { color: colors.textSecondary }]}>
                    {book.notes.length}
                  </Text>
                </View>
              )}
            </View>

            {(book.shelf === 'reading' || (book.currentPage > 0 && book.shelf !== 'read')) && (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {book.totalPages > 0
                      ? `${book.currentPage} з ${book.totalPages} стор.`
                      : `${book.currentPage} стор. прочитано`}
                  </Text>
                  {book.totalPages > 0 && (
                    <Text style={[styles.percentText, { color: colors.textPrimary }]}>
                      {progressPercent}%
                    </Text>
                  )}
                </View>
                {book.totalPages > 0 && (
                  <ProgressBar
                    progress={progress}
                    height={5}
                    color={colors.statusReading}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </ScaleButton>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  coverWrapper: {
    width: 68,
    height: 98,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  fallbackCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginBottom: 2,
  },
  author: {
    ...Typography.caption,
    marginBottom: 8,
  },
  favoriteBtn: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  notesIcon: {
    marginRight: 3,
  },
  notesCount: {
    ...Typography.small,
  },
  progressSection: {
    marginTop: 10,
    width: '100%',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    ...Typography.small,
  },
  percentText: {
    ...Typography.small,
    fontWeight: '600',
  },
});

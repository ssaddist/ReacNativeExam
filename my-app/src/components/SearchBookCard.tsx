import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { OpenLibraryDoc } from '@/types/book';
import { getCoverUrl, normalizeWorkId } from '@/services/openLibrary';
import { useAppTheme } from '@/context/ThemeContext';
import { useBookShelf } from '@/context/BookShelfContext';
import { Radii, Shadows, Typography } from '@/constants/theme';
import { ShelfBadge } from './ShelfBadge';
import { ScaleButton } from './ScaleButton';

interface SearchBookCardProps {
  doc: OpenLibraryDoc;
  onPress: () => void;
}

export const SearchBookCard: React.FC<SearchBookCardProps> = ({ doc, onPress }) => {
  const { colors, isDark } = useAppTheme();
  const { books, addBook } = useBookShelf();

  const workId = normalizeWorkId(doc.key);
  const existingBook = books.find((b) => b.id === workId);
  const coverUrl = getCoverUrl(doc.cover_i, 'M');

  const authors =
    Array.isArray(doc.author_name) && doc.author_name.length > 0
      ? doc.author_name.slice(0, 2).join(', ')
      : 'Невідомий автор';

  const handleQuickAdd = () => {
    addBook(
      {
        id: workId,
        title: doc.title,
        authors: doc.author_name || ['Невідомий автор'],
        coverId: doc.cover_i,
        coverUrl,
        totalPages: doc.number_of_pages_median || 0,
        firstPublishYear: doc.first_publish_year,
        subjects: doc.subject ? doc.subject.slice(0, 5) : [],
      },
      'wantToRead'
    );
  };

  return (
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
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.fallbackCover}>
              <Ionicons name="book-outline" size={26} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}>
            {doc.title}
          </Text>
          <Text
            style={[styles.author, { color: colors.textSecondary }]}
            numberOfLines={1}>
            {authors}
          </Text>

          <View style={styles.metaRow}>
            {doc.first_publish_year && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={colors.textMuted}
                  style={styles.metaIcon}
                />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {doc.first_publish_year}
                </Text>
              </View>
            )}

            {doc.number_of_pages_median && doc.number_of_pages_median > 0 && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="document-outline"
                  size={12}
                  color={colors.textMuted}
                  style={styles.metaIcon}
                />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {doc.number_of_pages_median} стор.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            {existingBook ? (
              <ShelfBadge shelf={existingBook.shelf} size="small" />
            ) : (
              <ScaleButton
                onPress={handleQuickAdd}
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}>
                <Ionicons
                  name="add"
                  size={14}
                  color={colors.textPrimary}
                  style={styles.addIcon}
                />
                <Text style={[styles.addText, { color: colors.textPrimary }]}>
                  Хочу прочитати
                </Text>
              </ScaleButton>
            )}
          </View>
        </View>
      </View>
    </ScaleButton>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  coverWrapper: {
    width: 60,
    height: 86,
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
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginBottom: 2,
  },
  author: {
    ...Typography.caption,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    ...Typography.small,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  addIcon: {
    marginRight: 4,
  },
  addText: {
    ...Typography.small,
    fontWeight: '500',
  },
});

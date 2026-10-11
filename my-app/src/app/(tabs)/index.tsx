import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useBookShelf } from '@/context/BookShelfContext';
import { ShelfType, Book } from '@/types/book';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { BookCard } from '@/components/BookCard';
import { ShelfTabs } from '@/components/ShelfTabs';
import { EmptyState } from '@/components/EmptyState';
import { ScaleButton } from '@/components/ScaleButton';

export default function ShelvesScreen() {
  const { colors, isDark } = useAppTheme();
  const {
    books,
    activeShelf,
    setActiveShelf,
    stats,
  } = useBookShelf();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesShelf =
        activeShelf === 'all' || book.shelf === activeShelf;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesShelf;

      const matchesTitle = Boolean(book.title?.toLowerCase().includes(q));
      const matchesAuthor = Array.isArray(book.authors) && book.authors.some((a) =>
        a?.toLowerCase().includes(q)
      );

      return matchesShelf && (matchesTitle || matchesAuthor);
    });
  }, [books, activeShelf, searchQuery]);

  const shelfCounts = {
    all: books.length,
    reading: stats.readingCount,
    wantToRead: stats.wantToReadCount,
    read: stats.readCount,
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Моя бібліотека
        </Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Книжкова полиця
        </Text>
      </View>

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
          },
        ]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Пошук у вашій бібліотеці..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <ScaleButton onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </ScaleButton>
        )}
      </View>

      <ShelfTabs
        activeTab={activeShelf}
        onSelectTab={setActiveShelf}
        counts={shelfCounts}
      />
    </View>
  );

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return {
        title: 'Нічого не знайдено',
        desc: `За запитом «${searchQuery}» книг на цій полиці не знайдено.`,
        action: 'Очистити пошук',
        onAction: () => setSearchQuery(''),
      };
    }

    switch (activeShelf) {
      case 'reading':
        return {
          title: 'Зараз нічого не читаєте',
          desc: 'Виберіть цікаву книгу у каталозі Open Library або перенесіть із бажаного.',
          action: 'Знайти книгу',
          onAction: () => router.push('/(tabs)/search'),
        };
      case 'wantToRead':
        return {
          title: 'Полиця бажаного порожня',
          desc: 'Додайте книги, які плануєте прочитати найближчим часом.',
          action: 'Шукати в каталозі',
          onAction: () => router.push('/(tabs)/search'),
        };
      case 'read':
        return {
          title: 'Ще немає прочитаних книг',
          desc: 'Завершуйте читання та фіксуйте свої враження у нотатках.',
          action: 'Переглянути полиці',
          onAction: () => setActiveShelf('reading'),
        };
      default:
        return {
          title: 'Ваша полиця порожня',
          desc: 'Знайдіть цікаву книгу у публічному каталозі Open Library та додайте її на свої полиці.',
          action: 'Знайти книгу в каталозі',
          onAction: () => router.push('/(tabs)/search'),
        };
    }
  };

  const emptyInfo = getEmptyMessage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <BookCard
              book={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: '/book/[id]',
                  params: { id: item.id },
                })
              }
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              iconName="book-outline"
              title={emptyInfo.title}
              description={emptyInfo.desc}
              actionLabel={emptyInfo.action}
              onAction={emptyInfo.onAction}
            />
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          filteredBooks.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  headerContainer: {
    marginBottom: Spacing.sm,
  },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    ...Typography.h1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  cardWrapper: {
    paddingHorizontal: Spacing.md,
  },
});

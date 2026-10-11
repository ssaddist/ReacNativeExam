import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { OpenLibraryDoc } from '@/types/book';
import {
  searchOpenLibrary,
  normalizeWorkId,
} from '@/services/openLibrary';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { SearchBookCard } from '@/components/SearchBookCard';
import { BookCardSkeleton } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorView } from '@/components/ErrorView';
import { ScaleButton } from '@/components/ScaleButton';

const QUICK_CHIPS = [
  'George Orwell',
  'Tolkien',
  'Classics',
  'Dystopia',
  'Philosophy',
  'Antoine de Saint-Exupéry',
];

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'title' | 'author'>('all');
  const [results, setResults] = useState<OpenLibraryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeSearchId = useRef(0);

  const performSearch = useCallback(
    async (searchTerm: string, type: 'all' | 'title' | 'author' = searchType) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setResults([]);
        setHasSearched(false);
        setError(null);
        return;
      }

      const currentId = ++activeSearchId.current;
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const docs = await searchOpenLibrary({ query: trimmed, type });
        if (currentId === activeSearchId.current) {
          setResults(docs);
        }
      } catch (err: any) {
        if (currentId === activeSearchId.current) {
          setError(err.message || 'Не вдалося виконати пошук у Open Library');
        }
      } finally {
        if (currentId === activeSearchId.current) {
          setIsLoading(false);
          setRefreshing(false);
        }
      }
    },
    [searchType]
  );

  const handleRefresh = () => {
    if (query.trim()) {
      setRefreshing(true);
      performSearch(query, searchType);
    }
  };

  const handleChipPress = (term: string) => {
    setQuery(term);
    performSearch(term, searchType);
  };

  const handleSearchSubmit = () => {
    performSearch(query, searchType);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        Публічний каталог
      </Text>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
        Пошук Open Library
      </Text>

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
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder="Назва книги або імʼя автора..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <ScaleButton
            onPress={() => {
              setQuery('');
              setResults([]);
              setHasSearched(false);
              setError(null);
            }}
            style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </ScaleButton>
        )}
        <ScaleButton
          onPress={handleSearchSubmit}
          style={[styles.searchSubmitBtn, { backgroundColor: colors.accent }]}>
          <Ionicons name="arrow-forward" size={16} color={colors.accentText} />
        </ScaleButton>
      </View>

      <View style={styles.filterModes}>
        {(
          [
            { id: 'all', label: 'Всюди', icon: 'grid-outline' },
            { id: 'title', label: 'За назвою', icon: 'book-outline' },
            { id: 'author', label: 'За автором', icon: 'person-outline' },
          ] as const
        ).map((mode) => {
          const isSelected = searchType === mode.id;
          return (
            <ScaleButton
              key={mode.id}
              onPress={() => {
                setSearchType(mode.id);
                if (query.trim()) {
                  performSearch(query, mode.id);
                }
              }}
              style={[
                styles.modeButton,
                {
                  backgroundColor: isSelected
                    ? colors.accent
                    : colors.surfaceSubtle,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}>
              <Ionicons
                name={mode.icon}
                size={13}
                color={isSelected ? colors.accentText : colors.textSecondary}
                style={styles.modeIcon}
              />
              <Text
                style={[
                  styles.modeText,
                  {
                    color: isSelected ? colors.accentText : colors.textPrimary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}>
                {mode.label}
              </Text>
            </ScaleButton>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}>
        {QUICK_CHIPS.map((chip) => (
          <ScaleButton
            key={chip}
            onPress={() => handleChipPress(chip)}
            style={[
              styles.chip,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.borderSubtle,
              },
            ]}>
            <Text style={[styles.chipText, { color: colors.textSecondary }]}>
              {chip}
            </Text>
          </ScaleButton>
        ))}
      </ScrollView>

      {hasSearched && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {`Результати пошуку (${results.length})`}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <View style={styles.skeletonsWrapper}>
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </View>
        </View>
      ) : error ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ErrorView
                message={error}
                onRetry={() => performSearch(query, searchType)}
              />
            </View>
          }
          contentContainerStyle={[styles.listContent, styles.listContentEmpty]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => item.key || idx.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <SearchBookCard
                doc={item}
                onPress={() => {
                  const id = normalizeWorkId(item.key);
                  router.push({
                    pathname: '/book/[id]',
                    params: { id },
                  });
                }}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {hasSearched ? (
                <EmptyState
                  iconName="search-outline"
                  title="Книг не знайдено"
                  description={`За запитом «${query}» у каталозі Open Library нічого не знайдено. Спробуйте змінити пошукове слово.`}
                  actionLabel="Спробувати інший пошук"
                  onAction={() => setQuery('')}
                />
              ) : (
                <EmptyState
                  iconName="search-outline"
                  title="Пошук у каталозі Open Library"
                  description="Введіть назву книги, автора або натисніть одну з підказок вгорі, щоб знайти книги серед мільйонів публічних видань."
                />
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            results.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.h1,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: 4,
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  searchSubmitBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterModes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  modeIcon: {
    marginRight: 4,
  },
  modeText: {
    ...Typography.caption,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipText: {
    ...Typography.caption,
  },
  sectionHeader: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
  },
  itemWrapper: {
    paddingHorizontal: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonsWrapper: {
    paddingHorizontal: Spacing.md,
  },
});

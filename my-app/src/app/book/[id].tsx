import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useBookShelf } from '@/context/BookShelfContext';
import { ShelfType, Book } from '@/types/book';
import {
  fetchWorkDetails,
  getCoverUrl,
  normalizeWorkId,
} from '@/services/openLibrary';
import { Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import { ShelfBadge } from '@/components/ShelfBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { ScaleButton } from '@/components/ScaleButton';
import { ErrorView } from '@/components/ErrorView';
import { Skeleton } from '@/components/SkeletonLoader';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const {
    getBook,
    addBook,
    removeBook,
    updateShelf,
    updateProgress,
    updateTotalPages,
    toggleFavorite,
    deleteNote,
  } = useBookShelf();

  const cleanId = id ? normalizeWorkId(id) : '';
  const localBook = getBook(cleanId);

  const [apiBook, setApiBook] = useState<Partial<Book> | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(!localBook);
  const [apiError, setApiError] = useState<string | null>(null);

  const [pageInput, setPageInput] = useState(
    localBook ? localBook.currentPage.toString() : '0'
  );
  const [totalPagesInput, setTotalPagesInput] = useState(
    localBook?.totalPages ? localBook.totalPages.toString() : ''
  );
  const [pageError, setPageError] = useState<string | null>(null);
  const [isEditingProgress, setIsEditingProgress] = useState(false);

  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    if (localBook) {
      setPageInput(localBook.currentPage.toString());
      if (localBook.totalPages) {
        setTotalPagesInput(localBook.totalPages.toString());
      }
    }
  }, [localBook?.currentPage, localBook?.totalPages]);

  useEffect(() => {
    if (!cleanId || cleanId.startsWith('custom-')) {
      setIsLoadingApi(false);
      return;
    }
    const hasMissingPages = localBook && !localBook.totalPages;

    if (!localBook || !localBook.description || hasMissingPages) {
      loadBookDetails();
    }
  }, [cleanId]);

  const loadBookDetails = async () => {
    if (!cleanId || cleanId.startsWith('custom-')) return;
    setIsLoadingApi(true);
    setApiError(null);

    try {
      const details = await fetchWorkDetails(cleanId);
      const coverId = details.covers && details.covers.length > 0 ? details.covers[0] : undefined;
      const coverUrl = getCoverUrl(coverId, 'L');

      const realPages =
        details.totalPages && details.totalPages > 0
          ? details.totalPages
          : localBook?.totalPages
          ? localBook.totalPages
          : 0;

      const fetchedData = {
        id: cleanId,
        title: details.title,
        authors: details.authors,
        description: details.description,
        coverId,
        coverUrl,
        subjects: details.subjects,
        firstPublishYear: details.firstPublishYear,
        publisher: details.publisher,
        totalPages: realPages,
      };

      setApiBook(fetchedData);
      if (realPages > 0) {
        setTotalPagesInput(realPages.toString());
      }

      if (localBook) {
        const needsUpdate =
          !localBook.description ||
          !localBook.coverUrl ||
          (!localBook.totalPages && realPages > 0) ||
          (!localBook.firstPublishYear && details.firstPublishYear) ||
          (!localBook.publisher && details.publisher);

        if (needsUpdate) {
          addBook(
            {
              ...localBook,
              description: localBook.description || details.description,
              coverUrl: localBook.coverUrl || coverUrl,
              coverId: localBook.coverId || coverId,
              totalPages: realPages > 0 ? realPages : localBook.totalPages,
              firstPublishYear: localBook.firstPublishYear || details.firstPublishYear,
              publisher: localBook.publisher || details.publisher,
              subjects:
                localBook.subjects && localBook.subjects.length > 0
                  ? localBook.subjects
                  : details.subjects,
            },
            localBook.shelf
          );
        }
      }
    } catch (err: any) {
      setApiError(err.message || 'Не вдалося завантажити деталі книги');
    } finally {
      setIsLoadingApi(false);
    }
  };

  const activeBook: Partial<Book> = {
    ...(apiBook || {}),
    ...(localBook || {}),
    title: localBook?.title || apiBook?.title || 'Завантаження...',
    authors:
      localBook?.authors && localBook.authors.length > 0
        ? localBook.authors
        : apiBook?.authors || ['Невідомий автор'],
    description: localBook?.description || apiBook?.description,
    coverUrl: localBook?.coverUrl || apiBook?.coverUrl,
    coverId: localBook?.coverId || apiBook?.coverId,
    subjects:
      localBook?.subjects && localBook.subjects.length > 0
        ? localBook.subjects
        : apiBook?.subjects || [],
    firstPublishYear: localBook?.firstPublishYear || apiBook?.firstPublishYear,
    publisher: localBook?.publisher || apiBook?.publisher,
    totalPages:
      apiBook?.totalPages && apiBook.totalPages > 0
        ? apiBook.totalPages
        : localBook?.totalPages
        ? localBook.totalPages
        : 0,
    currentPage: localBook?.currentPage || 0,
    shelf: localBook?.shelf || 'wantToRead',
    notes: localBook?.notes || [],
  };

  const currentShelf: ShelfType | undefined = localBook?.shelf;
  const isSavedInLibrary = Boolean(localBook);

  const handleShelfChange = (newShelf: ShelfType) => {
    if (isSavedInLibrary) {
      updateShelf(cleanId, newShelf);
    } else {
      addBook(
        {
          id: cleanId,
          title: activeBook.title || 'Без назви',
          authors: activeBook.authors || ['Невідомий автор'],
          coverId: activeBook.coverId,
          coverUrl: activeBook.coverUrl,
          description: activeBook.description,
          totalPages: activeBook.totalPages || 0,
          firstPublishYear: activeBook.firstPublishYear,
          subjects: activeBook.subjects,
        },
        newShelf
      );
    }
  };

  const handleSaveProgress = () => {
    const parsedPage = parseInt(pageInput.trim(), 10);
    const parsedTotal = parseInt(totalPagesInput.trim(), 10);

    if (isNaN(parsedPage) || parsedPage < 0) {
      setPageError('Введіть коректний номер поточної сторінки (0 або більше)');
      return;
    }

    const currentTotal =
      !isNaN(parsedTotal) && parsedTotal > 0
        ? parsedTotal
        : (activeBook.totalPages || 0);

    if (currentTotal > 0 && parsedPage > currentTotal) {
      setPageError(`Номер сторінки не може перевищувати загальну кількість (${currentTotal})`);
      return;
    }

    setPageError(null);

    if (!isSavedInLibrary) {
      addBook(
        {
          id: cleanId,
          title: activeBook.title || 'Без назви',
          authors: activeBook.authors || ['Невідомий автор'],
          coverId: activeBook.coverId,
          coverUrl: activeBook.coverUrl,
          description: activeBook.description,
          totalPages: currentTotal,
          currentPage: parsedPage,
          firstPublishYear: activeBook.firstPublishYear,
          subjects: activeBook.subjects,
        },
        currentTotal > 0 && parsedPage >= currentTotal
          ? 'read'
          : parsedPage > 0
          ? 'reading'
          : 'wantToRead'
      );
    } else {
      if (currentTotal > 0 && currentTotal !== localBook?.totalPages) {
        updateTotalPages(cleanId, currentTotal);
      }
      updateProgress(cleanId, parsedPage);
    }

    setIsEditingProgress(false);
  };

  const handleDeleteBook = () => {
    Alert.alert(
      'Видалити з бібліотеки?',
      `Ви впевнені, що хочете видалити «${activeBook.title}» та всі повʼязані нотатки?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            removeBook(cleanId);
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleDeleteNoteConfirm = (noteId: string, noteTitle: string) => {
    Alert.alert('Видалити нотатку?', `Видалити «${noteTitle}»?`, [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: () => deleteNote(cleanId, noteId),
      },
    ]);
  };

  const totalPages = activeBook.totalPages || 0;
  const currentPage = activeBook.currentPage || 0;
  const progressRatio = totalPages > 0 ? Math.min(currentPage / totalPages, 1) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.navBar}>
        <ScaleButton onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </ScaleButton>

        <View style={styles.navActions}>
          {isSavedInLibrary && (
            <>
              <ScaleButton
                onPress={() => toggleFavorite(cleanId)}
                style={styles.navBtn}>
                <Ionicons
                  name={localBook?.isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={localBook?.isFavorite ? colors.error : colors.textPrimary}
                />
              </ScaleButton>

              <ScaleButton onPress={handleDeleteBook} style={styles.navBtn}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </ScaleButton>
            </>
          )}
        </View>
      </View>

      {isLoadingApi && !localBook ? (
        <ScrollView contentContainerStyle={styles.loadingBody}>
          <View style={styles.loadingCover}>
            <Skeleton width={140} height={200} borderRadius={Radii.lg} />
          </View>
          <Skeleton width="80%" height={24} style={styles.mb} />
          <Skeleton width="50%" height={16} style={styles.mb} />
          <Skeleton width="100%" height={100} borderRadius={Radii.lg} />
        </ScrollView>
      ) : apiError && !localBook ? (
        <ErrorView message={apiError} onRetry={loadBookDetails} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View
              style={[
                styles.coverFrame,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}>
              {activeBook.coverUrl ? (
                <Image
                  source={{ uri: activeBook.coverUrl }}
                  style={styles.coverImage}
                  contentFit="cover"
                  transition={250}
                />
              ) : (
                <View style={styles.fallbackCover}>
                  <Ionicons name="book-outline" size={48} color={colors.textMuted} />
                </View>
              )}
            </View>

            <Text style={[styles.bookTitle, { color: colors.textPrimary }]}>
              {activeBook.title}
            </Text>

            <Text style={[styles.bookAuthors, { color: colors.textSecondary }]}>
              {activeBook.authors && activeBook.authors.length > 0
                ? activeBook.authors.join(', ')
                : 'Невідомий автор'}
            </Text>

            <View style={styles.metaChipsRow}>
              {Boolean(activeBook.firstPublishYear) && (
                <View
                  style={[
                    styles.metaChip,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.borderSubtle,
                    },
                  ]}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={colors.textSecondary}
                    style={styles.metaChipIcon}
                  />
                  <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                    {activeBook.firstPublishYear} р.
                  </Text>
                </View>
              )}

              {totalPages > 0 && (
                <View
                  style={[
                    styles.metaChip,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.borderSubtle,
                    },
                  ]}>
                  <Ionicons
                    name="document-outline"
                    size={13}
                    color={colors.textSecondary}
                    style={styles.metaChipIcon}
                  />
                  <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                    {totalPages} стор.
                  </Text>
                </View>
              )}

              {Boolean(apiBook?.publisher) && (
                <View
                  style={[
                    styles.metaChip,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.borderSubtle,
                    },
                  ]}>
                  <Ionicons
                    name="business-outline"
                    size={13}
                    color={colors.textSecondary}
                    style={styles.metaChipIcon}
                  />
                  <Text
                    style={[styles.metaChipText, { color: colors.textSecondary }]}
                    numberOfLines={1}>
                    {apiBook?.publisher}
                  </Text>
                </View>
              )}
            </View>

            {currentShelf && (
              <View style={styles.badgeWrapper}>
                <ShelfBadge shelf={currentShelf} size="medium" />
              </View>
            )}
          </View>

          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? Shadows.cardDark : Shadows.card,
            ]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Статус на полиці
            </Text>
            <View style={styles.shelfOptions}>
              {(
                [
                  { id: 'wantToRead', label: 'Хочу', icon: 'bookmark-outline' },
                  { id: 'reading', label: 'Читаю', icon: 'time-outline' },
                  { id: 'read', label: 'Прочитано', icon: 'checkmark-circle-outline' },
                ] as const
              ).map((option) => {
                const isSelected = currentShelf === option.id;
                return (
                  <ScaleButton
                    key={option.id}
                    onPress={() => handleShelfChange(option.id)}
                    style={[
                      styles.shelfBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}>
                    <Ionicons
                      name={option.icon}
                      size={15}
                      color={
                        isSelected ? colors.accentText : colors.textSecondary
                      }
                      style={styles.shelfBtnIcon}
                    />
                    <Text
                      style={[
                        styles.shelfBtnText,
                        {
                          color: isSelected
                            ? colors.accentText
                            : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}>
                      {option.label}
                    </Text>
                  </ScaleButton>
                );
              })}
            </View>
          </View>

          {!isSavedInLibrary ? (
            <View
              style={[
                styles.cardSection,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}>
              <View style={styles.promptHeader}>
                <Ionicons
                  name="library-outline"
                  size={18}
                  color={colors.accent}
                  style={styles.cardHeaderIcon}
                />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  Зберегти у бібліотеку
                </Text>
              </View>
              <Text style={[styles.promptDesc, { color: colors.textSecondary }]}>
                Оберіть статус вище («Хочу», «Читаю» або «Прочитано»), щоб зберегти цю книгу, фіксувати прогрес сторінок та залишати нотатки.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.cardSection,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}>
              <View style={styles.progressHeaderRow}>
                <View style={styles.progressTitleLeft}>
                  <Ionicons
                    name="book-outline"
                    size={18}
                    color={colors.statusReading}
                    style={styles.cardHeaderIcon}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Прогрес читання
                  </Text>
                </View>

                <ScaleButton
                  onPress={() => {
                    setIsEditingProgress(!isEditingProgress);
                    setPageError(null);
                  }}
                  style={styles.editBtn}>
                  <Ionicons
                    name={isEditingProgress ? 'close' : 'create-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </ScaleButton>
              </View>

              <View style={styles.progressStatsRow}>
                <Text style={[styles.pagesRatio, { color: colors.textPrimary }]}>
                  {totalPages > 0
                    ? `${currentPage} з ${totalPages} стор.`
                    : `${currentPage} стор. прочитано`}
                </Text>
                {totalPages > 0 ? (
                  <Text style={[styles.pagesPercent, { color: colors.statusReading }]}>
                    {progressPercent}%
                  </Text>
                ) : (
                  !isEditingProgress && (
                    <ScaleButton
                      onPress={() => setIsEditingProgress(true)}
                      style={[styles.smallSetBtn, { borderColor: colors.border }]}>
                      <Text style={[styles.smallSetBtnText, { color: colors.textPrimary }]}>
                        Вказати сторінки
                      </Text>
                    </ScaleButton>
                  )
                )}
              </View>

              {totalPages > 0 && (
                <ProgressBar
                  progress={progressRatio}
                  height={8}
                  color={colors.statusReading}
                />
              )}

              {isEditingProgress ? (
                <View style={[styles.progressForm, { borderTopColor: colors.borderSubtle }]}>
                  <View style={styles.inputsRow}>
                    <View style={styles.inputCol}>
                      <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                        Поточна сторінка:
                      </Text>
                      <TextInput
                        value={pageInput}
                        onChangeText={(val) => {
                          setPageInput(val);
                          if (pageError) setPageError(null);
                        }}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        style={[
                          styles.pageInput,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            borderColor: pageError ? colors.error : colors.border,
                            color: colors.textPrimary,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.inputCol}>
                      <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                        Всього сторінок:
                      </Text>
                      <TextInput
                        value={totalPagesInput}
                        onChangeText={(val) => {
                          setTotalPagesInput(val);
                          if (pageError) setPageError(null);
                        }}
                        keyboardType="number-pad"
                        placeholder={totalPages > 0 ? totalPages.toString() : 'Напр. 328'}
                        placeholderTextColor={colors.textMuted}
                        style={[
                          styles.pageInput,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            borderColor: pageError ? colors.error : colors.border,
                            color: colors.textPrimary,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {pageError && (
                    <View style={styles.errorBanner}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={14}
                        color={colors.error}
                        style={styles.errorBannerIcon}
                      />
                      <Text style={[styles.formError, { color: colors.error }]}>
                        {pageError}
                      </Text>
                    </View>
                  )}

                  <ScaleButton
                    onPress={handleSaveProgress}
                    style={[
                      styles.saveProgressBtnFull,
                      { backgroundColor: colors.accent },
                    ]}>
                    <Text
                      style={[
                        styles.saveProgressBtnText,
                        { color: colors.accentText },
                      ]}>
                      Зберегти прогрес
                    </Text>
                  </ScaleButton>
                </View>
              ) : null}
            </View>
          )}

          {activeBook.description ? (
            <View
              style={[
                styles.cardSection,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Опис книги
              </Text>
              <Text
                style={[styles.descriptionText, { color: colors.textSecondary }]}
                numberOfLines={isDescExpanded ? undefined : 4}>
                {activeBook.description}
              </Text>
              {activeBook.description.length > 200 && (
                <ScaleButton
                  onPress={() => setIsDescExpanded(!isDescExpanded)}
                  style={styles.expandBtn}>
                  <Text style={[styles.expandBtnText, { color: colors.accent }]}>
                    {isDescExpanded ? 'Згорнути' : 'Читати повністю'}
                  </Text>
                  <Ionicons
                    name={isDescExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.accent}
                  />
                </ScaleButton>
              )}
            </View>
          ) : null}

          {activeBook.subjects && activeBook.subjects.length > 0 && (
            <View style={styles.subjectsRow}>
              {activeBook.subjects.slice(0, 6).map((sub, i) => (
                <View
                  key={i}
                  style={[
                    styles.subjectTag,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.borderSubtle,
                    },
                  ]}>
                  <Text
                    style={[styles.subjectTagText, { color: colors.textSecondary }]}>
                    {sub}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? Shadows.cardDark : Shadows.card,
            ]}>
            <View style={styles.notesHeader}>
              <View style={styles.notesTitleLeft}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={colors.statusWant}
                  style={styles.cardHeaderIcon}
                />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Особисті нотатки ({localBook?.notes?.length || 0})
                </Text>
              </View>

              <ScaleButton
                onPress={() => {
                  if (!isSavedInLibrary) {
                    addBook(
                      {
                        id: cleanId,
                        title: activeBook.title || 'Без назви',
                        authors: activeBook.authors || ['Невідомий автор'],
                        coverId: activeBook.coverId,
                        coverUrl: activeBook.coverUrl,
                        description: activeBook.description,
                        totalPages: activeBook.totalPages || 0,
                        firstPublishYear: activeBook.firstPublishYear,
                      },
                      'wantToRead'
                    );
                  }
                  router.push({
                    pathname: '/book/[id]/add-note',
                    params: { id: cleanId },
                  });
                }}
                style={[styles.addNoteBtn, { backgroundColor: colors.accent }]}>
                <Ionicons name="add" size={16} color={colors.accentText} />
                <Text
                  style={[styles.addNoteBtnText, { color: colors.accentText }]}>
                  Нотатка
                </Text>
              </ScaleButton>
            </View>

            {localBook?.notes && localBook.notes.length > 0 ? (
              <View style={styles.notesList}>
                {localBook.notes.map((note) => (
                  <View
                    key={note.id}
                    style={[
                      styles.noteItem,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.borderSubtle,
                      },
                    ]}>
                    <View style={styles.noteTop}>
                      <Text
                        style={[styles.noteTitle, { color: colors.textPrimary }]}>
                        {note.title}
                      </Text>
                      <ScaleButton
                        onPress={() =>
                          handleDeleteNoteConfirm(note.id, note.title)
                        }
                        style={styles.deleteNoteBtn}>
                        <Ionicons
                          name="close-circle-outline"
                          size={18}
                          color={colors.textMuted}
                        />
                      </ScaleButton>
                    </View>

                    <Text
                      style={[styles.noteContent, { color: colors.textSecondary }]}>
                      {note.content}
                    </Text>

                    <View style={styles.noteMeta}>
                      {note.pageRef && (
                        <View style={styles.notePageBadge}>
                          <Ionicons
                            name="bookmark"
                            size={11}
                            color={colors.statusReading}
                            style={styles.notePageIcon}
                          />
                          <Text
                            style={[
                              styles.notePageText,
                              { color: colors.statusReading },
                            ]}>
                            Стор. {note.pageRef}
                          </Text>
                        </View>
                      )}

                      <Text
                        style={[styles.noteDate, { color: colors.textMuted }]}>
                        {new Date(note.createdAt).toLocaleDateString('uk-UA', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noNotesContainer}>
                <Text style={[styles.noNotesText, { color: colors.textMuted }]}>
                  У вас поки немає збережених цитат або думок до цієї книги.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  navBtn: {
    padding: 8,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  loadingBody: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  loadingCover: {
    marginBottom: Spacing.lg,
  },
  mb: {
    marginBottom: Spacing.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  coverFrame: {
    width: 140,
    height: 204,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  fallbackCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: Spacing.sm,
  },
  bookAuthors: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  metaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  metaChipIcon: {
    marginRight: 4,
  },
  metaChipText: {
    ...Typography.small,
  },
  badgeWrapper: {
    marginTop: 4,
  },
  cardSection: {
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  shelfOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xs,
  },
  shelfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  shelfBtnIcon: {
    marginRight: 6,
  },
  shelfBtnText: {
    ...Typography.caption,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    padding: 4,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  promptDesc: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  smallSetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  smallSetBtnText: {
    ...Typography.caption,
    fontWeight: '500',
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  pagesRatio: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  pagesPercent: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  progressForm: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xs,
  },
  inputCol: {
    flex: 1,
  },
  formLabel: {
    ...Typography.caption,
    marginBottom: 6,
  },
  progressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Typography.body,
  },
  saveProgressBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  saveProgressBtnFull: {
    paddingVertical: 11,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveProgressBtnText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorBannerIcon: {
    marginRight: 4,
  },
  formError: {
    ...Typography.caption,
  },
  descriptionText: {
    ...Typography.body,
    lineHeight: 22,
    marginTop: 4,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expandBtnText: {
    ...Typography.caption,
    fontWeight: '600',
    marginRight: 4,
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  subjectTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  subjectTagText: {
    ...Typography.small,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  notesTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
  },
  addNoteBtnText: {
    ...Typography.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  notesList: {
    gap: 10,
    marginTop: Spacing.xs,
  },
  noteItem: {
    padding: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  noteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    flex: 1,
  },
  deleteNoteBtn: {
    padding: 2,
    marginLeft: 8,
  },
  noteContent: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notePageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notePageIcon: {
    marginRight: 3,
  },
  notePageText: {
    ...Typography.small,
    fontWeight: '600',
  },
  noteDate: {
    ...Typography.small,
  },
  noNotesContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  noNotesText: {
    ...Typography.caption,
    textAlign: 'center',
  },
});

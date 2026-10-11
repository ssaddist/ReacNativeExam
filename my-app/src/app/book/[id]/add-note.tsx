import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useBookShelf } from '@/context/BookShelfContext';
import { normalizeWorkId } from '@/services/openLibrary';
import { Radii, Shadows, Spacing, Typography } from '@/constants/theme';
import { ScaleButton } from '@/components/ScaleButton';

export default function AddNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const { getBook, addNote } = useBookShelf();

  const cleanId = id ? normalizeWorkId(id) : '';
  const book = getBook(cleanId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pageRef, setPageRef] = useState(
    book?.currentPage && book.currentPage > 0 ? book.currentPage.toString() : ''
  );
  const [rating, setRating] = useState<number>(5);

  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    pageRef?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string; pageRef?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Вкажіть назву нотатки або номер розділу';
    }

    if (!content.trim()) {
      newErrors.content = 'Текст нотатки не може бути порожнім';
    } else if (content.trim().length < 5) {
      newErrors.content = 'Текст нотатки має містити щонайменше 5 символів';
    }

    if (pageRef.trim()) {
      const pageNum = parseInt(pageRef.trim(), 10);
      if (isNaN(pageNum) || pageNum <= 0) {
        newErrors.pageRef = 'Номер сторінки має бути додатним числом';
      } else if (book && book.totalPages > 0 && pageNum > book.totalPages) {
        newErrors.pageRef = `Сторінка не може перевищувати ${book.totalPages}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    addNote(cleanId, {
      title: title.trim(),
      content: content.trim(),
      pageRef: pageRef.trim() ? parseInt(pageRef.trim(), 10) : undefined,
      rating,
    });

    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <ScaleButton onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close-outline" size={24} color={colors.textPrimary} />
          </ScaleButton>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Нова нотатка
          </Text>

          <ScaleButton
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.accent }]}>
            <Text style={[styles.saveBtnText, { color: colors.accentText }]}>
              Зберегти
            </Text>
          </ScaleButton>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {book && (
            <View
              style={[
                styles.bookInfoBanner,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                },
              ]}>
              <Ionicons
                name="book-outline"
                size={16}
                color={colors.statusReading}
                style={styles.bookBannerIcon}
              />
              <Text
                style={[styles.bookBannerText, { color: colors.textSecondary }]}
                numberOfLines={1}>
                {book.title}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Назва нотатки чи тема *
            </Text>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Наприклад: Роздуми про розділ 3 або Цитата"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.title ? colors.error : colors.border,
                  color: colors.textPrimary,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}
            />
            {errors.title && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                <Text style={[styles.errorMsg, { color: colors.error }]}>
                  {errors.title}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Номер сторінки (необовʼязково)
            </Text>
            <TextInput
              value={pageRef}
              onChangeText={(text) => {
                setPageRef(text);
                if (errors.pageRef) setErrors((prev) => ({ ...prev, pageRef: undefined }));
              }}
              keyboardType="number-pad"
              placeholder="Наприклад: 42"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.pageRef ? colors.error : colors.border,
                  color: colors.textPrimary,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}
            />
            {errors.pageRef && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                <Text style={[styles.errorMsg, { color: colors.error }]}>
                  {errors.pageRef}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Оцінка епізоду / думки
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <ScaleButton
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= rating ? colors.statusReading : colors.border}
                  />
                </ScaleButton>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Зміст нотатки чи цитата *
            </Text>
            <TextInput
              value={content}
              onChangeText={(text) => {
                setContent(text);
                if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholder="Запишіть ваші враження, ключову цитату або важливу ідею з прочитаного..."
              placeholderTextColor={colors.textMuted}
              style={[
                styles.multilineInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.content ? colors.error : colors.border,
                  color: colors.textPrimary,
                },
                isDark ? Shadows.cardDark : Shadows.card,
              ]}
            />
            {errors.content && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                <Text style={[styles.errorMsg, { color: colors.error }]}>
                  {errors.content}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 54,
    borderBottomWidth: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radii.lg,
  },
  saveBtnText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  bookInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  bookBannerIcon: {
    marginRight: 6,
  },
  bookBannerText: {
    ...Typography.caption,
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.captionMedium,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Typography.body,
  },
  multilineInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 140,
    ...Typography.body,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorMsg: {
    ...Typography.caption,
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  starBtn: {
    padding: 2,
  },
});

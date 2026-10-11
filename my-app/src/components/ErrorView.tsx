import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { ScaleButton } from './ScaleButton';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.errorBg,
            borderColor: colors.errorBorder,
          },
        ]}>
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={colors.error}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.error }]}>Виникла помилка</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        </View>
      </View>

      {onRetry && (
        <ScaleButton
          onPress={onRetry}
          style={[styles.retryBtn, { backgroundColor: colors.accent }]}>
          <Ionicons
            name="refresh-outline"
            size={16}
            color={colors.accentText}
            style={styles.retryIcon}
          />
          <Text style={[styles.retryText, { color: colors.accentText }]}>
            Повторити спробу
          </Text>
        </ScaleButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: Spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: Radii.lg,
    borderWidth: 1,
    width: '100%',
    marginBottom: Spacing.md,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    marginBottom: 4,
  },
  message: {
    ...Typography.caption,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Radii.lg,
  },
  retryIcon: {
    marginRight: 6,
  },
  retryText: {
    ...Typography.bodyMedium,
  },
});

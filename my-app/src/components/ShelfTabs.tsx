import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShelfType } from '@/types/book';
import { useAppTheme } from '@/context/ThemeContext';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { ScaleButton } from './ScaleButton';

interface ShelfTabsProps {
  activeTab: 'all' | ShelfType;
  onSelectTab: (tab: 'all' | ShelfType) => void;
  counts: {
    all: number;
    reading: number;
    wantToRead: number;
    read: number;
  };
}

interface TabItem {
  id: 'all' | ShelfType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
}

export const ShelfTabs: React.FC<ShelfTabsProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  const { colors } = useAppTheme();

  const tabs: TabItem[] = [
    { id: 'all', label: 'Всі', icon: 'albums-outline', count: counts.all },
    { id: 'reading', label: 'Читаю', icon: 'time-outline', count: counts.reading },
    { id: 'wantToRead', label: 'Хочу', icon: 'bookmark-outline', count: counts.wantToRead },
    { id: 'read', label: 'Прочитано', icon: 'checkmark-circle-outline', count: counts.read },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <ScaleButton
              key={tab.id}
              onPress={() => onSelectTab(tab.id)}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isActive ? colors.accent : colors.surfaceSubtle,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}>
              <Ionicons
                name={tab.icon}
                size={14}
                color={isActive ? colors.accentText : colors.textSecondary}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.accentText : colors.textPrimary,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}>
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countPill,
                  {
                    backgroundColor: isActive
                      ? colors.surfaceSubtle
                      : colors.borderSubtle,
                  },
                ]}>
                <Text
                  style={[
                    styles.countText,
                    {
                      color: isActive ? colors.textPrimary : colors.textSecondary,
                    },
                  ]}>
                  {tab.count}
                </Text>
              </View>
            </ScaleButton>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    ...Typography.caption,
    marginRight: 6,
  },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  countText: {
    ...Typography.small,
    fontSize: 10,
    fontWeight: '600',
  },
});

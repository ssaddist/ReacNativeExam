import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShelfType } from '@/types/book';
import { useAppTheme } from '@/context/ThemeContext';
import { Radii } from '@/constants/theme';

interface ShelfBadgeProps {
  shelf: ShelfType;
  size?: 'small' | 'medium';
}

export const ShelfBadge: React.FC<ShelfBadgeProps> = ({ shelf, size = 'small' }) => {
  const { colors } = useAppTheme();

  const getBadgeConfig = () => {
    switch (shelf) {
      case 'reading':
        return {
          label: 'Читаю',
          icon: 'time-outline' as const,
          color: colors.statusReading,
          bg: colors.statusReadingBg,
          border: colors.statusReadingBorder,
        };
      case 'read':
        return {
          label: 'Прочитано',
          icon: 'checkmark-circle-outline' as const,
          color: colors.statusRead,
          bg: colors.statusReadBg,
          border: colors.statusReadBorder,
        };
      case 'wantToRead':
      default:
        return {
          label: 'Хочу прочитати',
          icon: 'bookmark-outline' as const,
          color: colors.statusWant,
          bg: colors.statusWantBg,
          border: colors.statusWantBorder,
        };
    }
  };

  const config = getBadgeConfig();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
      ]}>
      <Ionicons
        name={config.icon}
        size={isSmall ? 12 : 15}
        color={config.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: isSmall ? 11 : 13,
            lineHeight: isSmall ? 15 : 18,
          },
        ]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

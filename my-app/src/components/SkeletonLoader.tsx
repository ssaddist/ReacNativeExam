import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/context/ThemeContext';
import { Radii, Shadows } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  borderRadius = Radii.sm,
  style,
}) => {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceSubtle,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isDark ? Shadows.cardDark : Shadows.card,
      ]}>
      <Skeleton width={70} height={100} borderRadius={Radii.md} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={18} style={styles.mb} />
        <Skeleton width="50%" height={14} style={styles.mb} />
        <Skeleton width="30%" height={20} borderRadius={Radii.sm} style={styles.mb} />
        <Skeleton width="100%" height={6} borderRadius={Radii.full} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  mb: {
    marginBottom: 8,
  },
});

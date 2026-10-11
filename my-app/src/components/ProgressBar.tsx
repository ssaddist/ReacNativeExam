import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@/context/ThemeContext';
import { Radii } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
  trackColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  style,
  color,
  trackColor,
}) => {
  const { colors } = useAppTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const widthAnim = useSharedValue(clamped);

  useEffect(() => {
    widthAnim.value = withTiming(clamped, {
      duration: 450,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [clamped]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthAnim.value * 100}%`,
    };
  });

  const activeColor = color || colors.accent;
  const activeTrack = trackColor || colors.surfaceSubtle;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: activeTrack,
          borderColor: colors.borderSubtle,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: activeColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radii.full,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  fill: {
    borderRadius: Radii.full,
  },
});

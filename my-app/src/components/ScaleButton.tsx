import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ScaleButtonProps {
  children: React.ReactNode;
  onPress?: (event?: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeScale?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ScaleButton: React.FC<ScaleButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  activeScale = 0.97,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(activeScale, { damping: 15, stiffness: 250 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (!disabled && onPress) {
      onPress(e);
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[style, animatedStyle, disabled && styles.disabled]}>
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
});

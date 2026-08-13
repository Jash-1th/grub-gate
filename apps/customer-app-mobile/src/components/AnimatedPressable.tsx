import React, { useRef } from 'react';
import { Pressable, Animated, AccessibilityRole, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

const AnimatedPressableCore = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: (event?: GestureResponderEvent) => void;
  style?: any;
  disabled?: boolean;
  hitSlop?: any;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
}

export function AnimatedPressable({
  children,
  onPress,
  style,
  disabled = false,
  hitSlop,
  accessibilityRole,
  accessibilityLabel,
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <AnimatedPressableCore
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Removed the destructive 100% width/height styling here */}
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </AnimatedPressableCore>
  );
}
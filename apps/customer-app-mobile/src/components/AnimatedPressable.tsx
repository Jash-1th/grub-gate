import React, { useRef } from 'react';
import { Pressable, StyleSheet, Animated, AccessibilityRole, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

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
      toValue: 0.97,
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
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.animated, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  animated: {
    width: '100%',
    height: '100%',
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './Icon';
import { lightTheme, useTheme } from '../../theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  visible: boolean;
}

export function Toast({ message, type = 'success', duration = 2000, onHide, visible }: ToastProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const t = theme || lightTheme;
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hideToast = () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    };

    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration, onHide, translateY, opacity]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'check-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'info':
        return t.primary;
      default:
        return '#10B981';
    }
  };

  const getBackgroundColor = () => {
    if (isDarkMode) {
      return '#1F2937';
    }
    return '#FFFFFF';
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          // Push toast lower to avoid overlapping nav/back buttons
          top: Math.max(insets.top, 0) + 48,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: getBackgroundColor(),
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOpacity: isDarkMode ? 0.5 : 0.15,
          },
        ]}
      >
        <AppIcon name={getIconName()} size={20} color={getIconColor()} />
        <Text style={[styles.message, { color: t.text }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

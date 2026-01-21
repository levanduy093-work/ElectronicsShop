import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './Icon';
import { useTheme } from '../../theme';

interface OfflineBannerProps {
  visible: boolean;
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  // const t = theme || lightTheme;
  const slideAnim = React.useRef(new Animated.Value(-50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
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
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 0),
          transform: [{ translateY: slideAnim }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isDarkMode ? '#DC2626' : '#EF4444',
          },
        ]}
      >
        <AppIcon name="wifi-off" size={18} color="#FFFFFF" />
        <Text style={styles.text}>Không có kết nối mạng</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10000,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

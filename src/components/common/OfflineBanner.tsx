import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './Icon';
import { useTheme } from '../../theme';

interface OfflineBannerProps {
  visible: boolean;
  isInternetReachable?: boolean | null;
}

export function OfflineBanner({ visible, isInternetReachable }: OfflineBannerProps) {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  // const t = theme || lightTheme;
  const slideAnim = React.useRef(new Animated.Value(-50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  const isNoInternet = isInternetReachable === false;

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
      className="absolute left-0 right-0 z-[10000] px-4 items-center"
      style={{
        top: Math.max(insets.top, 10),
        transform: [{ translateY: slideAnim }],
        opacity,
      }}
    >
      <View
        className="flex-row items-center px-4 py-2.5 rounded-lg gap-2 shadow-sm"
        style={{
          backgroundColor: isDarkMode ? '#DC2626' : '#EF4444',
          elevation: 5,
        }}
      >
        <AppIcon
          name={isNoInternet ? 'wifi-off' : 'cloud-off'}
          size={18}
          color="#FFFFFF"
        />
        <Text className="text-white text-sm font-medium">
          {isNoInternet ? 'Không có quyền truy cập Internet' : 'Mất kết nối mạng'}
        </Text>
      </View>
    </Animated.View>
  );
}

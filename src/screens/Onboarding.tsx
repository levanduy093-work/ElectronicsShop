import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { AppIcon } from '../components/common/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingProps = {
  onDone: () => void;
  onSkipToAuth: () => void;
  onSkipToHome: () => void;
  onSignUp?: () => void;
};

type Slide = {
  key: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  accentMuted: string;
  stats: string;
  highlight: string;
};

export function Onboarding({ onDone, onSkipToAuth, onSkipToHome, onSignUp }: OnboardingProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const footerAnim = useRef(new Animated.Value(1)).current;
  const listRef = useRef<FlatList<Slide>>(null);

  const slides: Slide[] = useMemo(
    () => [
      {
        key: 'catalog',
        badge: t('onboarding_badge_components'),
        title: t('onboarding_discover_title'),
        description: t('onboarding_discover_desc'),
        icon: 'chip',
        accent: '#111827',
        accentMuted: '#2563EB',
        stats: t('onboarding_discover_stat'),
        highlight: t('onboarding_discover_highlight'),
      },
      {
        key: 'ai',
        badge: t('onboarding_badge_ai'),
        title: t('onboarding_ai_title'),
        description: t('onboarding_ai_desc'),
        icon: 'robot',
        accent: '#0EA5E9',
        accentMuted: '#A855F7',
        stats: t('onboarding_ai_stat'),
        highlight: t('onboarding_ai_highlight'),
      },
      {
        key: 'delivery',
        badge: t('onboarding_badge_delivery'),
        title: t('onboarding_delivery_title'),
        description: t('onboarding_delivery_desc'),
        icon: 'truck',
        accent: '#16A34A',
        accentMuted: '#F59E0B',
        stats: t('onboarding_delivery_stat'),
        highlight: t('onboarding_delivery_highlight'),
      },
    ],
    [t],
  );

  const goToSlide = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (activeIndex >= slides.length - 1) {
      onDone();
      return;
    }
    goToSlide(activeIndex + 1);
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View className="px-6 pt-2 pb-3" style={{ width: SCREEN_WIDTH }}>
        <View className="flex-row justify-between items-center mb-4">
          <View className="px-3.5 py-2 rounded-2xl" style={{ backgroundColor: item.accentMuted }}>
            <Text className="text-white font-bold text-xs tracking-wider">{item.badge}</Text>
          </View>
          <Pressable onPress={onSkipToHome} hitSlop={14} accessibilityRole="button">
            <Text className="text-sm font-semibold" style={{ color: theme.muted }}>{t('onboarding_skip')}</Text>
          </Pressable>
        </View>

        <View className="h-80 rounded-3xl overflow-hidden mb-7 justify-center bg-transparent">
          <View className="absolute w-96 h-96 rounded-full -top-32 -left-16 transform -rotate-6" style={{ backgroundColor: item.accentMuted, opacity: 0.18 }} />
          <View className="absolute w-[340px] h-[340px] rounded-full -bottom-36 -right-10 transform rotate-6" style={{ backgroundColor: item.accent, opacity: 0.12 }} />
          <View className="absolute w-60 h-60 rounded-full border-[10px] self-center opacity-25" style={{ borderColor: item.accent }} />
          <View
            className="self-center flex-row items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-sm"
            style={{
              backgroundColor: '#FFFFFFCC',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Image
              source={require('../assets/images/logo.png')}
              className="w-8 h-8"
              resizeMode="contain"
            />
            <Text className="font-extrabold text-lg" style={{ color: theme.text }}>{t('app_name')}</Text>
          </View>
          <View
            className="absolute bottom-7 left-4.5 right-4.5 p-4 rounded-2xl flex-row items-center gap-3 shadow-sm"
            style={{
              backgroundColor: theme.surface,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: item.accent }}>
              <AppIcon name={item.icon as any} size={26} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold" style={{ color: theme.text }}>{item.highlight}</Text>
              <Text className="mt-1 text-xs font-medium" style={{ color: theme.muted }}>{item.stats}</Text>
            </View>
            <AppIcon name="arrow-right" size={22} color={item.accent} />
          </View>
        </View>

        <View className="px-1">
          <Text className="text-3xl font-extrabold mb-2.5 tracking-wide" style={{ color: theme.text }}>{item.title}</Text>
          <Text className="text-base leading-6 font-medium" style={{ color: theme.muted }}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const progress = slides.map((_, i) => {
    const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
    return scrollX.interpolate({
      inputRange,
      outputRange: [0.32, 1, 0.32],
      extrapolate: 'clamp',
    });
  });

  useEffect(() => {
    // Chỉ làm hiệu ứng mờ → rõ rất nhẹ, không trượt lên xuống để tránh cảm giác giật
    footerAnim.setValue(0.9);
    Animated.timing(footerAnim, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, footerAnim]);

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: theme.background,
        paddingTop: Math.max(insets.top, 24),
        paddingBottom: insets.bottom ? insets.bottom + 10 : 20,
      }}
    >
      <Animated.FlatList
        ref={listRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={item => item.key}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={event => {
          const idx = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
        scrollEventThrottle={16}
      />

      <Animated.View
        className="px-6 pb-5 gap-3"
        style={{
          marginBottom: insets.bottom ? 0 : 6,
          opacity: footerAnim,
        }}
      >
        <View className="flex-row items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <Animated.View
              key={slide.key}
              className="h-2.5 rounded-full"
              style={
                {
                  backgroundColor: theme.text,
                  opacity: progress[index],
                  width: progress[index].interpolate({
                    inputRange: [0.32, 1],
                    outputRange: [12, 32],
                    extrapolate: 'clamp',
                  }),
                }
              }
            />
          ))}
        </View>

        {activeIndex === slides.length - 1 ? (
          <View className="gap-3">
            <View className="flex-row items-stretch gap-3">
              <Pressable
                onPress={onSignUp || onSkipToAuth}
                className="flex-1 py-3.5 rounded-xl items-center justify-center"
                style={{ backgroundColor: slides[activeIndex]?.accent || theme.primary }}
                android_ripple={{ color: '#ffffff20' }}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text className="text-white font-extrabold text-base">{t('onboarding_sign_up')}</Text>
              </Pressable>
              <Pressable
                onPress={onSkipToAuth}
                className="flex-1 py-3.5 rounded-xl border items-center justify-center"
                style={{ borderColor: theme.border }}
                android_ripple={{ color: theme.border }}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text className="font-bold text-base" style={{ color: theme.text }}>{t('onboarding_login')}</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={onSkipToHome}
              className="py-3.5 px-4 rounded-xl border items-center justify-center"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              android_ripple={{ color: theme.border + '20' }}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text className="font-semibold text-sm mb-1" style={{ color: theme.muted }}>{t('onboarding_continue_as_guest')}</Text>
              <Text className="text-xs text-center leading-4" style={{ color: theme.muted }}>
                {t('onboarding_continue_as_guest_desc')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-2">
            <Pressable
              onPress={handleNext}
              className="w-full py-3.5 rounded-xl items-center justify-center"
              style={{ backgroundColor: slides[activeIndex]?.accent || theme.primary }}
              android_ripple={{ color: '#ffffff20' }}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text className="text-white font-extrabold text-base">{t('onboarding_next')}</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}


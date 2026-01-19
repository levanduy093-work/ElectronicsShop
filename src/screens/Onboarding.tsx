import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
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
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: item.accentMuted }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
          <Pressable onPress={onSkipToHome} hitSlop={14} accessibilityRole="button">
            <Text style={[styles.skipText, { color: theme.muted }]}>{t('onboarding_skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={[styles.blob, { backgroundColor: item.accentMuted, opacity: 0.18 }]} />
          <View style={[styles.blobSecondary, { backgroundColor: item.accent, opacity: 0.12 }]} />
          <View style={[styles.ring, { borderColor: item.accent }]} />
          <View style={styles.logoCard}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.logoText, { color: theme.text }]}>{t('app_name')}</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.iconBadge, { backgroundColor: item.accent }]}>
              <AppIcon name={item.icon as any} size={26} color="#fff" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{item.highlight}</Text>
              <Text style={[styles.featureSubtitle, { color: theme.muted }]}>{item.stats}</Text>
            </View>
            <AppIcon name="arrow-right" size={22} color={item.accent} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.description, { color: theme.muted }]}>{item.description}</Text>
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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: insets.bottom ? insets.bottom + 10 : 20,
        },
      ]}
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

      <View style={[styles.bottom, { marginBottom: insets.bottom ? 0 : 6 }]}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <Animated.View
              key={slide.key}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.text,
                  opacity: progress[index],
                  width: progress[index].interpolate({
                    inputRange: [0.32, 1],
                    outputRange: [12, 32],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          ))}
        </View>

        {activeIndex === slides.length - 1 ? (
          <View style={styles.finalActions}>
            <View style={styles.primaryActions}>
              <Pressable
                onPress={onSignUp || onSkipToAuth}
                style={[styles.signUpBtn, { backgroundColor: slides[activeIndex]?.accent || theme.primary }]}
                android_ripple={{ color: '#ffffff20' }}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text style={styles.signUpText}>{t('onboarding_sign_up')}</Text>
              </Pressable>
              <Pressable
                onPress={onSkipToAuth}
                style={[styles.loginBtn, { borderColor: theme.border }]}
                android_ripple={{ color: theme.border }}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text style={[styles.loginText, { color: theme.text }]}>{t('onboarding_login')}</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={onSkipToHome}
              style={[styles.guestBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}
              android_ripple={{ color: theme.border + '20' }}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text style={[styles.guestText, { color: theme.muted }]}>{t('onboarding_continue_as_guest')}</Text>
              <Text style={[styles.guestDesc, { color: theme.muted }]}>
                {t('onboarding_continue_as_guest_desc')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.singleAction}>
            <Pressable
              onPress={handleNext}
              style={[styles.primaryBtnFull, { backgroundColor: slides[activeIndex]?.accent || theme.primary }]}
              android_ripple={{ color: '#ffffff20' }}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>{t('onboarding_next')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    height: 320,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  blob: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -120,
    left: -60,
    transform: [{ rotate: '-6deg' }],
  },
  blobSecondary: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    bottom: -140,
    right: -40,
    transform: [{ rotate: '8deg' }],
  },
  ring: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    opacity: 0.24,
    alignSelf: 'center',
  },
  logoCard: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFFCC',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontWeight: '800',
    fontSize: 17,
  },
  featureCard: {
    position: 'absolute',
    bottom: 28,
    left: 18,
    right: 18,
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  copy: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 999,
  },
  singleAction: {
    marginTop: 8,
  },
  primaryBtnFull: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  finalActions: {
    gap: 12,
  },
  primaryActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  signUpBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  loginBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontWeight: '700',
    fontSize: 15,
  },
  guestBanner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  guestDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { useTheme } from '../theme';

interface TabConfig {
    name: string;
    icon: string;
    label: string;
    isSpecial?: boolean;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
    HomeTab: { name: 'HomeTab', icon: 'home', label: 'home' },
    CatalogTab: { name: 'CatalogTab', icon: 'grid', label: 'categories' },
    AITab: { name: 'AITab', icon: 'message-circle', label: 'ai_chat', isSpecial: true },
    CartTab: { name: 'CartTab', icon: 'shopping-cart', label: 'cart' },
    ProfileTab: { name: 'ProfileTab', icon: 'user', label: 'personal' },
};

interface AnimatedTabButtonProps {
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    config: TabConfig;
    activeColor: string;
    inactiveColor: string;
    cartCount?: number;
}

function AnimatedTabButton({
    isFocused,
    onPress,
    onLongPress,
    config,
    activeColor,
    inactiveColor,
    cartCount = 0,
}: AnimatedTabButtonProps) {
    const { t } = useTranslation();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const colorAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: isFocused ? 1.08 : 1,
                duration: 170,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(colorAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(focusAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 180,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    }, [isFocused, scaleAnim, colorAnim, focusAnim]);

    const labelColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });
    const labelOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
    });
    const labelTranslateY = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 0],
    });

    if (config.isSpecial) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress}
                className="flex-1 items-center justify-center -mt-3"
                activeOpacity={0.7}
            >
                <Animated.View
                    className="w-14 h-14 rounded-full justify-center items-center"
                    style={[
                        { transform: [{ scale: scaleAnim }] },
                        {
                            backgroundColor: '#2563EB',
                            ...(Platform.OS === 'ios'
                                ? {
                                    shadowColor: '#2563EB',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                }
                                : { elevation: 8 }),
                        },
                    ]}
                >
                    <AppIcon name="message-circle" size={28} color="#FFFFFF" />
                </Animated.View>
                <Animated.Text
                    className="text-[11px] font-bold mt-1"
                    style={{ color: isFocused ? '#2563EB' : '#9CA3AF' }}
                >
                    AI Chat
                </Animated.Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center gap-1"
            activeOpacity={0.7}
        >
            <Animated.View
                className="relative"
                style={{ transform: [{ scale: scaleAnim }] }}
            >
                {config.name === 'CartTab' && cartCount > 0 && (
                    <View className="absolute -top-1 -right-2 bg-red-500 rounded-[10px] min-w-4 h-4 px-1 justify-center items-center z-10">
                        <Text className="text-white text-[10px] font-bold">
                            {cartCount > 99 ? '99+' : cartCount}
                        </Text>
                    </View>
                )}
                <AppIcon
                    name={config.icon}
                    size={24}
                    color={isFocused ? activeColor : inactiveColor}
                />
            </Animated.View>
            <Animated.Text
                className="text-[11px] font-medium"
                style={{ color: labelColor, opacity: labelOpacity, transform: [{ translateY: labelTranslateY }] }}
            >
                {t(config.label)}
            </Animated.Text>
        </TouchableOpacity>
    );
}

interface AnimatedTabBarProps extends BottomTabBarProps {
    cartCount?: number;
}

export function AnimatedTabBar({ state, navigation, cartCount = 0 }: AnimatedTabBarProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const activeColor = theme.tabActive;
    const inactiveColor = theme.tabInactive;

    const minBottomPadding = Platform.OS === 'android' ? 36 : 16;
    const bottomInset = Math.max(insets.bottom, minBottomPadding);

    return (
        <View
            className="h-[86px] px-4 pt-3 flex-row items-center justify-between border-t"
            style={{
                paddingBottom: bottomInset,
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
                ...(Platform.OS === 'ios'
                    ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.03,
                        shadowRadius: 12,
                    }
                    : { elevation: 8 }),
            }}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const config = TAB_CONFIGS[route.name] || {
                    name: route.name,
                    icon: 'circle',
                    label: route.name,
                };

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <AnimatedTabButton
                        key={route.key}
                        isFocused={isFocused}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        config={config}
                        activeColor={activeColor}
                        inactiveColor={inactiveColor}
                        cartCount={config.name === 'CartTab' ? cartCount : 0}
                    />
                );
            })}
        </View>
    );
}

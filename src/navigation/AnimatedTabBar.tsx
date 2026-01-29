import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Animated,
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

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1.1 : 1,
                useNativeDriver: true,
                friction: 8,
                tension: 100,
            }),
            Animated.timing(colorAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start();
    }, [isFocused, scaleAnim, colorAnim]);

    const iconColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    const labelColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    if (config.isSpecial) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.specialButton}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={[
                        styles.specialIconContainer,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <AppIcon name="message-circle" size={28} color="#FFFFFF" />
                </Animated.View>
                <Animated.Text
                    style={[
                        styles.specialLabel,
                        isFocused && styles.specialLabelActive,
                    ]}
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
            style={styles.tabButton}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                {config.name === 'CartTab' && cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {cartCount > 99 ? '99+' : cartCount}
                        </Text>
                    </View>
                )}
                <Animated.View>
                    <AppIcon
                        name={config.icon}
                        size={24}
                        color={isFocused ? activeColor : inactiveColor}
                    />
                </Animated.View>
            </Animated.View>
            <Animated.Text style={[styles.tabLabel, { color: labelColor }]}>
                {t(config.label)}
            </Animated.Text>
        </TouchableOpacity>
    );
}

interface AnimatedTabBarProps extends BottomTabBarProps {
    cartCount?: number;
}

export function AnimatedTabBar({ state, descriptors, navigation, cartCount = 0 }: AnimatedTabBarProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const activeColor = theme.tabActive;
    const inactiveColor = theme.tabInactive;

    // Add extra padding on Android to avoid overlap with gesture navigation bar
    const minBottomPadding = Platform.OS === 'android' ? 36 : 16;

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, minBottomPadding),
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                },
            ]}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        height: 80,
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.03,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    specialButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -12,
    },
    specialIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    specialLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
        marginTop: 4,
    },
    specialLabelActive: {
        color: '#2563EB',
    },
});

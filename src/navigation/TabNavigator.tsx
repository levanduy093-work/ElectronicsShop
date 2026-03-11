import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { AnimatedTabBar } from './AnimatedTabBar';
import { HomeTab, CatalogTab, AITab, CartTab, ProfileTab } from './tabs';
import { useTheme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabNavigatorProps {
    cartCount?: number;
    initialAuthMode?: 'login' | 'register';
}

export function TabNavigator({ cartCount = 0, initialAuthMode }: TabNavigatorProps) {
    const initialRouteName: keyof RootTabParamList = initialAuthMode ? 'ProfileTab' : 'HomeTab';
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            initialRouteName={initialRouteName}
            detachInactiveScreens={false}
            lazy={false}
            screenOptions={{
                headerShown: false,
                animation: 'shift',
                freezeOnBlur: true,
                sceneContainerStyle: { backgroundColor: theme.background },
            }}
            tabBar={(props) => <AnimatedTabBar {...props} cartCount={cartCount} />}
        >
            <Tab.Screen name="HomeTab" component={HomeTab} options={{ freezeOnBlur: false }} />
            <Tab.Screen name="CatalogTab" component={CatalogTab} options={{ freezeOnBlur: false }} />
            <Tab.Screen name="AITab" component={AITab} />
            <Tab.Screen name="CartTab" component={CartTab} options={{ freezeOnBlur: false }} />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileTab}
                initialParams={initialAuthMode ? { authMode: initialAuthMode } : undefined}
            />
        </Tab.Navigator>
    );
}

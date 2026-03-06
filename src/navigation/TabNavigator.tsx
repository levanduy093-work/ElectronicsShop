import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { AnimatedTabBar } from './AnimatedTabBar';
import { HomeTab, CatalogTab, AITab, CartTab, ProfileTab } from './tabs';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabNavigatorProps {
    cartCount?: number;
    initialAuthMode?: 'login' | 'register';
}

export function TabNavigator({ cartCount = 0, initialAuthMode }: TabNavigatorProps) {
    const initialRouteName: keyof RootTabParamList = initialAuthMode ? 'ProfileTab' : 'HomeTab';

    return (
        <Tab.Navigator
            initialRouteName={initialRouteName}
            detachInactiveScreens={true}
            screenOptions={{
                headerShown: false,
                animation: 'none',
                freezeOnBlur: true,
            }}
            tabBar={(props) => <AnimatedTabBar {...props} cartCount={cartCount} />}
        >
            <Tab.Screen name="HomeTab" component={HomeTab} />
            <Tab.Screen name="CatalogTab" component={CatalogTab} />
            <Tab.Screen name="AITab" component={AITab} />
            <Tab.Screen name="CartTab" component={CartTab} />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileTab}
                initialParams={initialAuthMode ? { authMode: initialAuthMode } : undefined}
            />
        </Tab.Navigator>
    );
}

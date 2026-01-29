import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { AnimatedTabBar } from './AnimatedTabBar';
import { HomeStack, CatalogStack, AIStack, CartStack, ProfileStack } from './stacks';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface RootNavigatorProps {
    cartCount?: number;
}

export function RootNavigator({ cartCount = 0 }: RootNavigatorProps) {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                // Disable animation between tabs for instant switching
                animation: 'none',
            }}
            tabBar={(props) => <AnimatedTabBar {...props} cartCount={cartCount} />}
        >
            <Tab.Screen name="HomeTab" component={HomeStack} />
            <Tab.Screen name="CatalogTab" component={CatalogStack} />
            <Tab.Screen name="AITab" component={AIStack} />
            <Tab.Screen name="CartTab" component={CartStack} />
            <Tab.Screen name="ProfileTab" component={ProfileStack} />
        </Tab.Navigator>
    );
}

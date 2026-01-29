import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { AnimatedTabBar } from './AnimatedTabBar';
import { HomeTab, CatalogTab, AITab, CartTab, ProfileTab } from './tabs';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabNavigatorProps {
    cartCount?: number;
}

export function TabNavigator({ cartCount = 0 }: TabNavigatorProps) {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'none',
            }}
            tabBar={(props) => <AnimatedTabBar {...props} cartCount={cartCount} />}
        >
            <Tab.Screen name="HomeTab" component={HomeTab} />
            <Tab.Screen name="CatalogTab" component={CatalogTab} />
            <Tab.Screen name="AITab" component={AITab} />
            <Tab.Screen name="CartTab" component={CartTab} />
            <Tab.Screen name="ProfileTab" component={ProfileTab} />
        </Tab.Navigator>
    );
}

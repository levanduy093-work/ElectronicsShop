import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../common/Icon';
import { Theme, lightTheme } from '../../lib/theme';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount?: number;
  theme?: Theme;
}

export function BottomNav({ currentTab, onTabChange, cartCount = 0, theme = lightTheme }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const TabButton = ({ 
    tab, 
    icon, 
    label, 
    isSpecial = false 
  }: { 
    tab: NavTab; 
    icon: string; 
    label: string; 
    isSpecial?: boolean;
  }) => {
    const isActive = currentTab === tab;
    const activeColor = theme.tabActive;
    const inactiveColor = theme.tabInactive;

    if (isSpecial) {
      return (
        <TouchableOpacity
          onPress={() => onTabChange(tab)}
          style={styles.specialButton}
          activeOpacity={0.7}
        >
          <View style={styles.specialIconContainer}>
            <AppIcon name="sparkles" size={28} color="#FFFFFF" />
          </View>
          <Text style={[styles.specialLabel, isActive && styles.specialLabelActive]}>
            AI Chat
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => onTabChange(tab)}
        style={styles.tabButton}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {tab === 'cart' && cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
          <AppIcon 
            name={icon} 
            size={24} 
            color={isActive ? activeColor : inactiveColor} 
          />
        </View>
        <Text style={[styles.tabLabel, isActive && { color: activeColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      { paddingBottom: Math.max(insets.bottom, 16), backgroundColor: theme.surface, borderTopColor: theme.border }
    ]}>
      <TabButton tab="home" icon="home" label="Home" />
      <TabButton tab="catalog" icon="grid" label="Danh mục" />
      <TabButton tab="ai" icon="sparkles" label="AI Chat" isSpecial />
      <TabButton tab="cart" icon="shopping-cart" label="Giỏ hàng" />
      <TabButton tab="profile" icon="user" label="Cá nhân" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    marginTop: -24,
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

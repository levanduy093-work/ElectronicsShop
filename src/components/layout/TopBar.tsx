import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../common/Icon';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
}

export function TopBar({ 
  title = "ElectroAI", 
  showSearch = true, 
  onSearchClick, 
  onFilterClick,
  onNotificationClick 
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={styles.leftSection}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>E</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {showSearch && (
          <TouchableOpacity
            onPress={onSearchClick}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <AppIcon name="search" size={22} color="#6B7280" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onNotificationClick}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <View style={styles.notificationContainer}>
            <AppIcon name="bell" size={22} color="#6B7280" />
            <View style={styles.notificationBadge} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

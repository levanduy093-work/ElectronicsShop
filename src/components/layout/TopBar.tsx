import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../common/Icon';
import { Theme, lightTheme, useTheme } from '../../lib/theme';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
  theme?: Theme;
  hasUnread?: boolean;
}

export function TopBar({ 
  title = "ElectroAI", 
  showSearch = true, 
  onSearchClick, 
  onFilterClick,
  onNotificationClick,
  theme = lightTheme,
  hasUnread = false,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const resolvedTheme = theme || ctxTheme;
  const topPadding = Math.max(insets.top, 0);

  return (
    <View style={[
      styles.container, 
      { paddingTop: topPadding, backgroundColor: resolvedTheme.surface, borderBottomColor: resolvedTheme.border }
    ]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image
            source={require('../../../logo_app.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: resolvedTheme.text }]}>{title}</Text>
        </View>
        
        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity
              onPress={onSearchClick}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <AppIcon name="search" size={22} color={resolvedTheme.muted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onNotificationClick}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <View style={styles.notificationContainer}>
              <AppIcon name="bell" size={22} color={resolvedTheme.muted} />
              {hasUnread && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: resolvedTheme.primary, borderColor: resolvedTheme.surface },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
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

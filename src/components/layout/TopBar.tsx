import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../common/Icon';
import { Theme, lightTheme, useTheme } from '../../theme';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
  onNewChat?: () => void;
  onHistoryClick?: () => void;
  theme?: Theme;

  hasUnread?: boolean;
  visible?: boolean;
}

function TopBarComponent({
  title = "ElectroAI",
  showSearch = true,
  onSearchClick,
  onFilterClick,
  onNotificationClick,
  onNewChat,
  onHistoryClick,
  theme = lightTheme,

  hasUnread = false,
  visible = true,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const resolvedTheme = theme || ctxTheme;
  const topPadding = Math.max(insets.top, 0);

  return (
    <View
      className="bg-white border-b border-gray-100 shadow-sm"
      style={[
        {
          paddingTop: visible ? topPadding : 0,
          backgroundColor: resolvedTheme.surface,
          borderBottomColor: resolvedTheme.border,
          opacity: visible ? 1 : 0,
          height: visible ? undefined : 0,
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
        }
      ]}
    >
      <View className="h-14 flex-row items-center px-4">
        <View
          className="flex-row items-center gap-3"
          style={{ flex: 1, minWidth: 0, marginRight: 8 }}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            className="w-8 h-8 rounded-lg"
            resizeMode="contain"
            fadeDuration={0}
            defaultSource={require('../../assets/images/logo.png')}
            onLoadEnd={() => { }}
          />
          <Text
            className="text-lg font-semibold tracking-tight text-gray-900"
            style={{ color: resolvedTheme.text, letterSpacing: -0.5, flexShrink: 1 }}
            numberOfLines={1}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.9}
          >
            {title}
          </Text>
        </View>

        <View className="flex-row items-center gap-3" style={{ flexShrink: 0 }}>
          {showSearch && (
            <TouchableOpacity
              onPress={onSearchClick}
              className="p-1"
              activeOpacity={0.7}
            >
              <AppIcon name="search" size={22} color={resolvedTheme.muted} />
            </TouchableOpacity>
          )}
          {onFilterClick && (
            <TouchableOpacity
              onPress={onFilterClick}
              className="p-1"
              activeOpacity={0.7}
            >
              <AppIcon name="filter" size={22} color={resolvedTheme.muted} />
            </TouchableOpacity>
          )}
          {onNewChat && (
            <TouchableOpacity
              onPress={onNewChat}
              className="w-8 h-8 rounded-full justify-center items-center p-0"
              style={{ backgroundColor: resolvedTheme.primary }}
              activeOpacity={0.8}
            >
              <AppIcon name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {onHistoryClick && (
            <TouchableOpacity
              onPress={onHistoryClick}
              className="p-1"
              activeOpacity={0.7}
            >
              <AppIcon name="history" size={22} color={resolvedTheme.muted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onNotificationClick}
            className="p-1"
            activeOpacity={0.7}
          >
            <View className="relative">
              <AppIcon name="bell" size={22} color={resolvedTheme.muted} />
              {hasUnread && (
                <View
                  className="absolute top-0 right-0 w-2 h-2 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: resolvedTheme.primary,
                    borderColor: resolvedTheme.surface
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const TopBar = memo(TopBarComponent);

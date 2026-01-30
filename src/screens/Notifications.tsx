import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';

interface NotificationsProps {
  onBack: () => void;
  theme?: Theme;
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'system' | string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function Notifications({
  onBack,
  theme,
  notifications,
  onMarkAllRead,
  onMarkRead,
  refreshing = false,
  onRefresh,
}: NotificationsProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleMarkAllAsRead = () => {
    onMarkAllRead?.();
    setExpandedId(null);
  };

  const handleToggleNotification = (notification: NotificationItem) => {
    if (!notification.read) {
      onMarkRead?.(notification.id);
    }
    setExpandedId(prev => (prev === notification.id ? null : notification.id));
  };

  const hasUnreadNotifications = notifications.some(notification => !notification.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <AppIcon name="package" size={20} color={t.primary} />;
      case 'promo': return <AppIcon name="tag" size={20} color="#F97316" />;
      case 'system': return <AppIcon name="info" size={20} color="#9333EA" />;
      default: return <AppIcon name="info" size={20} color={t.muted} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return t.primary + '22';
      case 'promo': return '#FFF7ED';
      case 'system': return '#FAF5FF';
      default: return t.surface;
    }
  };


  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor={t.surface}
        translucent={false}
      />
      <View
        className="flex-row items-center px-4 pb-4 border-b gap-4"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.surface,
          borderBottomColor: t.border,
          ...Platform.select({
            android: {
              elevation: 0,
            },
          }),
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-1" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1" style={{ color: t.text }}>{translate('notifications')}</Text>
        {hasUnreadNotifications && (
          <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7}>
            <Text className="text-sm font-medium" style={{ color: t.primary }}>{translate('mark_all_read')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh || (() => { })}
            tintColor={t.primary}
          />
        }
      >
        {notifications.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <View key={item.id} className="mb-3">
              <View
                className={`flex-row gap-4 p-4 rounded-2xl border z-10 ${item.read && !isExpanded ? '' : 'shadow-sm elevation-2'}`}
                style={{
                  backgroundColor: item.read && !isExpanded ? t.surface : t.card,
                  borderColor: item.read && !isExpanded ? 'transparent' : t.border,
                  shadowOpacity: t === lightTheme && (!item.read || isExpanded) ? 0.08 : 0,
                  elevation: t === lightTheme && (!item.read || isExpanded) ? 3 : 0,
                  ...(isExpanded ? { borderColor: '#E5E7EB', shadowOpacity: 0.12 } : {}),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleToggleNotification(item)}
                  className="flex-row gap-4 flex-1"
                >
                  <View className="w-12 h-12 rounded-full justify-center items-center" style={{ backgroundColor: getBgColor(item.type) }}>
                    {getIcon(item.type)}
                  </View>
                  <View className="flex-1 gap-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-sm font-semibold flex-1" style={{ color: isExpanded ? t.text : item.read ? t.muted : t.text }}>
                        {item.title}
                      </Text>
                      <View className="flex-row items-center gap-1 ml-2">
                        <Text className="text-[10px] ml-2" style={{ color: t.muted }}>{item.time}</Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e?.stopPropagation?.();
                            handleToggleNotification(item);
                          }}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          activeOpacity={0.8}
                        >
                          <AppIcon
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={t.muted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text
                      className={`text-sm leading-5 ${isExpanded ? 'mt-2' : ''}`}
                      style={{ color: isExpanded ? t.text : t.muted }}
                      numberOfLines={isExpanded ? undefined : 2}
                    >
                      {item.message}
                    </Text>
                  </View>
                  {!item.read && <View className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: t.primary }} />}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View className="items-center py-8">
          <Text className="text-xs" style={{ color: t.muted }}>{translate('all_notifications_viewed')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  InteractionManager,
  FlatList,
  StyleSheet,
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
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);

  const styles = useMemo(() => createStyles(t), [t]);

  const handleMarkAllAsRead = () => {
    setLocalReadIds(notifications.map((item) => item.id));
    setExpandedId(null);
    InteractionManager.runAfterInteractions(() => {
      try {
        onMarkAllRead?.();
      } catch (error) {
        console.warn('Notifications - mark all read threw error', error);
      }
    });
  };

  const handleToggleNotification = (notification: NotificationItem) => {
    setExpandedId((prev) => (prev === notification.id ? null : notification.id));

    if (!notification.read && !localReadIds.includes(notification.id)) {
      setLocalReadIds((prev) => [...prev, notification.id]);
      InteractionManager.runAfterInteractions(() => {
        try {
          onMarkRead?.(notification.id);
        } catch (error) {
          console.warn('Notifications - mark read threw error', error);
        }
      });
    }
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.read && !localReadIds.includes(notification.id)
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <AppIcon name="package" size={20} color={t.primary} />;
      case 'promo':
        return <AppIcon name="tag" size={20} color="#F97316" />;
      case 'system':
        return <AppIcon name="info" size={20} color="#9333EA" />;
      default:
        return <AppIcon name="info" size={20} color={t.muted} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order':
        return `${t.primary}22`;
      case 'promo':
        return '#FFF7ED';
      case 'system':
        return '#FAF5FF';
      default:
        return t.surface;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor={t.surface}
        translucent={false}
      />

      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 0),
            backgroundColor: t.surface,
            borderBottomColor: t.border,
          },
          Platform.select({
            android: { elevation: 0 },
          }),
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: t.text }]}>{translate('notifications')}</Text>

        {hasUnreadNotifications ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7}>
            <Text style={[styles.markAllText, { color: t.primary }]}>{translate('mark_all_read')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllPlaceholder} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const itemRead = item.read || localReadIds.includes(item.id);
          const isExpanded = expandedId === item.id;
          const showElevated = !itemRead || isExpanded;

          return (
            <View style={styles.cardWrap}>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => handleToggleNotification(item)}
                style={[
                  styles.card,
                  {
                    backgroundColor: itemRead && !isExpanded ? t.surface : t.card,
                    borderColor: itemRead && !isExpanded ? 'transparent' : t.border,
                  },
                  showElevated ? styles.cardElevated : null,
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: getBgColor(item.type) }]}>
                  {getIcon(item.type)}
                </View>

                <View style={styles.content}>
                  <View style={styles.rowBetween}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: isExpanded ? t.text : itemRead ? t.muted : t.text },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>

                    <View style={styles.timeWrap}>
                      <Text style={[styles.timeText, { color: t.muted }]}>{item.time}</Text>
                      <AppIcon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={t.muted} />
                    </View>
                  </View>

                  <Text
                    style={[styles.message, { color: isExpanded ? t.text : t.muted }, isExpanded ? styles.messageExpanded : null]}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {item.message}
                  </Text>
                </View>

                {!itemRead ? <View style={[styles.unreadDot, { backgroundColor: t.primary }]} /> : null}
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: t.muted }]}>{translate('all_notifications_viewed')}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh || (() => {})}
            tintColor={t.primary}
          />
        }
        extraData={{ expandedId, localReadIds }}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      columnGap: 12,
    },
    iconButton: {
      padding: 4,
    },
    title: {
      flex: 1,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '700',
    },
    markAllText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    markAllPlaceholder: {
      width: 8,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 96,
    },
    cardWrap: {
      marginBottom: 12,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      columnGap: 12,
    },
    cardElevated: {
      ...(Platform.OS === 'ios'
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.isDark ? 0 : 0.08,
            shadowRadius: 6,
          }
        : {
            elevation: 3,
          }),
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    content: {
      flex: 1,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 4,
      columnGap: 8,
    },
    itemTitle: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    timeWrap: {
      marginLeft: 8,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 2,
    },
    timeText: {
      fontSize: 10,
      lineHeight: 14,
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
    },
    messageExpanded: {
      marginTop: 6,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 8,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    footerText: {
      fontSize: 12,
      lineHeight: 16,
    },
  });
}

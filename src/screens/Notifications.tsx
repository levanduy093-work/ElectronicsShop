import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'} 
        backgroundColor={t.surface}
        translucent={false}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 0), backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>{translate('notifications')}</Text>
        {hasUnreadNotifications && (
          <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7}>
            <Text style={[styles.markAllRead, { color: t.primary }]}>{translate('mark_all_read')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh || (() => {})}
            tintColor={t.primary}
          />
        }
      >
        {notifications.map((item) => {
          const isExpanded = expandedId === item.id;
          
          return (
            <View key={item.id} style={styles.notificationCardWrapper}>
              <View
                style={[
                  styles.notificationCard,
                  isExpanded && styles.notificationCardExpanded,
                  item.read && !isExpanded && styles.notificationCardRead,
                  {
                    backgroundColor: item.read && !isExpanded ? t.surface : t.card,
                    borderColor: item.read && !isExpanded ? 'transparent' : t.border,
                    shadowOpacity: t === lightTheme && (!item.read || isExpanded) ? 0.08 : 0,
                    elevation: t === lightTheme && (!item.read || isExpanded) ? 3 : 0,
                  }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleToggleNotification(item)}
                  style={styles.cardContent}
                >
                  <View style={[styles.iconContainer, { backgroundColor: getBgColor(item.type) }]}>
                    {getIcon(item.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={[styles.notificationTitle, { color: isExpanded ? t.text : item.read ? t.muted : t.text }]}>
                        {item.title}
                      </Text>
                      <View style={styles.headerMeta}>
                        <Text style={[styles.notificationTime, { color: t.muted }]}>{item.time}</Text>
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
                      style={[
                        styles.notificationMessage,
                        { color: isExpanded ? t.text : t.muted },
                        isExpanded && styles.notificationMessageExpanded,
                      ]}
                      numberOfLines={isExpanded ? undefined : 2}
                    >
                      {item.message}
                    </Text>
                  </View>
                  {!item.read && <View style={[styles.unreadDot, { backgroundColor: t.primary }]} />}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.muted }]}>{translate('all_notifications_viewed')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 16,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  notificationCardWrapper: {
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  notificationCardExpanded: {
    borderColor: '#E5E7EB',
    shadowOpacity: 0.12,
  },
  notificationCardRead: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  notificationTitleRead: {
    color: '#6B7280',
  },
  notificationTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notificationMessageExpanded: {
    marginTop: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

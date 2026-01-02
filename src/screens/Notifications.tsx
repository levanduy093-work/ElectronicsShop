import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface NotificationsProps {
  onBack: () => void;
  theme?: Theme;
}

export function Notifications({ onBack, theme }: NotificationsProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const t = theme || ctxTheme || lightTheme;
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Giao hàng thành công',
      message: 'Đơn hàng #ORD-2024-001 đã được giao thành công. Vui lòng đánh giá sản phẩm nhé!',
      time: '2 giờ trước',
      read: false,
    },
    {
      id: 2,
      type: 'promo',
      title: 'Giảm 20% linh kiện Arduino',
      message: 'Duy nhất hôm nay! Nhập mã ARDUINO20 khi thanh toán.',
      time: '5 giờ trước',
      read: false,
    },
    {
      id: 3,
      type: 'system',
      title: 'Chào mừng đến với ElectroAI',
      message: 'Cảm ơn bạn đã tạo tài khoản. Khám phá ngay các tính năng AI độc đáo của chúng tôi.',
      time: '1 ngày trước',
      read: true,
    },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        read: true,
      }))
    );
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
        <Text style={[styles.title, { color: t.text }]}>Thông báo</Text>
        {hasUnreadNotifications && (
          <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7}>
            <Text style={[styles.markAllRead, { color: t.primary }]}>Đã đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {notifications.map((item) => (
          <View
            key={item.id}
            style={[
              styles.notificationCard,
              item.read && styles.notificationCardRead,
              { backgroundColor: item.read ? t.surface : t.card, borderColor: item.read ? 'transparent' : t.border, shadowOpacity: t === lightTheme && !item.read ? 0.05 : 0, elevation: t === lightTheme && !item.read ? 2 : 0 }
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: getBgColor(item.type) }]}>
              {getIcon(item.type)}
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, { color: item.read ? t.muted : t.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.notificationTime, { color: t.muted }]}>{item.time}</Text>
              </View>
              <Text style={[styles.notificationMessage, { color: t.muted }]} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: t.primary }]} />}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.muted }]}>Bạn đã xem hết thông báo</Text>
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
  notificationCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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

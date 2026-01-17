import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  RefreshControl,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';

interface NotificationsProps {
  onBack: () => void;
  theme?: Theme;
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
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

const SWIPE_THRESHOLD = 80;
const DELETE_BUTTON_WIDTH = 80;

export function Notifications({
  onBack,
  theme,
  notifications,
  onMarkAllRead,
  onMarkRead,
  onDelete,
  refreshing = false,
  onRefresh,
}: NotificationsProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const t = theme || ctxTheme || lightTheme;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const panResponders = useRef<Map<string, any>>(new Map());
  const translateX = useRef<Map<string, Animated.Value>>(new Map());
  const deleteButtonOpacity = useRef<Map<string, Animated.Value>>(new Map());

  // Cleanup removed notifications
  useEffect(() => {
    const currentIds = new Set(notifications.map(n => n.id));
    const storedIds = Array.from(translateX.current.keys());
    
    storedIds.forEach(id => {
      if (!currentIds.has(id)) {
        translateX.current.delete(id);
        deleteButtonOpacity.current.delete(id);
        panResponders.current.delete(id);
        if (swipedId === id) {
          setSwipedId(null);
        }
        if (expandedId === id) {
          setExpandedId(null);
        }
      }
    });
  }, [notifications, swipedId, expandedId]);

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

  const getPanResponder = (id: string) => {
    if (panResponders.current.has(id)) {
      return panResponders.current.get(id);
    }

    if (!translateX.current.has(id)) {
      translateX.current.set(id, new Animated.Value(0));
    }
    
    if (!deleteButtonOpacity.current.has(id)) {
      deleteButtonOpacity.current.set(id, new Animated.Value(0));
    }

    const pan = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        if (swipedId && swipedId !== id) {
          // Close other swiped items
          const otherTranslateX = translateX.current.get(swipedId);
          const otherOpacity = deleteButtonOpacity.current.get(swipedId);
          if (otherTranslateX && otherOpacity) {
            Animated.parallel([
              Animated.spring(otherTranslateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }),
              Animated.timing(otherOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
          setSwipedId(null);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          const currentTranslateX = translateX.current.get(id);
          const currentOpacity = deleteButtonOpacity.current.get(id);
          if (currentTranslateX && currentOpacity) {
            const swipeProgress = Math.min(Math.abs(gestureState.dx) / DELETE_BUTTON_WIDTH, 1);
            currentTranslateX.setValue(Math.max(gestureState.dx, -DELETE_BUTTON_WIDTH));
            currentOpacity.setValue(swipeProgress);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentTranslateX = translateX.current.get(id);
        const currentOpacity = deleteButtonOpacity.current.get(id);
        if (!currentTranslateX || !currentOpacity) return;

        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left enough to show delete button
          Animated.parallel([
            Animated.spring(currentTranslateX, {
              toValue: -DELETE_BUTTON_WIDTH,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.timing(currentOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
          setSwipedId(id);
        } else {
          // Spring back
          Animated.parallel([
            Animated.spring(currentTranslateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.timing(currentOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
          setSwipedId(null);
        }
      },
    });

    panResponders.current.set(id, pan);
    return pan;
  };

  const handleDelete = (id: string) => {
    // Hide delete button immediately
    setSwipedId(null);
    
    const currentTranslateX = translateX.current.get(id);
    const currentOpacity = deleteButtonOpacity.current.get(id);
    if (currentTranslateX && currentOpacity) {
      // Hide delete button and slide out animation
      Animated.parallel([
        Animated.timing(currentOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(currentTranslateX, {
          toValue: -Dimensions.get('window').width,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Delete notification after animation completes
        onDelete?.(id);
        translateX.current.delete(id);
        deleteButtonOpacity.current.delete(id);
        panResponders.current.delete(id);
      });
    } else {
      // Delete immediately if no animation
      onDelete?.(id);
    }
  };

  const handleCloseSwipe = (id: string) => {
    const currentTranslateX = translateX.current.get(id);
    const currentOpacity = deleteButtonOpacity.current.get(id);
    if (currentTranslateX && currentOpacity) {
      Animated.parallel([
        Animated.spring(currentTranslateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(currentOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setSwipedId(null);
    }
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
          // Ensure Animated.Value exists before getting panResponder
          if (!translateX.current.has(item.id)) {
            translateX.current.set(item.id, new Animated.Value(0));
          }
          if (!deleteButtonOpacity.current.has(item.id)) {
            deleteButtonOpacity.current.set(item.id, new Animated.Value(0));
          }
          const panResponder = getPanResponder(item.id);
          const currentTranslateX = translateX.current.get(item.id)!;
          const currentDeleteOpacity = deleteButtonOpacity.current.get(item.id)!;
          
          return (
            <View key={item.id} style={styles.swipeContainer}>
              {/* Delete Button Background */}
              <Animated.View 
                style={[
                  styles.deleteButtonContainer, 
                  { 
                    backgroundColor: '#EF4444',
                    opacity: currentDeleteOpacity,
                  }
                ]}
                pointerEvents={swipedId === item.id ? 'auto' : 'none'}
              >
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.8}
                >
                  <AppIcon name="trash" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </Animated.View>
              
              {/* Notification Card */}
              <Animated.View
                style={[
                  styles.notificationCard,
                  isExpanded && styles.notificationCardExpanded,
                  item.read && !isExpanded && styles.notificationCardRead,
                  {
                    backgroundColor: item.read && !isExpanded ? t.surface : t.card,
                    borderColor: item.read && !isExpanded ? 'transparent' : t.border,
                    shadowOpacity: t === lightTheme && (!item.read || isExpanded) ? 0.08 : 0,
                    elevation: t === lightTheme && (!item.read || isExpanded) ? 3 : 0,
                    transform: [{ translateX: currentTranslateX }],
                  }
                ]}
                {...panResponder.panHandlers}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    if (swipedId === item.id) {
                      handleCloseSwipe(item.id);
                    } else {
                      handleToggleNotification(item);
                    }
                  }}
                  style={styles.cardContent}
                  disabled={swipedId === item.id}
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
                            if (swipedId === item.id) {
                              handleCloseSwipe(item.id);
                            } else {
                              handleToggleNotification(item);
                            }
                          }}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          activeOpacity={0.8}
                          disabled={swipedId === item.id}
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
              </Animated.View>
            </View>
          );
        })}

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
  swipeContainer: {
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    gap: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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

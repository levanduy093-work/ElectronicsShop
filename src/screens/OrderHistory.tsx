import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface OrderHistoryProps {
  onBack: () => void;
  onViewDetail?: (orderId: string) => void;
  theme?: Theme;
}

export function OrderHistory({ onBack, onViewDetail, theme }: OrderHistoryProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const t = theme || ctxTheme || lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={t.surface}
        translucent={true}
      />
      <View style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.surface,
          borderBottomColor: t.border,
        }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>Đơn hàng của tôi</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={[styles.content, { backgroundColor: t.background }]}>
        <Text style={[styles.text, { color: t.muted }]}>Order History Screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { AppIcon } from '../components/common/Icon';

interface SettingsProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Settings({ onBack, isDarkMode, onToggleDarkMode }: SettingsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section: CHUNG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          <View style={styles.sectionCard}>
            {/* Dark Mode */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <AppIcon name="moon" size={18} color="#4B5563" />
                </View>
                <Text style={styles.settingLabel}>Chế độ tối</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={onToggleDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Language */}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <AppIcon name="globe" size={18} color="#4B5563" />
                </View>
                <Text style={styles.settingLabel}>Ngôn ngữ</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Tiếng Việt</Text>
                <AppIcon name="chevron-right" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: THÔNG BÁO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông báo</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <AppIcon name="bell" size={18} color="#4B5563" />
                </View>
                <Text style={styles.settingLabel}>Nhận thông báo đầy</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section: TÀI KHOẢN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <AppIcon name="lock" size={18} color="#4B5563" />
                </View>
                <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
              </View>
              <AppIcon name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
    marginRight: 16,
  },
});

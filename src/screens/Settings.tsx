import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, StatusBar, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { darkTheme, lightTheme } from '../theme';

interface SettingsProps {
  onBack: () => void;
  themeMode: 'light' | 'dark' | 'system';
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onChangePassword: () => void;
  onNavigateToLanguage?: () => void;
  theme?: any;
  isPushEnabled?: boolean;
  onTogglePush?: () => void;
  onResetOnboarding?: () => void;
}

export function Settings({
  onBack,
  themeMode,
  onThemeModeChange,
  onChangePassword,
  onNavigateToLanguage,
  isPushEnabled = true,
  onTogglePush,
  onResetOnboarding,
}: SettingsProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const isDarkMode = themeMode === 'system' 
    ? (systemColorScheme === 'dark')
    : themeMode === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [showThemeSelector, setShowThemeSelector] = React.useState(false);

  const handleChangeLanguage = () => {
    if (onNavigateToLanguage) {
      onNavigateToLanguage();
    }
  };

  const getThemeModeLabel = () => {
    if (themeMode === 'light') return t('light') || 'Sáng';
    if (themeMode === 'dark') return t('dark') || 'Tối';
    return t('system') || 'Theo hệ thống';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.surface}
        translucent={true}
      />
      <View style={[
        styles.header,
        { paddingTop: Math.max(insets.top, 0), backgroundColor: theme.surface, borderBottomColor: theme.border }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('settings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* Section: CHUNG */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t('general')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Theme Mode */}
            <TouchableOpacity 
              style={styles.settingItem} 
              activeOpacity={0.7}
              onPress={() => setShowThemeSelector(!showThemeSelector)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                  <AppIcon name="moon" size={18} color={theme.muted} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{t('darkMode')}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.muted }]}>
                  {getThemeModeLabel()}
                </Text>
                <AppIcon name={showThemeSelector ? 'chevron-up' : 'chevron-down'} size={18} color={theme.muted} />
              </View>
            </TouchableOpacity>

            {showThemeSelector && (
              <View style={[styles.themeSelector, { backgroundColor: theme.background }]}>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    themeMode === 'light' && { backgroundColor: theme === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onThemeModeChange('light');
                    setShowThemeSelector(false);
                  }}
                >
                  <Text style={[styles.themeOptionText, { color: themeMode === 'light' ? theme.primary : theme.text }]}>
                    {t('light') || 'Sáng'}
                  </Text>
                  {themeMode === 'light' && <AppIcon name="check" size={18} color={theme.primary} />}
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    themeMode === 'dark' && { backgroundColor: theme === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onThemeModeChange('dark');
                    setShowThemeSelector(false);
                  }}
                >
                  <Text style={[styles.themeOptionText, { color: themeMode === 'dark' ? theme.primary : theme.text }]}>
                    {t('dark') || 'Tối'}
                  </Text>
                  {themeMode === 'dark' && <AppIcon name="check" size={18} color={theme.primary} />}
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    themeMode === 'system' && { backgroundColor: theme === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onThemeModeChange('system');
                    setShowThemeSelector(false);
                  }}
                >
                  <Text style={[styles.themeOptionText, { color: themeMode === 'system' ? theme.primary : theme.text }]}>
                    {t('system') || 'Theo hệ thống'}
                  </Text>
                  {themeMode === 'system' && <AppIcon name="check" size={18} color={theme.primary} />}
                </TouchableOpacity>
              </View>
            )}

            {/* Language */}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={handleChangeLanguage}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                  <AppIcon name="globe" size={18} color={theme.muted} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{t('language')}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.muted }]}>
                   {i18n.language === 'en' ? t('english') : t('vietnamese')}
                </Text>
                <AppIcon name="chevron-right" size={18} color={theme.muted} />
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Reset Onboarding */}
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={onResetOnboarding}
              disabled={!onResetOnboarding}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                  <AppIcon name="refresh" size={18} color={theme.muted} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>{t('reset_onboarding')}</Text>
                  <Text style={[styles.settingSubtle, { color: theme.muted }]}>{t('reset_onboarding_desc')}</Text>
                </View>
              </View>
              <AppIcon name="chevron-right" size={18} color={theme.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: THÔNG BÁO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t('notifications')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                  <AppIcon name="bell" size={18} color={theme.muted} />
                </View>
                <View style={styles.settingLabelContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>{t('pushNotifications')}</Text>
                  <Text style={[styles.settingSubtle, { color: theme.muted }]}>
                    {t('push_notifications_description')}
                  </Text>
                </View>
              </View>
              <Switch
                value={isPushEnabled}
                onValueChange={onTogglePush}
                trackColor={{ false: '#E5E7EB', true: theme.primary }}
                thumbColor={isDarkMode ? '#F9FAFB' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Section: TÀI KHOẢN */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t('account')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={onChangePassword}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                  <AppIcon name="lock" size={18} color={theme.muted} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{t('changePassword')}</Text>
              </View>
              <AppIcon name="chevron-right" size={18} color={theme.muted} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  settingLabelContainer: {
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
  settingSubtle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
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
  settingSubtle: {
    fontSize: 12,
    marginTop: 2,
    color: '#6B7280',
  },
  themeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

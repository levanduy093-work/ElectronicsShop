import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StatusBar, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { BiometricIcon } from '../components/common/BiometricIcon';
import { darkTheme, lightTheme } from '../theme';
import { TYPO_CLASS } from '../theme/typography';
import {
  checkBiometricSupport,
  setBiometricEnabled,
  isBiometricLockEnabled,
  authenticateBiometric,
  type BiometricStatus
} from '../services/BiometricService';

interface SettingsProps {
  onBack: () => void;
  themeMode: 'light' | 'dark' | 'system';
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onChangePassword: () => void;
  onNavigateToLanguage?: () => void;
  theme?: any;
  isPushEnabled?: boolean;
  onTogglePush?: () => void;
  onBiometricChange?: (enabled: boolean) => void;
}

export function Settings({
  onBack,
  themeMode,
  onThemeModeChange,
  onChangePassword,
  onNavigateToLanguage,
  isPushEnabled = true,
  onTogglePush,
  onBiometricChange,
}: SettingsProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const isDarkMode = themeMode === 'system'
    ? (systemColorScheme === 'dark')
    : themeMode === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Biometric state
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLoadingBiometric, setIsLoadingBiometric] = useState(true);
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadBiometric = async () => {
      try {
        const [status, enabled] = await Promise.all([
          checkBiometricSupport(),
          isBiometricLockEnabled(),
        ]);
        if (!mounted) return;
        setBiometricStatus(status);
        setIsBiometricEnabled(enabled);
      } finally {
        if (mounted) setIsLoadingBiometric(false);
      }
    };
    loadBiometric();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBiometricToggle = async (enabled: boolean) => {
    if (isLoadingBiometric || isTogglingBiometric) return;
    setIsTogglingBiometric(true);
    if (enabled) {
      // Require biometric auth before enabling
      const authenticated = await authenticateBiometric('Xác thực để bật khóa sinh trắc học');
      if (!authenticated) {
        setIsTogglingBiometric(false);
        return; // Don't enable if auth failed
      }
    }
    try {
      setIsBiometricEnabled(enabled);
      await setBiometricEnabled(enabled);
      onBiometricChange?.(enabled);
    } finally {
      setIsTogglingBiometric(false);
    }
  };

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
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
        translucent={true}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b shadow-sm"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text className={`${TYPO_CLASS.screenTitle} flex-1 ml-2`} style={{ color: theme.text }}>{t('settings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1 p-4"
        style={{ backgroundColor: theme.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: CHUNG */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: theme.muted }}>{t('general')}</Text>
          <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            {/* Theme Mode */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              activeOpacity={0.7}
              onPress={() => setShowThemeSelector(!showThemeSelector)}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className="w-9 h-9 rounded-full justify-center items-center"
                  style={{ backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}
                >
                  <AppIcon name="moon" size={18} color={theme.muted} />
                </View>
                <Text className={TYPO_CLASS.bodyStrong} style={{ color: theme.text }}>{t('darkMode')}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className={TYPO_CLASS.helper} style={{ color: theme.muted }}>
                  {getThemeModeLabel()}
                </Text>
                <AppIcon name={showThemeSelector ? 'chevron-up' : 'chevron-down'} size={18} color={theme.muted} />
              </View>
            </TouchableOpacity>

            {showThemeSelector && (
              <View className="px-4 py-2" style={{ backgroundColor: theme.background }}>
                <TouchableOpacity
                  className="flex-row items-center justify-between py-3 px-4 rounded-lg"
                  style={themeMode === 'light' ? { backgroundColor: theme === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' } : undefined}
                  activeOpacity={0.7}
                  onPress={() => {
                    onThemeModeChange('light');
                    setShowThemeSelector(false);
                  }}
                >
                  <Text className={TYPO_CLASS.bodyStrong} style={{ color: themeMode === 'light' ? theme.primary : theme.text }}>
                    {t('light') || 'Sáng'}
                  </Text>
                  {themeMode === 'light' && <AppIcon name="check" size={18} color={theme.primary} />}
                </TouchableOpacity>
                <View className="h-px mx-4" style={{ backgroundColor: theme.border }} />
                <TouchableOpacity
                  className="flex-row items-center justify-between py-3 px-4 rounded-lg"
                  style={themeMode === 'dark' ? { backgroundColor: theme === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' } : undefined}
                  activeOpacity={0.7}
                  onPress={() => {
                    onThemeModeChange('dark');
                    setShowThemeSelector(false);
                  }}
                >
                  <Text className={TYPO_CLASS.bodyStrong} style={{ color: themeMode === 'dark' ? theme.primary : theme.text }}>
                    {t('dark') || 'Tối'}
                  </Text>
                  {themeMode === 'dark' && <AppIcon name="check" size={18} color={theme.primary} />}
                </TouchableOpacity>
                <View className="h-px mx-4" style={{ backgroundColor: theme.border }} />
                <TouchableOpacity
                  className="flex-row items-center justify-between py-3 px-4 rounded-lg"
                  style={themeMode === 'system' ? { backgroundColor: theme === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' } : undefined}
                  activeOpacity={0.7}
                  onPress={() => {
                    onThemeModeChange('system');
                    setShowThemeSelector(false);
                  }}
                >
                  <Text className={TYPO_CLASS.bodyStrong} style={{ color: themeMode === 'system' ? theme.primary : theme.text }}>
                    {t('system') || 'Theo hệ thống'}
                  </Text>
                  {themeMode === 'system' && <AppIcon name="check" size={18} color={theme.primary} />}
                </TouchableOpacity>
              </View>
            )}

            {/* Language */}
            <View className="h-px mx-4" style={{ backgroundColor: theme.border }} />
            <TouchableOpacity className="flex-row items-center justify-between p-4" activeOpacity={0.7} onPress={handleChangeLanguage}>
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-full justify-center items-center" style={{ backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}>
                  <AppIcon name="globe" size={18} color={theme.muted} />
                </View>
                <Text className={TYPO_CLASS.bodyStrong} style={{ color: theme.text }}>{t('language')}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className={TYPO_CLASS.helper} style={{ color: theme.muted }}>
                  {i18n.language === 'en' ? t('english') : t('vietnamese')}
                </Text>
                <AppIcon name="chevron-right" size={18} color={theme.muted} />
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* Section: THÔNG BÁO */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: theme.muted }}>{t('notifications')}</Text>
          <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-full justify-center items-center" style={{ backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}>
                  <AppIcon name="bell" size={18} color={theme.muted} />
                </View>
                <View className="flex-1">
                  <Text className={TYPO_CLASS.bodyStrong} style={{ color: theme.text }}>{t('pushNotifications')}</Text>
                  <Text className="text-xs font-medium mt-0.5" style={{ color: theme.muted }}>
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
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider mb-3 ml-2" style={{ color: theme.muted }}>{t('account')}</Text>
          <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <TouchableOpacity className="flex-row items-center justify-between p-4" activeOpacity={0.7} onPress={onChangePassword}>
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-full justify-center items-center" style={{ backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}>
                  <AppIcon name="lock" size={18} color={theme.muted} />
                </View>
                <Text className={TYPO_CLASS.bodyStrong} style={{ color: theme.text }}>{t('changePassword')}</Text>
              </View>
              <AppIcon name="chevron-right" size={18} color={theme.muted} />
            </TouchableOpacity>

            {/* Biometric Lock */}
            <>
              <View className="h-px mx-4" style={{ backgroundColor: theme.border }} />
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-9 h-9 rounded-full justify-center items-center" style={{ backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}>
                    <BiometricIcon
                      type={!isLoadingBiometric ? (biometricStatus?.biometryType || null) : null}
                      size={18}
                      color={theme.muted}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={TYPO_CLASS.bodyStrong} style={{ color: theme.text }}>
                      {!isLoadingBiometric && biometricStatus?.isSupported
                        ? (biometricStatus.biometryType === 'FaceID'
                          ? t('biometric_lock_faceid')
                          : t('biometric_lock_fingerprint'))
                        : t('biometric_lock')}
                    </Text>
                    <Text className="text-xs font-medium mt-0.5" style={{ color: theme.muted }}>
                      {!isLoadingBiometric && biometricStatus?.isSupported
                        ? t('biometric_lock_desc')
                        : (isLoadingBiometric ? t('biometric_lock_desc') : t('biometric_not_supported'))}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: '#E5E7EB', true: theme.primary }}
                  thumbColor={isDarkMode ? '#F9FAFB' : '#FFFFFF'}
                  disabled={isLoadingBiometric || isTogglingBiometric || !biometricStatus?.isSupported}
                />
              </View>
            </>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

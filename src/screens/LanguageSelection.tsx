import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { darkTheme, lightTheme } from '../theme';

interface LanguageSelectionProps {
  onBack: () => void;
  isDarkMode: boolean;
}

export function LanguageSelection({ onBack, isDarkMode }: LanguageSelectionProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const currentLanguage = i18n.language || 'vi';
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  ];

  const handleSelectLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleConfirm = () => {
    if (selectedLanguage !== currentLanguage) {
      i18n.changeLanguage(selectedLanguage);
    }
    onBack();
  };

  const hasChanges = selectedLanguage !== currentLanguage;


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
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: theme.text }}>{t('language')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text className="text-sm px-1 mb-6 leading-5" style={{ color: theme.muted }}>
          {t('selectLanguage') || 'Chọn ngôn ngữ bạn muốn sử dụng'}
        </Text>

        <View className="gap-3">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code || (selectedLanguage.startsWith(lang.code) && selectedLanguage.includes('-'));
            return (
              <TouchableOpacity
                key={lang.code}
                className="flex-row items-center justify-between p-4 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                activeOpacity={0.7}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className="w-12 h-12 rounded-full justify-center items-center"
                    style={{ backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }}
                  >
                    <Text className="text-2xl">{lang.flag}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-1" style={{ color: theme.text }}>{lang.name}</Text>
                    <Text className="text-sm" style={{ color: theme.muted }}>{lang.nativeName}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View className="w-7 h-7 rounded-full justify-center items-center" style={{ backgroundColor: theme.primary }}>
                    <AppIcon name="check" size={18} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View
        className="px-4 pt-4 border-t shadow-sm"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <TouchableOpacity
          className="w-full py-4 rounded-xl justify-center items-center"
          style={{
            backgroundColor: hasChanges ? theme.primary : theme.border,
            opacity: hasChanges ? 1 : 0.5,
          }}
          activeOpacity={0.7}
          onPress={handleConfirm}
          disabled={!hasChanges}
        >
          <Text className="text-base font-semibold" style={{ color: hasChanges ? '#FFFFFF' : theme.muted }}>
            {t('confirm') || 'Xác nhận'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

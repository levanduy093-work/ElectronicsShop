import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
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
        <Text style={[styles.title, { color: theme.text }]}>{t('language')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.background }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.description, { color: theme.muted }]}>
          {t('selectLanguage') || 'Chọn ngôn ngữ bạn muốn sử dụng'}
        </Text>

        <View style={styles.languageList}>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code || (selectedLanguage.startsWith(lang.code) && selectedLanguage.includes('-'));
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <View style={styles.languageLeft}>
                  <View style={[styles.flagContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                    <Text style={styles.flag}>{lang.flag}</Text>
                  </View>
                  <View style={styles.languageInfo}>
                    <Text style={[styles.languageName, { color: theme.text }]}>{lang.name}</Text>
                    <Text style={[styles.languageNativeName, { color: theme.muted }]}>{lang.nativeName}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkContainer, { backgroundColor: theme.primary }]}>
                    <AppIcon name="check" size={18} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={[
        styles.footer,
        { 
          paddingBottom: Math.max(insets.bottom, 16),
          backgroundColor: theme.surface,
          borderTopColor: theme.border
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              backgroundColor: hasChanges ? theme.primary : theme.border,
              opacity: hasChanges ? 1 : 0.5,
            }
          ]}
          activeOpacity={0.7}
          onPress={handleConfirm}
          disabled={!hasChanges}
        >
          <Text style={[styles.confirmButtonText, { color: hasChanges ? '#FFFFFF' : theme.muted }]}>
            {t('confirm') || 'Xác nhận'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  contentContainer: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    paddingHorizontal: 4,
    lineHeight: 20,
  },
  languageList: {
    gap: 12,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

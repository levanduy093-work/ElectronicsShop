import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { ContactOptions } from '../components/support/ContactOptions';
import { FAQList } from '../components/support/FAQList';
import { SupportModal, ModalType } from '../components/support/SupportModal';

interface SupportCenterProps {
  onBack: () => void;
  theme?: Theme;
}

export function SupportCenter({ onBack, theme }: SupportCenterProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const { showToast } = useToast();
  const t = theme || ctxTheme || lightTheme;
  const faqs = [
    { q: translate('supportQ1'), a: translate('supportA1') },
    { q: translate('supportQ2'), a: translate('supportA2') },
    { q: translate('supportQ3'), a: translate('supportA3') },
    { q: translate('supportQ4'), a: translate('supportA4') },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const openModal = (type: ModalType) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalType(null), 200);
  };

  const handleCall = () => {
    const phoneNumber = '0123456789';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      closeModal();
    });
    closeModal();
  };

  const handleSendEmail = () => {
    const email = 'levanduy.dev@gmail.com';
    Linking.openURL(`mailto:${email}`).catch(() => {
      closeModal();
    });
    closeModal();
  };

  const handleCopyPhone = () => {
    const phoneNumber = '0123456789';
    Clipboard.setString(phoneNumber);
    showToast('Đã sao chép số điện thoại', 'success');
  };


  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b shadow-sm"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.card,
          borderBottomColor: t.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: t.text }}>{translate('support_center')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 24, backgroundColor: t.background }}
        showsVerticalScrollIndicator={false}
      >
        <ContactOptions onOptionPress={openModal} theme={t} />

        <FAQList faqs={faqs} theme={t} />
      </ScrollView>

      <SupportModal
        visible={modalVisible}
        type={modalType}
        onClose={closeModal}
        onCopy={handleCopyPhone}
        onCall={handleCall}
        onEmail={handleSendEmail}
        theme={t}
      />
    </View>
  );
}

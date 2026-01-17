import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform, Linking, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';

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
  const [modalType, setModalType] = useState<'chat' | 'hotline' | 'email' | null>(null);
  const [modalAnimation] = useState(new Animated.Value(0));

  const openModal = (type: 'chat' | 'hotline' | 'email') => {
    setModalType(type);
    setModalVisible(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setModalType(null);
    });
  };

  const handleChatNow = () => {
    openModal('chat');
  };

  const handleHotline = () => {
    openModal('hotline');
  };

  const handleEmail = () => {
    openModal('email');
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

  const getModalContent = () => {
    switch (modalType) {
      case 'chat':
        return {
          icon: 'message-circle',
          iconColor: t.primary,
          iconBg: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)',
          title: translate('chat_now'),
          message: 'Số điện thoại Zalo',
          value: '0123456789',
          primaryButton: { text: 'Đóng', onPress: closeModal },
        };
      case 'hotline':
        return {
          icon: 'phone',
          iconColor: '#10B981',
          iconBg: t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.14)',
          title: translate('hotline'),
          message: 'Bạn có muốn gọi',
          value: '0123456789',
          primaryButton: { text: 'Gọi ngay', onPress: handleCall },
          secondaryButton: { text: 'Hủy', onPress: closeModal },
        };
      case 'email':
        return {
          icon: 'mail',
          iconColor: '#F97316',
          iconBg: t === lightTheme ? '#FED7AA' : 'rgba(249,115,22,0.14)',
          title: translate('email'),
          message: 'Bạn có muốn gửi email cho',
          value: 'levanduy.dev@gmail.com',
          primaryButton: { text: 'Gửi email', onPress: handleSendEmail },
          secondaryButton: { text: 'Hủy', onPress: closeModal },
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 0), backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>{translate('support_center')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Channels */}
        <View style={styles.contactGrid}>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]} 
            activeOpacity={0.7}
            onPress={handleChatNow}
          >
            <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }]}>
              <AppIcon name="message-circle" size={20} color={t.primary} />
            </View>
            <Text style={[styles.contactLabel, { color: t.text }]}>{translate('chat_now')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]} 
            activeOpacity={0.7}
            onPress={handleHotline}
          >
            <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.14)' }]}>
              <AppIcon name="phone" size={20} color="#10B981" />
            </View>
            <Text style={[styles.contactLabel, { color: t.text }]}>{translate('hotline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]} 
            activeOpacity={0.7}
            onPress={handleEmail}
          >
            <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#FED7AA' : 'rgba(249,115,22,0.14)' }]}>
              <AppIcon name="mail" size={20} color="#F97316" />
            </View>
            <Text style={[styles.contactLabel, { color: t.text }]}>{translate('email')}</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: t.text }]}>{translate('frequently_asked_questions')}</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} theme={t} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: t.card,
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            {modalContent && (
              <>
                <View style={[styles.modalIconContainer, { backgroundColor: modalContent.iconBg }]}>
                  <AppIcon name={modalContent.icon} size={32} color={modalContent.iconColor} />
                </View>
                <Text style={[styles.modalTitle, { color: t.text }]}>{modalContent.title}</Text>
                <Text style={[styles.modalMessage, { color: t.muted }]}>{modalContent.message}</Text>
                <View style={[styles.modalValueContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                  <Text style={[styles.modalValue, { color: t.text }]}>{modalContent.value}</Text>
                  {modalType === 'chat' && (
                    <TouchableOpacity
                      style={[styles.copyButton, { backgroundColor: modalContent.iconColor }]}
                      onPress={handleCopyPhone}
                      activeOpacity={0.8}
                    >
                      <AppIcon name="content-copy" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.modalButtons}>
                  {modalContent.secondaryButton && (
                    <TouchableOpacity
                      style={[styles.modalButtonSecondary, { borderColor: t.border }]}
                      onPress={modalContent.secondaryButton.onPress}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modalButtonSecondaryText, { color: t.text }]}>
                        {modalContent.secondaryButton.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalButtonPrimary, { backgroundColor: modalContent.iconColor }]}
                    onPress={modalContent.primaryButton.onPress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalButtonPrimaryText}>
                      {modalContent.primaryButton.text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function FAQItem({ question, answer, theme }: { question: string; answer: string; theme?: Theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme: ctxTheme } = useTheme();
  const t = theme || ctxTheme || lightTheme;

  return (
    <View style={[styles.faqCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={styles.faqHeader}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQuestion, { color: t.text }]}>{question}</Text>
        <AppIcon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={t.muted}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.faqAnswer, { borderTopColor: t.border }]}>
          <Text style={[styles.faqAnswerText, { color: t.muted }]}>{answer}</Text>
        </View>
      )}
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
    paddingBottom: 96,
    gap: 24,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  faqSection: {
    gap: 12,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalValueContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

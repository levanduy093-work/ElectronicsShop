import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';

interface SupportCenterProps {
  onBack: () => void;
  theme?: Theme;
}

export function SupportCenter({ onBack, theme }: SupportCenterProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const faqs = [
    { q: translate('supportQ1'), a: translate('supportA1') },
    { q: translate('supportQ2'), a: translate('supportA2') },
    { q: translate('supportQ3'), a: translate('supportA3') },
    { q: translate('supportQ4'), a: translate('supportA4') },
  ];

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
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]} activeOpacity={0.7}>
            <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }]}>
              <AppIcon name="message-circle" size={20} color={t.primary} />
            </View>
            <Text style={[styles.contactLabel, { color: t.text }]}>{translate('chat_now')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]} activeOpacity={0.7}>
            <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.14)' }]}>
              <AppIcon name="phone" size={20} color="#10B981" />
            </View>
            <Text style={[styles.contactLabel, { color: t.text }]}>{translate('hotline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]} activeOpacity={0.7}>
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
});

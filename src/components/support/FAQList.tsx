import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';

interface FAQItemProps {
    question: string;
    answer: string;
    theme: Theme;
}

const FAQItem = ({ question, answer, theme: t }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

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
};

interface FAQListProps {
    faqs: { q: string; a: string }[];
    theme: Theme;
}

export const FAQList: React.FC<FAQListProps> = ({ faqs, theme: t }) => {
    const { t: translate } = useTranslation();

    return (
        <View style={styles.faqSection}>
            <Text style={[styles.faqTitle, { color: t.text }]}>{translate('frequently_asked_questions')}</Text>
            <View style={styles.faqList}>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.q} answer={faq.a} theme={t} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    faqSection: {
        gap: 12,
    },
    faqTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        lineHeight: 20,
    },
});

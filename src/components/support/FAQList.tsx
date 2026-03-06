import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <View className="rounded-xl overflow-hidden border" style={{ backgroundColor: t.card, borderColor: t.border }}>
            <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                className="flex-row justify-between items-center p-4"
                activeOpacity={0.7}
            >
                <Text className="flex-1 text-sm font-medium" style={{ color: t.text }}>{question}</Text>
                <AppIcon
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={t.muted}
                />
            </TouchableOpacity>
            {isOpen && (
                <View className="px-4 pb-4 pt-3 border-t" style={{ borderTopColor: t.border }}>
                    <Text className="text-sm leading-5" style={{ color: t.muted }}>{answer}</Text>
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
        <View className="gap-3">
            <Text className="text-lg font-bold mb-3" style={{ color: t.text }}>{translate('frequently_asked_questions')}</Text>
            <View className="gap-3">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.q} answer={faq.a} theme={t} />
                ))}
            </View>
        </View>
    );
};

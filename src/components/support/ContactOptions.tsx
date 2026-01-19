import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme, lightTheme } from '../../theme';
import { ModalType } from './SupportModal';

interface ContactOptionsProps {
    onOptionPress: (type: ModalType) => void;
    theme: Theme;
}

export const ContactOptions: React.FC<ContactOptionsProps> = ({ onOptionPress, theme: t }) => {
    const { t: translate } = useTranslation();

    return (
        <View style={styles.contactGrid}>
            <TouchableOpacity
                style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]}
                activeOpacity={0.7}
                onPress={() => onOptionPress('chat')}
            >
                <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }]}>
                    <AppIcon name="message-circle" size={20} color={t.primary} />
                </View>
                <Text style={[styles.contactLabel, { color: t.text }]}>{translate('chat_now')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]}
                activeOpacity={0.7}
                onPress={() => onOptionPress('hotline')}
            >
                <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.14)' }]}>
                    <AppIcon name="phone" size={20} color="#10B981" />
                </View>
                <Text style={[styles.contactLabel, { color: t.text }]}>{translate('hotline')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.contactCard, { backgroundColor: t.card, borderColor: t.border }]}
                activeOpacity={0.7}
                onPress={() => onOptionPress('email')}
            >
                <View style={[styles.contactIcon, { backgroundColor: t === lightTheme ? '#FED7AA' : 'rgba(249,115,22,0.14)' }]}>
                    <AppIcon name="mail" size={20} color="#F97316" />
                </View>
                <Text style={[styles.contactLabel, { color: t.text }]}>{translate('email')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

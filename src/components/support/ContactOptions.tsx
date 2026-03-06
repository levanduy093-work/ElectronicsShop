import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <View className="flex-row gap-3">
            <TouchableOpacity
                className="flex-1 rounded-xl p-4 items-center border gap-2"
                style={{ backgroundColor: t.card, borderColor: t.border }}
                activeOpacity={0.7}
                onPress={() => onOptionPress('chat')}
            >
                <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }}>
                    <AppIcon name="message-circle" size={20} color={t.primary} />
                </View>
                <Text className="text-xs font-medium" style={{ color: t.text }}>{translate('chat_now')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 rounded-xl p-4 items-center border gap-2"
                style={{ backgroundColor: t.card, borderColor: t.border }}
                activeOpacity={0.7}
                onPress={() => onOptionPress('hotline')}
            >
                <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.14)' }}>
                    <AppIcon name="phone" size={20} color="#10B981" />
                </View>
                <Text className="text-xs font-medium" style={{ color: t.text }}>{translate('hotline')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 rounded-xl p-4 items-center border gap-2"
                style={{ backgroundColor: t.card, borderColor: t.border }}
                activeOpacity={0.7}
                onPress={() => onOptionPress('email')}
            >
                <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: t === lightTheme ? '#FED7AA' : 'rgba(249,115,22,0.14)' }}>
                    <AppIcon name="mail" size={20} color="#F97316" />
                </View>
                <Text className="text-xs font-medium" style={{ color: t.text }}>{translate('email')}</Text>
            </TouchableOpacity>
        </View>
    );
};

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { AppIcon } from '../common/Icon';
import { Theme, lightTheme } from '../../theme';
import { useTranslation } from 'react-i18next';

export type ModalType = 'chat' | 'hotline' | 'email';

interface SupportModalContent {
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    message: string;
    value: string;
    primaryButton: { text: string; onPress: () => void };
    secondaryButton?: { text: string; onPress: () => void };
}

interface SupportModalProps {
    visible: boolean;
    type: ModalType | null;
    onClose: () => void;
    onCopy: () => void;
    onCall: () => void;
    onEmail: () => void;
    theme: Theme;
}

export const SupportModal: React.FC<SupportModalProps> = ({
    visible,
    type,
    onClose,
    onCopy,
    onCall,
    onEmail,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const modalAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(modalAnimation, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(modalAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, modalAnimation]);

    const getModalContent = (): SupportModalContent | null => {
        switch (type) {
            case 'chat':
                return {
                    icon: 'message-circle',
                    iconColor: t.primary,
                    iconBg: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)',
                    title: translate('chat_now'),
                    message: 'Số điện thoại Zalo',
                    value: '0123456789',
                    primaryButton: { text: 'Đóng', onPress: onClose },
                };
            case 'hotline':
                return {
                    icon: 'phone',
                    iconColor: '#10B981',
                    iconBg: t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.14)',
                    title: translate('hotline'),
                    message: 'Bạn có muốn gọi',
                    value: '0123456789',
                    primaryButton: { text: 'Gọi ngay', onPress: onCall },
                    secondaryButton: { text: 'Hủy', onPress: onClose },
                };
            case 'email':
                return {
                    icon: 'mail',
                    iconColor: '#F97316',
                    iconBg: t === lightTheme ? '#FED7AA' : 'rgba(249,115,22,0.14)',
                    title: translate('email'),
                    message: 'Bạn có muốn gửi email cho',
                    value: 'levanduy.dev@gmail.com',
                    primaryButton: { text: 'Gửi email', onPress: onEmail },
                    secondaryButton: { text: 'Hủy', onPress: onClose },
                };
            default:
                return null;
        }
    };

    const content = getModalContent();

    if (!visible && !content) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center">
                <TouchableOpacity
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    className="w-[85%] max-w-[400px] rounded-3xl p-6 items-center"
                    style={[
                        {
                            backgroundColor: t.card,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8,
                        },
                        {
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
                    {content && (
                        <>
                            <View className="w-16 h-16 rounded-full justify-center items-center mb-4" style={{ backgroundColor: content.iconBg }}>
                                <AppIcon name={content.icon} size={32} color={content.iconColor} />
                            </View>
                            <Text className="text-xl font-bold mb-2 text-center" style={{ color: t.text }}>{content.title}</Text>
                            <Text className="text-sm text-center mb-4" style={{ color: t.muted }}>{content.message}</Text>
                            <View className="w-full p-4 rounded-xl border mb-6 flex-row items-center justify-between gap-3" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                                <Text className="text-base font-semibold flex-1 text-center" style={{ color: t.text }}>{content.value}</Text>
                                {type === 'chat' && (
                                    <TouchableOpacity
                                        className="w-10 h-10 rounded-[10px] justify-center items-center"
                                        style={{
                                            backgroundColor: content.iconColor,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }}
                                        onPress={onCopy}
                                        activeOpacity={0.8}
                                    >
                                        <AppIcon name="content-copy" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View className="w-full flex-row gap-3">
                                {content.secondaryButton && (
                                    <TouchableOpacity
                                        className="flex-1 py-3.5 rounded-xl border items-center"
                                        style={{ borderColor: t.border }}
                                        onPress={content.secondaryButton.onPress}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-base font-semibold" style={{ color: t.text }}>
                                            {content.secondaryButton.text}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    className="flex-1 py-3.5 rounded-xl items-center"
                                    style={{
                                        backgroundColor: content.iconColor,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    onPress={content.primaryButton.onPress}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-base font-semibold text-white">
                                        {content.primaryButton.text}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

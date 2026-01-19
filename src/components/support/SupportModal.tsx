import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet } from 'react-native';
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
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
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
                    {content && (
                        <>
                            <View style={[styles.modalIconContainer, { backgroundColor: content.iconBg }]}>
                                <AppIcon name={content.icon} size={32} color={content.iconColor} />
                            </View>
                            <Text style={[styles.modalTitle, { color: t.text }]}>{content.title}</Text>
                            <Text style={[styles.modalMessage, { color: t.muted }]}>{content.message}</Text>
                            <View style={[styles.modalValueContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                                <Text style={[styles.modalValue, { color: t.text }]}>{content.value}</Text>
                                {type === 'chat' && (
                                    <TouchableOpacity
                                        style={[styles.copyButton, { backgroundColor: content.iconColor }]}
                                        onPress={onCopy}
                                        activeOpacity={0.8}
                                    >
                                        <AppIcon name="content-copy" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.modalButtons}>
                                {content.secondaryButton && (
                                    <TouchableOpacity
                                        style={[styles.modalButtonSecondary, { borderColor: t.border }]}
                                        onPress={content.secondaryButton.onPress}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.modalButtonSecondaryText, { color: t.text }]}>
                                            {content.secondaryButton.text}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.modalButtonPrimary, { backgroundColor: content.iconColor }]}
                                    onPress={content.primaryButton.onPress}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalButtonPrimaryText}>
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

const styles = StyleSheet.create({
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

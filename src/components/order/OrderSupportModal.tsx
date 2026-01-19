import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { useToast } from '../../components/common/ToastProvider';

interface OrderSupportModalProps {
    visible: boolean;
    onClose: () => void;
    theme: Theme;
}

export const OrderSupportModal: React.FC<OrderSupportModalProps> = ({ visible, onClose, theme: t }) => {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(animation, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, animation]);

    const handleCopyPhone = () => {
        const phoneNumber = '0123456789';
        Clipboard.setString(phoneNumber);
        showToast('Đã sao chép số điện thoại', 'success');
    };

    const handleClose = () => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: t.card,
                            transform: [
                                {
                                    scale: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1],
                                    }),
                                },
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                            opacity: animation,
                        },
                    ]}
                >
                    <View style={[styles.modalIconContainer, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }]}>
                        <AppIcon name="message-circle" size={32} color={t.primary} />
                    </View>
                    <Text style={[styles.modalTitle, { color: t.text }]}>{translate('chat_now')}</Text>
                    <Text style={[styles.modalMessage, { color: t.muted }]}>Số điện thoại Zalo</Text>
                    <View style={[styles.modalValueContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                        <Text style={[styles.modalValue, { color: t.text }]}>0123456789</Text>
                        <TouchableOpacity
                            style={[styles.copyButton, { backgroundColor: t.primary }]}
                            onPress={handleCopyPhone}
                            activeOpacity={0.8}
                        >
                            <AppIcon name="content-copy" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.modalButtonPrimary, { backgroundColor: t.primary }]}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.modalButtonPrimaryText}>Đóng</Text>
                    </TouchableOpacity>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '80%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
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
        marginBottom: 16,
        textAlign: 'center',
    },
    modalValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        width: '100%',
        marginBottom: 24,
    },
    modalValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    copyButton: {
        padding: 8,
        borderRadius: 8,
    },
    modalButtonPrimary: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonPrimaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

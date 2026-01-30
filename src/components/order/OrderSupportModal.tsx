import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
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
            <View className="flex-1 justify-center items-center bg-black/50">
                <TouchableOpacity
                    className="absolute inset-0"
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <Animated.View
                    className="w-4/5 rounded-3xl p-6 items-center shadow-lg"
                    style={{
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
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 8,
                    }}
                >
                    <View className="w-16 h-16 rounded-full justify-center items-center mb-4" style={{ backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }}>
                        <AppIcon name="message-circle" size={32} color={t.primary} />
                    </View>
                    <Text className="text-xl font-bold mb-2 text-center" style={{ color: t.text }}>{translate('chat_now')}</Text>
                    <Text className="text-sm mb-4 text-center" style={{ color: t.muted }}>Số điện thoại Zalo</Text>
                    <View className="flex-row items-center justify-between px-4 py-3 rounded-xl border w-full mb-6" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <Text className="text-base font-bold" style={{ color: t.text }}>0123456789</Text>
                        <TouchableOpacity
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: t.primary }}
                            onPress={handleCopyPhone}
                            activeOpacity={0.8}
                        >
                            <AppIcon name="content-copy" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        className="w-full py-3 rounded-xl items-center"
                        style={{ backgroundColor: t.primary }}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-base font-bold">Đóng</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

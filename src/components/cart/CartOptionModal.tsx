import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';

interface CartOptionModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    selectedOption: string | undefined;
    onSelect: (option: string) => void;
    theme: Theme;
}

export const CartOptionModal: React.FC<CartOptionModalProps> = ({
    visible,
    onClose,
    title,
    options,
    selectedOption,
    onSelect,
    theme: t,
}) => {
    const accentBg = t === lightTheme ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.08)';
    const accentBorder = t === lightTheme ? '#2563EB' : t.primary;
    const overlayBg = t === lightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-end"
                style={{ backgroundColor: overlayBg }}
            >
                <View
                    className="rounded-t-3xl max-h-[70%] pb-5"
                    style={{ backgroundColor: t.card }}
                >
                    <View
                        className="flex-row justify-between items-center p-5 border-b"
                        style={{ borderBottomColor: t.border }}
                    >
                        <Text className="text-lg font-bold" style={{ color: t.text }}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-1"
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="max-h-[400px]">
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => onSelect(option)}
                                className="flex-row justify-between items-center p-4 mx-4 my-1.5 rounded-xl border"
                                style={{
                                    backgroundColor: selectedOption === option ? accentBg : t.surface,
                                    borderColor: selectedOption === option ? accentBorder : t.border,
                                }}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className="text-base"
                                    style={{
                                        color: selectedOption === option ? accentBorder : t.text,
                                        fontWeight: selectedOption === option ? '600' : '400',
                                    }}
                                >
                                    {option}
                                </Text>
                                {selectedOption === option && (
                                    <AppIcon name="check" size={20} color={accentBorder} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
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
            <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
                <View style={[styles.modalContent, { backgroundColor: t.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: t.text }]}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.modalCloseButton}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScrollView}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => onSelect(option)}
                                style={[
                                    styles.modalOptionItem,
                                    {
                                        backgroundColor: selectedOption === option ? accentBg : t.surface,
                                        borderColor: selectedOption === option ? accentBorder : t.border,
                                    }
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    {
                                        color: selectedOption === option ? accentBorder : t.text,
                                        fontWeight: selectedOption === option ? '600' : '400',
                                    }
                                ]}>
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

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalScrollView: {
        maxHeight: 400,
    },
    modalOptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    modalOptionText: {
        fontSize: 16,
    },
});

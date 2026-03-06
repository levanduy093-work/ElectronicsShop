import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';
import { TEXT_INPUT_LARGE_STYLE, TYPO_CLASS } from '../../theme/typography';
import { LocationOption } from '../../services/locations';

const normalizeText = (text: string) =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

interface LocationSelectModalProps {
    visible: boolean;
    title: string;
    options: LocationOption[];
    onClose: () => void;
    onSelect: (option: LocationOption) => void;
    theme: Theme;
    loading?: boolean;
}

export function LocationSelectModal({
    visible,
    title,
    options,
    onClose,
    onSelect,
    theme,
    loading,
}: LocationSelectModalProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (visible) setQuery('');
    }, [visible]);

    const filtered = useMemo(() => {
        const q = normalizeText(query);
        if (!q) return options;
        return options.filter(opt => {
            const base = normalizeText(opt.name);
            const codeName = opt.codename ? normalizeText(opt.codename) : '';
            return base.includes(q) || codeName.includes(q);
        });
    }, [options, query]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                className="flex-1 justify-end"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="max-h-[70%] rounded-t-2xl p-4 gap-3" style={{ backgroundColor: theme.card }}>
                    <View className="flex-row items-center justify-between">
                        <Text className={TYPO_CLASS.sectionTitle} style={{ color: theme.text }}>{title}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1" activeOpacity={0.7}>
                            <AppIcon name="close" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <View className="gap-2 mb-3">
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={t('search')}
                            placeholderTextColor={theme.muted}
                            className="rounded-xl px-4 border text-base"
                            style={{
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                                color: theme.text,
                                height: 46,
                                ...TEXT_INPUT_LARGE_STYLE,
                            }}
                        />
                    </View>
                    {loading ? (
                        <View className="items-center py-4 gap-2">
                            <ActivityIndicator color={theme.primary} />
                            <Text className="text-sm" style={{ color: theme.muted }}>{t('loading')}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => `${item.code}`}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                    className="py-3 border-b"
                                    style={{ borderColor: theme.border }}
                                    activeOpacity={0.7}
                                    >
                                        <Text className={TYPO_CLASS.body} style={{ color: theme.text }}>{item.name}</Text>
                                    </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text className="text-center py-4 text-sm" style={{ color: theme.muted }}>{t('no_results')}</Text>
                            }
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

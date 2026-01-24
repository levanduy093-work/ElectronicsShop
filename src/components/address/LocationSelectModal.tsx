import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';
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
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalClose} activeOpacity={0.7}>
                            <AppIcon name="close" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.inputGroup, { marginBottom: 12 }]}>
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={t('search')}
                            placeholderTextColor={theme.muted}
                            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                        />
                    </View>
                    {loading ? (
                        <View style={styles.modalLoading}>
                            <ActivityIndicator color={theme.primary} />
                            <Text style={[styles.loadingText, { color: theme.muted }]}>{t('loading')}</Text>
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
                                    style={[styles.optionRow, { borderColor: theme.border }]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.optionText, { color: theme.text }]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: theme.muted }]}>{t('no_results')}</Text>
                            }
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        maxHeight: '70%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        gap: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalClose: {
        padding: 4,
    },
    inputGroup: {
        gap: 8,
    },
    input: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        fontSize: 14,
    },
    modalLoading: {
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
    },
    optionRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 16,
        fontSize: 14,
    },
});

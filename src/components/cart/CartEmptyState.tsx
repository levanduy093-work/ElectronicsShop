import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';

interface CartEmptyStateProps {
    onExplore?: () => void;
    theme: Theme;
}

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({ onExplore, theme: t }) => {
    const { t: translate } = useTranslation();

    return (
        <View style={[styles.emptyContainer, { backgroundColor: t.background }]}>
            <View style={[styles.emptyIcon, { backgroundColor: t.surface }]}>
                <AppIcon name="shopping-cart" size={32} color={t.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: t.text }]}>{translate('cart_empty_title')}</Text>
            <Text style={[styles.emptyText, { color: t.muted }]}>{translate('cart_empty_text')}</Text>
            <TouchableOpacity
                onPress={onExplore}
                style={[styles.exploreButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
                activeOpacity={0.8}
            >
                <Text style={styles.exploreButtonText}>{translate('explore_products')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 16,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    exploreButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});

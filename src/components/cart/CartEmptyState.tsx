import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
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
        <View
            className="flex-1 justify-center items-center px-8 pt-4"
            style={{ backgroundColor: t.background }}
        >
            <View
                className="w-20 h-20 rounded-full justify-center items-center mb-6"
                style={{ backgroundColor: t.surface }}
            >
                <AppIcon name="shopping-cart" size={32} color={t.muted} />
            </View>
            <Text
                className="text-xl font-bold mb-2"
                style={{ color: t.text }}
            >
                {translate('cart_empty_title')}
            </Text>
            <Text
                className="text-sm text-center mb-8"
                style={{ color: t.muted }}
            >
                {translate('cart_empty_text')}
            </Text>
            <TouchableOpacity
                onPress={onExplore}
                className="px-6 py-3 rounded-xl shadow-lg"
                style={{
                    backgroundColor: t.primary,
                    ...Platform.select({
                        ios: {
                            shadowColor: t.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                        },
                        android: {
                            elevation: 4,
                        },
                    }),
                }}
                activeOpacity={0.8}
            >
                <Text className="text-white text-sm font-medium">{translate('explore_products')}</Text>
            </TouchableOpacity>
        </View>
    );
};

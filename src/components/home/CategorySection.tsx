import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Category } from '../../types';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';
import { CATEGORIES } from '../../constants/data';

interface CategorySectionProps {
    categories: Category[];
    onSelectCategory: (category: string) => void;
    onNavigate: (tab: string) => void;
    theme: Theme;
}

const CategoryPill = ({
    item,
    theme,
    onPress
}: {
    item: Category;
    theme: Theme;
    onPress: () => void;
}) => {
    return (
        <TouchableOpacity
            className="items-center w-20 gap-2"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                className="w-16 h-16 rounded-2xl justify-center items-center"
                style={{ backgroundColor: theme.card }}
            >
                <AppIcon
                    name={item.icon || 'package-variant'}
                    size={24}
                    color={theme.primary}
                />
            </View>
            <Text
                className="text-xs font-medium text-center w-full"
                style={{ color: theme.text }}
                numberOfLines={2}
                adjustsFontSizeToFit={false}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );
};

export const CategorySection: React.FC<CategorySectionProps> = ({
    categories,
    onSelectCategory,
    onNavigate,
    theme
}) => {
    const { t } = useTranslation();

    // Use passed categories or fallback to constant
    const displayCategories = categories.length > 0 ? categories : CATEGORIES;

    return (
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
                <Text
                    className="text-lg font-bold"
                    style={{ color: theme.text }}
                >
                    {t('categories')}
                </Text>
                <TouchableOpacity
                    onPress={() => onNavigate('catalog')}
                    className="flex-row items-center gap-1"
                    activeOpacity={0.7}
                >
                    <Text
                        className="text-sm font-medium"
                        style={{ color: theme.primary }}
                    >
                        {t('see_all')}
                    </Text>
                    <AppIcon name="chevron-right" size={16} color={theme.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16, gap: 16 }}
            >
                {displayCategories.length > 0 ? (
                    displayCategories.map((cat) => (
                        <CategoryPill
                            key={cat.id}
                            item={cat}
                            theme={theme}
                            onPress={() => {
                                onSelectCategory(cat.name);
                            }}
                        />
                    ))
                ) : (
                    <View className="py-4 px-4">
                        <Text
                            className="text-sm"
                            style={{ color: theme.muted }}
                        >
                            {t('no_categories')}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

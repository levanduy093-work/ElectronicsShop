import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
            style={styles.categoryItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.categoryIcon, { backgroundColor: theme.card }]}>
                <AppIcon
                    name={item.icon || 'package-variant'}
                    size={24}
                    color={theme.primary}
                />
            </View>
            <Text
                style={[styles.categoryName, { color: theme.text }]}
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
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('categories')}</Text>
                <TouchableOpacity
                    onPress={() => onNavigate('catalog')}
                    style={styles.seeAllButton}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.seeAllText, { color: theme.primary }]}>{t('see_all')}</Text>
                    <AppIcon name="chevron-right" size={16} color={theme.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
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
                    <View style={styles.emptyCategoriesContainer}>
                        <Text style={[styles.emptyCategoriesText, { color: theme.muted }]}>
                            {t('no_categories')}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoriesContainer: {
        paddingRight: 16,
        gap: 16,
    },
    categoryItem: {
        alignItems: 'center',
        width: 80,
        gap: 8,
    },
    categoryIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        width: '100%',
        flexWrap: 'wrap',
    },
    emptyCategoriesContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    emptyCategoriesText: {
        fontSize: 14,
    },
});

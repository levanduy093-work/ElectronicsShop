import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';

interface FilterScreenProps {
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters?: {
    priceRange: [number, number];
    rating: number | null;
    onlyInStock: boolean;
    categories: string[];
  };
  getFilteredCount?: (filters: any) => number;
  theme?: Theme;
  categories?: string[];
}

export function FilterScreen({ onClose, onApply, currentFilters, getFilteredCount, theme, categories = [] }: FilterScreenProps) {
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const insets = useSafeAreaInsets();
  const PRICE_MIN = 0;
  const PRICE_MAX = 10000000;
  const [priceMinInput, setPriceMinInput] = useState(
    currentFilters?.priceRange?.[0]?.toString() || '0'
  );
  const [priceMaxInput, setPriceMaxInput] = useState(
    currentFilters?.priceRange?.[1]?.toString() || PRICE_MAX.toString()
  );
  const [rating, setRating] = useState<number | null>(currentFilters?.rating || null);
  const [onlyInStock, setOnlyInStock] = useState(currentFilters?.onlyInStock || false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters?.categories || []);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filteredCount, setFilteredCount] = useState(12);
  
  // Calculate filtered count whenever filters change
  useEffect(() => {
    if (getFilteredCount) {
      const parsedMin = parseInt(priceMinInput || `${PRICE_MIN}`, 10);
      const parsedMax = parseInt(priceMaxInput || `${PRICE_MAX}`, 10);
      const safeMin = Number.isNaN(parsedMin) ? PRICE_MIN : parsedMin;
      const safeMax = Number.isNaN(parsedMax) ? PRICE_MAX : parsedMax;
      const [finalMin, finalMax] = safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];
      
      const count = getFilteredCount({
        priceRange: [finalMin, finalMax],
        rating,
        onlyInStock,
        categories: selectedCategories,
      });
      setFilteredCount(count);
    }
  }, [priceMinInput, priceMaxInput, rating, onlyInStock, selectedCategories, getFilteredCount]);


  const handleApply = () => {
    const parsedMin = parseInt(priceMinInput || `${PRICE_MIN}`, 10);
    const parsedMax = parseInt(priceMaxInput || `${PRICE_MAX}`, 10);
    const safeMin = Number.isNaN(parsedMin) ? PRICE_MIN : parsedMin;
    const safeMax = Number.isNaN(parsedMax) ? PRICE_MAX : parsedMax;
    const [finalMin, finalMax] = safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];

    onApply({
      priceRange: [finalMin, finalMax],
      rating,
      onlyInStock,
      categories: selectedCategories,
    });
    onClose();
  };

  const handleReset = () => {
    setPriceMinInput('0');
    setPriceMaxInput(PRICE_MAX.toString());
    setRating(null);
    setOnlyInStock(false);
    setSelectedCategories([]);
    setShowAllCategories(false);
    // Apply reset filters immediately
    onApply({
      priceRange: [PRICE_MIN, PRICE_MAX],
      rating: null,
      onlyInStock: false,
      categories: [],
    });
  };

  const sanitizePrice = (value: string) => value.replace(/\D/g, '');
  const formatNumber = (value: string) => {
    if (!value) return '';
    const num = Number(value);
    if (Number.isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: t.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12), backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
          <AppIcon name="close" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>{translate('search_filter')}</Text>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
          <Text style={[styles.resetText, { color: t.primary }]}>{translate('clear_all') || translate('reset')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: t.background }]} showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.muted }]}>{translate('price_range')}</Text>
          <View style={styles.priceContainer}>
            <View style={[styles.priceInput, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[styles.priceLabel, { color: t.muted }]}>{translate('minimum')}</Text>
              <View style={styles.priceFieldRow}>
                <TextInput
                  value={formatNumber(priceMinInput)}
                  onChangeText={(val) => setPriceMinInput(sanitizePrice(val))}
                  placeholder="0"
                  placeholderTextColor={t.muted}
                  keyboardType="numeric"
                  style={[styles.priceValue, { color: t.text }]}
                />
                <Text style={[styles.currency, { color: t.muted }]}>₫</Text>
              </View>
            </View>
            <View style={styles.priceDivider} />
            <View style={[styles.priceInput, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[styles.priceLabel, { color: t.muted }]}>{translate('maximum')}</Text>
              <View style={styles.priceFieldRow}>
                <TextInput
                  value={formatNumber(priceMaxInput)}
                  onChangeText={(val) => setPriceMaxInput(sanitizePrice(val))}
                  placeholder={formatNumber(PRICE_MAX.toString())}
                  placeholderTextColor={t.muted}
                  keyboardType="numeric"
                  style={[styles.priceValue, { color: t.text }]}
                />
                <Text style={[styles.currency, { color: t.muted }]}>₫</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: t.muted }]}>{translate('categories')}</Text>
              {categories.length > 6 && (
                <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)} activeOpacity={0.7}>
                  <Text style={[styles.sectionAction, { color: t.primary }]}>
                    {showAllCategories ? translate('collapse') : translate('see_more')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.categoryChips}>
              {(showAllCategories ? categories : categories.slice(0, 6)).map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setSelectedCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      );
                    }}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? t.primary : t.surface,
                        borderColor: isSelected ? t.primary : t.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#FFFFFF' : t.text }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Rating */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.muted }]}>{translate('ratings')}</Text>
          <View style={styles.ratingContainer}>
            {[5, 4, 3].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(rating === star ? null : star)}
                style={styles.ratingOption}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  rating === star && styles.checkboxSelected,
                  { borderColor: rating === star ? t.primary : t.border, backgroundColor: rating === star ? t.primary : 'transparent' },
                ]}>
                  {rating === star && <AppIcon name="check" size={12} color="#FFFFFF" />}
                </View>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <AppIcon
                      key={i}
                      name="star"
                      size={16}
                      color={i < star ? "#FBBF24" : t.border}
                    />
                  ))}
                  <Text style={[styles.ratingText, { color: t.text }]}>{translate('and_up')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.muted }]}>{translate('other')}</Text>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: t.text }]}>{translate('only_in_stock_products')}</Text>
            <Switch
              value={onlyInStock}
              onValueChange={setOnlyInStock}
              trackColor={{ false: t.border, true: t.primary }}
              thumbColor={t.surface}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: t.surface, borderTopColor: t.border }]}>
        <TouchableOpacity
          onPress={handleApply}
          style={[styles.applyButton, { backgroundColor: t.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>{translate('apply_with_results', { count: filteredCount })}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6B7280',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  priceFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currency: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceDivider: {
    width: 16,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingContainer: {
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

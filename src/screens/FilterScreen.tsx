import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
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
      className="flex-1"
      style={{ backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        className="flex-row items-center justify-between px-4 pb-4 border-b"
        style={{
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: t.surface,
          borderBottomColor: t.border
        }}
      >
        <TouchableOpacity onPress={onClose} className="p-2" activeOpacity={0.7}>
          <AppIcon name="close" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: t.text }}>{translate('search_filter')}</Text>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
          <Text className="text-base font-medium" style={{ color: t.primary }}>{translate('clear_all') || translate('reset')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" style={{ backgroundColor: t.background }} showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <View className="mb-8">
          <Text className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: t.muted }}>{translate('price_range')}</Text>
          <View className="flex-row items-center gap-4 mb-4">
            <View className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <Text className="text-sm mb-1" style={{ color: t.muted }}>{translate('minimum')}</Text>
              <View className="flex-row items-center gap-1.5">
                <TextInput
                  value={formatNumber(priceMinInput)}
                  onChangeText={(val) => setPriceMinInput(sanitizePrice(val))}
                  placeholder="0"
                  placeholderTextColor={t.muted}
                  keyboardType="numeric"
                  className="text-lg font-medium p-0"
                  style={{ color: t.text }}
                />
                <Text className="text-base" style={{ color: t.muted }}>₫</Text>
              </View>
            </View>
            <View className="w-4 h-0.5" style={{ backgroundColor: '#D1D5DB' }} />
            <View className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
              <Text className="text-sm mb-1" style={{ color: t.muted }}>{translate('maximum')}</Text>
              <View className="flex-row items-center gap-1.5">
                <TextInput
                  value={formatNumber(priceMaxInput)}
                  onChangeText={(val) => setPriceMaxInput(sanitizePrice(val))}
                  placeholder={formatNumber(PRICE_MAX.toString())}
                  placeholderTextColor={t.muted}
                  keyboardType="numeric"
                  className="text-lg font-medium p-0"
                  style={{ color: t.text }}
                />
                <Text className="text-base" style={{ color: t.muted }}>₫</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: t.muted }}>{translate('categories')}</Text>
              {categories.length > 6 && (
                <TouchableOpacity onPress={() => setShowAllCategories(!showAllCategories)} activeOpacity={0.7}>
                  <Text className="text-base font-semibold" style={{ color: t.primary }}>
                    {showAllCategories ? translate('collapse') : translate('see_more')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
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
                    className="px-3 py-2 rounded-2xl border"
                    style={{
                      backgroundColor: isSelected ? t.primary : t.surface,
                      borderColor: isSelected ? t.primary : t.border,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-semibold" style={{ color: isSelected ? '#FFFFFF' : t.text }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Rating */}
        <View className="mb-8">
          <Text className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: t.muted }}>{translate('ratings')}</Text>
          <View className="gap-2">
            {[5, 4, 3].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(rating === star ? null : star)}
                className="flex-row items-center py-2 gap-3"
                activeOpacity={0.7}
              >
                <View
                  className="w-6 h-6 rounded border-2 justify-center items-center"
                  style={{
                    borderColor: rating === star ? t.primary : t.border,
                    backgroundColor: rating === star ? t.primary : 'transparent'
                  }}
                >
                  {rating === star && <AppIcon name="check" size={14} color="#FFFFFF" />}
                </View>
                <View className="flex-row items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <AppIcon
                      key={i}
                      name="star"
                      size={20}
                      color={i < star ? "#FBBF24" : t.border}
                    />
                  ))}
                  <Text className="text-base ml-2" style={{ color: t.text }}>{translate('and_up')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Options */}
        <View className="mb-8">
          <Text className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: t.muted }}>{translate('other')}</Text>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-base font-medium" style={{ color: t.text }}>{translate('only_in_stock_products')}</Text>
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
      <View
        className="p-4 border-t"
        style={{
          backgroundColor: t.surface,
          borderTopColor: t.border,
          paddingBottom: 30
        }}
      >
        <TouchableOpacity
          onPress={handleApply}
          className="rounded-xl py-3.5 items-center"
          style={{ backgroundColor: t.primary }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">{translate('apply_with_results', { count: filteredCount })}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, PanResponder } from 'react-native';
import { CATEGORIES } from '../lib/data';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';

interface FilterScreenProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}

export function FilterScreen({ onClose, onApply }: FilterScreenProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  const handleApply = () => {
    onApply({
      priceRange,
      categories: selectedCategories,
      rating,
      onlyInStock,
    });
    onClose();
  };

  const handleReset = () => {
    setPriceRange([0, 5000000]);
    setSelectedCategories([]);
    setRating(null);
    setOnlyInStock(false);
  };

  const handlePriceDrag = (evt: any) => {
    if (!sliderWidth) return;
    const x = Math.max(0, Math.min(evt.nativeEvent.locationX, sliderWidth));
    const ratio = x / sliderWidth;
    const rawValue = ratio * 10000000;
    const stepped = Math.round(rawValue / 100000) * 100000;
    setPriceRange([priceRange[0], stepped]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handlePriceDrag,
      onPanResponderMove: handlePriceDrag,
      onPanResponderRelease: handlePriceDrag,
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
          <AppIcon name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetText}>Thiết lập lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khoảng giá</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Tối thiểu</Text>
              <Text style={styles.priceValue}>{formatPrice(priceRange[0])}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Tối đa</Text>
              <Text style={styles.priceValue}>{formatPrice(priceRange[1])}</Text>
            </View>
          </View>
          <View
            style={styles.sliderWrapper}
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${(priceRange[1] / 10000000) * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${(priceRange[1] / 10000000) * 100}%` }]} />
            </View>
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0₫</Text>
            <Text style={styles.sliderLabel}>10.000.000₫</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => toggleCategory(cat.name)}
                  style={[
                    styles.categoryTag,
                    isSelected && styles.categoryTagSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá</Text>
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
                ]}>
                  {rating === star && <AppIcon name="check" size={12} color="#FFFFFF" />}
                </View>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <AppIcon
                      key={i}
                      name="star"
                      size={16}
                      color={i < star ? "#FBBF24" : "#D1D5DB"}
                    />
                  ))}
                  <Text style={styles.ratingText}>trở lên</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khác</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Chỉ hiện sản phẩm còn hàng</Text>
            <Switch
              value={onlyInStock}
              onValueChange={setOnlyInStock}
              trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleApply}
          style={styles.applyButton}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Áp dụng (12 kết quả)</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  priceDivider: {
    width: 16,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  sliderWrapper: {
    width: '100%',
    paddingVertical: 12,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: -11,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  categoryTagSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  categoryTextSelected: {
    color: '#2563EB',
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

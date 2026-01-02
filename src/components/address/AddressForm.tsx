import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../common/Icon';
import { AddressFormValues, AddressType } from '../../lib/address';
import { Theme, lightTheme, useTheme } from '../../lib/theme';

interface AddressFormProps {
  title?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: AddressFormValues) => void;
  initialValues?: Partial<AddressFormValues>;
  theme?: Theme;
}

const EMPTY_FORM: AddressFormValues = {
  name: '',
  phone: '',
  detailedAddress: '',
  ward: '',
  district: '',
  city: '',
  type: 'Nhà riêng',
  isDefault: false,
};

export function AddressForm({
  title = 'Thêm địa chỉ mới',
  submitLabel = 'Lưu địa chỉ',
  onCancel,
  onSubmit,
  initialValues,
  theme,
}: AddressFormProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const t = theme || ctxTheme || lightTheme;

  const mergedInitial = useMemo(() => ({ ...EMPTY_FORM, ...initialValues }), [initialValues]);
  const [formData, setFormData] = useState<AddressFormValues>(mergedInitial);

  useEffect(() => {
    setFormData(mergedInitial);
  }, [mergedInitial]);

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.detailedAddress) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ cụ thể');
      return;
    }
    onSubmit(formData);
  };

  const renderTypeButton = (type: AddressType, label: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setFormData({ ...formData, type })}
      style={[
        styles.typeButton,
        formData.type === type && styles.typeButtonSelected,
        { borderColor: t.border, backgroundColor: t.surface },
        formData.type === type && { borderColor: t.primary, backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' },
      ]}
      activeOpacity={0.7}
    >
      <AppIcon name={icon} size={16} color={formData.type === type ? t.primary : t.muted} />
      <Text style={[
        styles.typeText,
        { color: t.text },
        formData.type === type && { color: t.primary },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 0), backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>
          {title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContent} contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: t.card }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>Họ và tên</Text>
            <TextInput
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder="Nhập họ tên"
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>Số điện thoại</Text>
            <TextInput
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>Tỉnh / Thành phố</Text>
            <TextInput
              value={formData.city}
              onChangeText={text => setFormData({ ...formData, city: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder="Nhập Tỉnh/Thành phố"
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: t.text }]}>Quận / Huyện</Text>
              <TextInput
                value={formData.district}
                onChangeText={text => setFormData({ ...formData, district: text })}
                style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
                placeholder="Quận/Huyện"
                placeholderTextColor={t.muted}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: t.text }]}>Phường / Xã</Text>
              <TextInput
                value={formData.ward}
                onChangeText={text => setFormData({ ...formData, ward: text })}
                style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
                placeholder="Phường/Xã"
                placeholderTextColor={t.muted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>Địa chỉ cụ thể</Text>
            <TextInput
              value={formData.detailedAddress}
              onChangeText={text => setFormData({ ...formData, detailedAddress: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder="Số nhà, tên đường..."
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>Loại địa chỉ</Text>
            <View style={styles.typeContainer}>
              {renderTypeButton('Nhà riêng', 'Nhà riêng', 'home')}
              {renderTypeButton('Văn phòng', 'Văn phòng', 'briefcase')}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            style={styles.checkboxContainer}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              formData.isDefault && styles.checkboxSelected,
              { borderColor: t.border, backgroundColor: t.surface },
              formData.isDefault && { backgroundColor: t.primary, borderColor: t.primary },
            ]}>
              {formData.isDefault && <AppIcon name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: t.text }]}>Đặt làm địa chỉ mặc định</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#111827',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 96,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
